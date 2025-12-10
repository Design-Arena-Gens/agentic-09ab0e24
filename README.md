# Agentic YouTube Upload Agent

This project is a fully automated uploader that ingests a video file or direct download link, generates SEO-optimized metadata, and publishes the content to YouTube using a connected Google account. It is built with Next.js 14, Tailwind CSS, and the official Google APIs SDK, and is deployable on Vercel.

## Requirements

- Node.js 18+
- npm 9+
- Google Cloud project with YouTube Data API v3 enabled
- OAuth2 credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`)
- Refresh token for the authorized YouTube channel (`YOUTUBE_REFRESH_TOKEN`)

## Setup

```bash
npm install
```

Create a `.env.local` file with the following variables:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri
YOUTUBE_REFRESH_TOKEN=refresh_token_with_youtube_upload_scope
```

## Development

```bash
npm run dev
```

Visit `http://localhost:3000` to use the uploader. Provide either a video file (up to 500MB) or a public URL, select the video category, language, monetization preference, and optionally schedule a publish time.

## Production Build

```bash
npm run build
npm start
```

## Deployment

Deploy to Vercel with the preconfigured token:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-09ab0e24
```

After deployment, verify the production URL:

```bash
curl https://agentic-09ab0e24.vercel.app
```

## Features

- Single-step form that validates required inputs and enforces a single video source
- Heuristic SEO generation for title, description, tags, hashtags, and thumbnail prompt tailored to category
- Direct upload to YouTube via OAuth2 refresh tokens with optional scheduling support
- Final summary pane with all publishing details, including canonical YouTube URL
