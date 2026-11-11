# Poster Studio

A browser-based poster editor with AI background generation.

## Frontend files
- `index.html`
- `Style.css`
- `Script.js`

## AI backend
- `api/generate.js` — Vercel serverless function. It calls the OpenAI Images API without exposing your secret key in the browser.
- `vercel.json` — allows enough function time for image generation.

## Deploy
1. Push the complete folder to GitHub.
2. Import the repository into Vercel and deploy it.
3. In Vercel, open **Project Settings → Environment Variables**.
4. Add `OPENAI_API_KEY` with your OpenAI API key. Never put this key in `Script.js`, HTML, or a public GitHub file.
5. Redeploy after adding the environment variable.

The AI generation feature calls `/api/generate`, so it needs the Vercel deployment. GitHub Pages alone only hosts static files and cannot run this API function.

## Local preview
You can preview the manual editor with a local static server. AI generation will work only when the `/api/generate` serverless endpoint is available and configured.

## Notes
- AI image generation is a paid API feature; usage is billed to your OpenAI API account.
- The generated image is used as the poster background. Company name, logo and editable text are overlaid in the browser editor.
- The editor stores company name, tagline and contact details in browser local storage on that device.
