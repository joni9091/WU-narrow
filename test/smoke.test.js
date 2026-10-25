import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let nextPort = 40500 + Math.floor(Math.random()*1000);
async function boot(config = {}) {
  const port = nextPort++;
  const child = spawn(process.execPath, ['server.js'], { cwd: root, stdio:'pipe', env:{...process.env, PORT:String(port),HOST:'127.0.0.1',GEMINI_API_KEY:'',...config} });
  const url=`http://127.0.0.1:${port}`;
  for(let i=0;i<100;i++) { try { const r = await fetch(url+'/api/health'); if(r.ok) return { url, child }; } catch {} if(child.exitCode!==null) break; await wait(40); }
  child.kill(); throw new Error('Server failed to start');
}
async function post(base,route,body) {return fetch(base+route, { method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body) });}

// Demo / missing key: cannot accidentally expose server-side secrets.
test('serves all client files and hides .env / server source', async () => {
  const {url,child} = await boot();
  try {
    for (const p of ['/','/index.html','/app.js','/styles.css','/favicon.svg']) {
      const r=await fetch(url+p); assert.equal(r.status,200,p);
    }
    const html=await (await fetch(url+'/')).text(); assert.match(html,/Narrow AI Studio/);
    const st=await (await fetch(url+'/api/status')).json();
    assert.deepEqual(st.providers,{gemini:false}); assert.equal(st.apiKeyConfigured,false);
    assert.deepEqual(st.models.gemini,['gemini-3.5-flash-lite','gemini-3.8-flash','gemini-3.6-flash']);
    for(const p of ['/.env','/.env.example','/server.js','/package.json','/test/smoke.test.js','/../server.js']) {
      const r=await fetch(url+p);assert.equal(r.status,404,p);
    }
    const absent=await post(url,'/api/chat',{model:'gemini-3.5-flash-lite',messages:[{role:'user',content:'Hi'}]});
    assert.equal(absent.status,503); assert.match((await absent.json()).error,/Gemini API key is missing/);
    const plain=await fetch(url+'/api/chat',{method:'POST',headers:{'content-type':'text/plain'},body:'{}'});
    assert.equal(plain.status,415,'cross-site simple POST must be rejected');
    await new Promise(done=>{const sock=net.connect(new URL(url).port,'127.0.0.1',()=>sock.end('GET / HTTP/1.1\r\nHost: [bad\r\n\r\n'));sock.on('data',()=>{});sock.on('close',done);sock.on('error',done);});
    assert.equal((await fetch(url+'/api/health')).status,200,'malformed Host header must not crash the server');
  } finally { child.kill(); }
});

test('mocked Gemini validates live connection and returns real provider result fields',async()=>{
  const requests=[];
  const mock = http.createServer(async(req,res)=>{
    let body='';for await(const c of req)body+=c;
    requests.push({url:req.url, body:JSON.parse(body), key:req.headers['x-goog-api-key']});
    res.writeHead(200,{'content-type':'application/json'});
    res.end(JSON.stringify({candidates:[{content:{role:'model',parts:[{text:'OK from mocked Gemini'}]},finishReason:'STOP'}]}));
  });
  const upstream=nextPort++;
  await new Promise(r=>mock.listen(upstream,'127.0.0.1',r));
  const api=await boot({ GEMINI_API_KEY:'SECRET_TEST_KEY',GEMINI_API_BASE_URL:`http://127.0.0.1:${upstream}/v1beta` });
  try{
    const st=await(await fetch(api.url+'/api/status')).json(); assert.equal(st.providers.gemini,true);assert.equal(JSON.stringify(st).includes('SECRET_TEST_KEY'),false);
    const smoke=await post(api.url,'/api/test',{model:'gemini-3.5-flash-lite'});
    assert.equal(smoke.status,200);assert.equal((await smoke.json()).text,'OK from mocked Gemini');
    const chat=await post(api.url,'/api/chat',{model:'gemini-3.8-flash',messages:[{role:'user',content:'Write a caption about a café.'}]});
    assert.equal(chat.status,200); assert.equal((await chat.json()).provider,'gemini');
    for(const platform of ['facebook','tiktok','instagram','linkedin','youtube'])for(const type of ['caption','post','hashtag','cta','idea','marketing']){
      const gen=await post(api.url,'/api/generate',{model:'gemini-3.5-flash-lite',platform,type,topic:'new coffee shop',language:'Khmer',tone:'Friendly',audience:'students',details:'Locally roasted beans',maxTokens:1800});
      assert.equal(gen.status,200,`${platform}/${type}`); assert.equal((await gen.json()).provider,'gemini');
    }
    assert.equal(requests.length,32);
    const a=requests.at(-1);assert.match(a.url,/gemini-3\.5-flash-lite:generateContent$/);assert.equal(a.key,'SECRET_TEST_KEY');
    assert.equal(a.body.generationConfig.maxOutputTokens,1800);
    assert.ok(a.body.systemInstruction.parts[0].text.includes('specialized'));
    assert.match(a.body.contents[0].parts[0].text,/Khmer \(written in Khmer script\)/);
    assert.equal(JSON.stringify(a.body).includes('SECRET_TEST_KEY'),false);
  }finally{api.child.kill();await new Promise(r=>mock.close(r));}
});

test('server rejects invalid models, blank input, wrong generator dimensions, oversize content', async()=>{
 const {url,child}=await boot({GEMINI_API_KEY:'EXAMPLE_ONLY',GEMINI_API_BASE_URL:'http://127.0.0.1:1/v1beta'});
 try{
  const cases=[
   ['/api/chat',{model:'fake',messages:[{role:'user',content:'Hi'}]}],
   ['/api/chat',{model:'gemini-3.5-flash-lite',messages:[]}],
   ['/api/generate',{model:'gemini-3.5-flash-lite',platform:'invalid',type:'caption',topic:'coffee'}],
   ['/api/generate',{model:'gemini-3.5-flash-lite',platform:'facebook',type:'caption',topic:'   '}],
  ];
  for(const [urlPath,body] of cases){ const r=await post(url,urlPath,body);assert.equal(r.status,400,urlPath); }
  const tooBig=await post(url,'/api/chat',{model:'gemini-3.5-flash-lite',messages:[{role:'user',content:'a'.repeat(70000)}]}); assert.equal(tooBig.status,413);
 }finally{child.kill();}
});

test('upstream failures produce honest, actionable errors without leaking credentials',async()=>{
 const mock=http.createServer((_req,res)=>{res.writeHead(429,{'content-type':'application/json'});res.end(JSON.stringify({error:{message:'Quota exhausted for SECRET_TEST_KEY'}}));});
 const port=nextPort++;await new Promise(r=>mock.listen(port,'127.0.0.1',r));
 const {url,child}=await boot({GEMINI_API_KEY:'SECRET_TEST_KEY',GEMINI_API_BASE_URL:`http://127.0.0.1:${port}/v1beta`});
 try {
  const r=await post(url,'/api/test',{model:'gemini-3.5-flash-lite'});assert.equal(r.status,429);
  const body=await r.json();assert.match(body.error,/Quota or rate limit reached/);assert.ok(!body.error.includes('SECRET_TEST_KEY'));assert.ok(body.error.includes('[REDACTED]'));
 }finally{child.kill();await new Promise(r=>mock.close(r));}
});
