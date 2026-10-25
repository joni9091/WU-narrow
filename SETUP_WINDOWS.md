# Windows + VS Code: quick setup

You already have **Node.js v24.22.0**, so you DO NOT need to reinstall Node.js.

## Step 1 — Open the NEW folder

1. Download `narrow-ai-studio-gemini-vscode.zip`.
2. Right-click the ZIP → **Extract All**.
3. VS Code → **File → Open Folder** → choose the extracted `narrow-ai-studio` folder.
4. If you still have the previous website open, stop its terminal with **Ctrl+C**.

## Step 2 — Get a Gemini API key

1. Open https://aistudio.google.com/api-keys and sign in with Google.
2. Use **Create API Key** and copy the new key.
3. In VS Code, make a copy of `.env.example` and rename it **`.env`** (not `.env.txt`).
4. Edit and save `.env`:

```env
GEMINI_API_KEY=YOUR_REAL_KEY_HERE
PORT=3000
HOST=127.0.0.1
```

Do **not** send your API key to anyone, including in chat or screenshots.

## Step 3 — Start your website

VS Code → **Terminal → New Terminal**. Run:

```powershell
node -v
npm.cmd start
```

If PowerShell complains about `npm.ps1`, **do not use `npm`**. `npm.cmd start` or `node server.js` is correct.

Your terminal should show:

```text
Narrow AI Studio / Gemini Edition — http://127.0.0.1:3000
Gemini API key: configured (test it in the browser)
```

In Chrome, open **http://127.0.0.1:3000**.

## Step 4 — Confirm it really works

1. Click **API Settings** → **Test Live Gemini Connection**.
2. After a real success response, open **Social Media Generator**.
3. Choose **Facebook**, choose **Caption**, enter `Grand opening of my coffee shop`.
4. Select Friendly / English → **Generate with AI**.
5. Switch language to Khmer and generate again.
6. Click **Save**, then visit **Saved Content**.
7. Visit **AI Chatbot**; type `Suggest three TikTok video ideas for a coffee shop` and send.
8. Use the **Testing** page to tick checks you have actually verified.

**No key?** The app still opens and Demo Template works, but real AI does not run without a key.

## Step 5 — Stop and restart later

- Stop: press **Ctrl+C** in your terminal.
- Run next time: open VS Code folder, run `npm.cmd start`, open http://127.0.0.1:3000.
- No `npm install` is necessary.

**If you see an error**, copy the **error text only**, without revealing any secret API key, and share that text for troubleshooting.
