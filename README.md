# Narrow AI Studio — Gemini Edition (VS Code)

**Narrow AI Application with Chatbot API** — university project. Narrow scope: **social media content generation and marketing**, powered by the **Google Gemini API**.

This is a real local web application, not just a website image. It was built with plain HTML, CSS, vanilla JavaScript and a Node.js HTTP server, so **no npm packages, XAMPP, Python, database, or paid hosting are required to run the website locally**. Real AI generation requires a **valid Google Gemini API key and an internet connection**, subject to Google's access and usage limits.

## Start on Windows with VS Code (you already have Node.js installed)

1. **Extract** `narrow-ai-studio-gemini-vscode.zip` (right-click → Extract All).
2. In VS Code, choose **File → Open Folder**, select the newly extracted **`narrow-ai-studio`** folder (the folder containing `server.js`, `app.js`, `package.json`). Do not open the old project folder.
3. Select **Terminal → New Terminal** (shortcut **Ctrl + `**).
4. Check Node.js: `node -v`. Your installed **v24.22.0** is suitable.
5. Start the server with:

   ```powershell
   npm.cmd start
   ```

   This uses `npm.cmd` because Windows PowerShell may block `npm.ps1` scripts.
   **Alternative:** `node server.js` — this also works with Node.js installed.
6. Keep the terminal open. In Chrome, visit **http://127.0.0.1:3000** (or http://localhost:3000).
7. To stop the website, press **Ctrl+C** in the VS Code terminal.

**Easiest alternative:** double-click `start-windows.bat` in the extracted project folder. It starts the same Node server.

## Activate Google Gemini AI (required for REAL generated content)

1. Sign in to **Google AI Studio** at **https://aistudio.google.com/api-keys**.
2. Use the **API Keys** page to create a Gemini API key in your Google Cloud project (or copy your existing key). If prompted, accept Google's terms and configure the project. Google may require billing for some models/accounts.
3. Return to VS Code. In the left file Explorer, locate **`.env.example`**.
4. Right-click `.env.example` → **Copy**, then paste in the same folder, and rename the copy to **`.env`** (exactly `.env`; NOT `.env.txt`). You can also create a new file named `.env`.
5. Edit `.env` so the line looks like this, replacing the fake value with your own key:

   ```env
   GEMINI_API_KEY=PASTE_YOUR_ACTUAL_GEMINI_KEY_HERE
   PORT=3000
   HOST=127.0.0.1
   ```

6. **Save** `.env` (**Ctrl+S**). **Never share or screenshot your API key.** The file is excluded from version control by `.gitignore` and is never served to the browser.
7. Restart the terminal server (**Ctrl+C**, then `npm.cmd start`). In the output, check that it says **Gemini API key: configured (test it in the browser)**.
8. Refresh Chrome, go to **API Settings**, choose a model and click **Test Live Gemini Connection**. A connection is only reported as successful when the Google API actually replies.
9. Go to **Social Media Generator** → choose a platform and content type, enter a topic, set tone and language → **Generate with AI**. Or go to **AI Chatbot** and ask about social media marketing.

**Recommended initial model:** `gemini-3.6-flash` (default; best Khmer output). For faster replies try `gemini-3.5-flash-lite`, or `gemini-3.8-flash` for advanced output, in API Settings. The supported IDs reflect Google's model documentation as of October 2026. Model availability, rate limits and charges depend on your Google AI Studio account.

**No key?** You can still explore all pages and use **Try Demo Template**, but this produces clearly labeled **non-AI example content** and is not a substitute for the assignment's real Chatbot API integration.

## Assignment requirements coverage

| Assignment | Implemented |
| --- | --- |
| Narrow AI topic | Social media marketing and content writing only, restricted through a specialized system instruction |
| AI API | Real **Google Gemini** `generateContent` requests from the Node server |
| Social platforms | Facebook, TikTok, Instagram, LinkedIn, YouTube |
| Seven outputs | Caption, Post, Hashtag, Call-to-Action, Content Idea, Marketing Message, Video Script (+ Send to Google Flow / Meta AI / CapCut) |
| Prompt engineering | Dedicated **Prompt Builder** (editable prompt) plus structured server-side generation prompts |
| Inputs and outputs | Topic, audience, product facts, tone, length, language (English/Khmer), prompts; generated text and export |
| Chatbot | Multi-turn marketing assistant with chat history, input/send/clear/copy |
| API setup | Private server-side `.env` key, model selection, genuine API connection test |
| UI/UX | Responsive desktop / phone dashboard, clear navigation, Khmer/English headings |
| Save and retrieve | Browser-only Saved Content page, search/filter/copy/restore/delete |
| Testing | Automated Node.js API tests + independent manual checklist for student tester |
| Documentation | Built-in project documentation + this README + `SETUP_WINDOWS.md` |
| Group members | Five editable roles (Team Leader, UI/UX, Developer, AI Prompt & API, Tester/Documentation) |

## How the AI request works

```text
Browser (index.html + styles.css + app.js)
       |
       +-- POST /api/chat        -> focused multi-turn social media chatbot
       +-- POST /api/generate    -> structured content request (platform/type/topic...)
       +-- POST /api/test        -> genuine model ping
       +-- GET  /api/status      -> key presence and allowed models (never the key)
       |
Node.js server.js
       | reads GEMINI_API_KEY from private .env
       | adds strict narrow-AI system instructions
       | validates input & model, caps tokens & request size
       v
Google Gemini REST API (HTTPS generateContent)
       |
       v
Real Gemini text -> browser output -> copy / save / export
```

## Run automated tests

After opening the project folder in VS Code:

```powershell
npm.cmd run check
npm.cmd test
```

The automated tests use a **mocked Gemini HTTP endpoint**, rather than consuming your real API credit. They validate real HTTP request/response structure, endpoint selection, privacy, security and errors, and all **5 × 6 = 30 platform/content-type combinations**. They do **not** prove a Google account's API key is active. Only **Test Live Gemini Connection** confirms your live account.

The Testing page in the website has **14 manual items** the team must actually perform and tick individually.

## Troubleshooting

- **`npm.ps1 cannot be loaded`** → use `npm.cmd start` or `node server.js`.
- **`node is not recognized`** → install Node.js LTS and reopen VS Code. This user previously installed v24.22.0, which is supported.
- **Page can't be reached** → keep the terminal running; open http://127.0.0.1:3000, not a `file:///` URL.
- **Port 3000 already in use** → stop the older Node server with Ctrl+C; or set `PORT=3001` in `.env` and open http://127.0.0.1:3001.
- **Gemini API key missing** → check filename `.env`, line `GEMINI_API_KEY=...`, save, restart server and refresh browser.
- **401/403** → check key permissions, billing / account access, or regenerate the key in Google AI Studio.
- **404 model error** → try another model from the model dropdown. Google periodically updates model availability.
- **429 / quota exceeded** → rate limit or usage allowance; check Google AI Studio usage and billing. Repeated retries may not help.
- **No real content** → first use API Settings → Test Live Gemini Connection; then try Generate with AI again.
- **Khmer output not in Khmer** → explicitly select Khmer in the generator (or use the top output-language switch). The result still depends on the model's quality.
- **`npm install`?** Not required; this app has no external Node dependencies.
- **Saving data** → only text/non-secret preferences are saved in your current Chrome browser's localStorage; if you clear site data, they're gone.

## Security and limitations

- API key is read **only by Node server.js**. Do not paste it into `app.js` or website form fields. Never include a `.env` file when submitting the project to other students or GitHub.
- This is a **local teaching/demo project** bound to `127.0.0.1` by default; it is **not intended for public deployment** without login/authentication, rate limiting, per-user usage limits and other protections.
- Generated marketing content must be reviewed by a human, especially factual claims about products.
- The labels “Gemini key configured” do not mean the API is working; only the separate live connection test proves that.
- This project intentionally uses **one AI provider**, Google Gemini, as allowed by the assignment.

## Files

```text
narrow-ai-studio/
├── index.html           Website shell
├── styles.css           Design + phone responsiveness
├── app.js               All nine interactive pages
├── server.js            Local HTTP server + secure Gemini API proxy
├── package.json         npm.cmd start/check/test
├── .env.example         Template (copy to your private .env)
├── .gitignore           Ignore real .env
├── start-windows.bat    Double-click Windows launcher
├── favicon.svg          Site icon
├── SETUP_WINDOWS.md     Short Windows checklist
├── README.md            Full documentation
└── test/smoke.test.js   Automated HTTP tests
```
