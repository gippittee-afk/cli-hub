<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Wajx_s8z-sDbh1_urv2Hix7b4qCNNNrE

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Release checklist

1. Ensure `GEMINI_API_KEY` is set in the deployment environment used for the build.
2. Verify outbound HTTPS access to `api.github.com` for live metadata sync.
3. Build the production bundle: `npm run build`
4. Serve the `dist/` output with a static host or CDN.
5. After deploy, trigger a "FORCE_SYNC" to validate metadata ingestion.
