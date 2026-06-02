# English | Persian → Portuguese Real-Time Voice Translator

A minimalist web application that translates English or Persian speech to Portuguese in real-time using OpenAI's `gpt-realtime-translate` model.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black)
![Tech Stack](https://img.shields.io/badge/OpenAI-Realtime%20API-purple)
![Tech Stack](https://img.shields.io/badge/WebRTC-Speech--to--Speech-blue)

## Features

- Real-time speech-to-speech translation
- Two source languages: **English** and **Persian (Farsi)**
- Output to **Portuguese**
- Live transcripts for both source and translated audio
- Minimalist Vercel-style interface
- WebRTC-based direct connection to OpenAI (no audio stored on server)

## How It Works

The app uses OpenAI's `gpt-realtime-translate` model which handles:
- Streaming speech-to-speech translation
- 70+ input languages, 13 output languages
- Real-time transcript generation

Architecture:
```
Browser (mic) → Next.js API (client secret) → OpenAI WebRTC → Translated audio + transcripts
```

## Prerequisites

- Node.js 18+
- OpenAI API key with access to the Realtime API

## OpenAI API Configuration

### 1. Get an OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com) and sign in
2. Navigate to **API Keys** → **Create new secret key**
3. Copy and save the key immediately (it won't be shown again)

### 2. Verify Access to `gpt-realtime-translate`

The `gpt-realtime-translate` model requires:
- A paid OpenAI account (free tier does not include Realtime API)
- An API key with Realtime API access

To verify access:
1. Go to [platform.openai.com/realtime](https://platform.openai.com/realtime)
2. Check if the translation model appears in the playground

If you get a `model_not_found` error:
- Add a payment method at [platform.openai.com/settings/billing/payment-methods](https://platform.openai.com/settings/billing/payment-methods)
- The Realtime API requires paid credits

### 3. Pricing

The `gpt-realtime-translate` model costs **$0.034 per minute** of audio processed.

Monitor your usage at [platform.openai.com/usage](https://platform.openai.com/usage).

## Local Development Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd english-portuguese-translator
corepack enable
pnpm install
```

### 2. Configure Environment Variable

Create a `.env.local` file in the project root:

```bash
OPENAI_API_KEY=sk-your-key-here
```

**Important**: Never commit `.env.local` to git. It's already in `.gitignore` by default with Next.js.

### 3. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Test the Translation

1. Select a source language (English or Persian) from the dropdown
2. **Hold** the microphone button while speaking
3. Allow browser access to your microphone when prompted
4. Release when done — your speech is translated to Portuguese
5. Both transcripts appear in real-time as you speak

## Vercel Deployment

### Option 1: Vercel CLI

```bash
# Install Vercel CLI globally
pnpm add -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Deploy to production
vercel --prod

# Set environment variable via CLI
vercel env add OPENAI_API_KEY
```

### Option 2: Vercel Dashboard

1. Push the code to GitHub
2. Import the repository in [vercel.com](https://vercel.com)
3. Add the environment variable:
   - Go to **Settings** → **Environment Variables**
   - Name: `OPENAI_API_KEY`
   - Value: `sk-your-key-here`
   - Environments: Select all (Production, Preview, Development)
4. Deploy

### After Deployment

The app requires your OpenAI API key to function. Make sure to add `OPENAI_API_KEY` as an environment variable in your Vercel project settings.

## Usage Tips

- Use headphones to avoid audio feedback loops
- Speak clearly at a normal pace
- The translation outputs Portuguese (`pt`) — OpenAI's Realtime Translate API doesn't support regional variants like `pt-PT`
- Both source and translated transcripts appear in real-time
- Translated audio plays through your speakers automatically

## Troubleshooting

### "Failed to create session" error

- Verify your `OPENAI_API_KEY` is correctly set
- Ensure your OpenAI account has access to the Realtime API (paid account required)
- Check your API key hasn't exceeded rate limits

### No audio output

- Allow microphone and speaker permissions in browser
- Ensure your speakers aren't muted
- Check that your browser supports WebRTC (Chrome, Firefox, Edge, Safari)

### High latency

- Check your internet connection
- The translation processes audio in real-time, so some latency is expected
- Close other bandwidth-intensive applications

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Runtime**: Vercel Serverless Functions (API route for auth only)
- **Audio**: WebRTC (browser-native)
- **Model**: `gpt-realtime-translate` by OpenAI
- **Styling**: CSS Modules

## License

MIT