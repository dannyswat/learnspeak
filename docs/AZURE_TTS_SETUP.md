# Azure Text-to-Speech Setup Guide

## Overview
LearnSpeak uses Azure Cognitive Services Speech SDK for text-to-speech audio generation. This guide will help you set up your Azure TTS credentials.

## Prerequisites
- Azure account (free tier available)
- Access to Azure Portal
- **macOS only**: Azure Speech SDK C library (automated install script provided)

## macOS Setup - Install Speech SDK

**Before configuring Azure credentials**, you need to install the Azure Speech SDK C library on macOS:

```bash
cd backend
./setup-speech-sdk.sh
```

This script will:
- Download Azure Speech SDK v1.43.0 for macOS
- Extract it to `backend/lib/speechsdk/`
- Clean up temporary files

The SDK is about 12MB and is required for the Go Speech SDK to work.

**Note**: The `lib/` directory is in `.gitignore` and won't be committed to git.

## Setup Steps

### 1. Create Azure Speech Service

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource**
3. Search for **Speech**
4. Select **Speech** by Microsoft
5. Click **Create**

### 2. Configure Speech Service

Fill in the following details:
- **Subscription**: Choose your subscription
- **Resource group**: Create new or select existing
- **Region**: Choose closest region (e.g., `eastus`, `westus2`, `eastasia`)
- **Name**: Give it a unique name (e.g., `learnspeak-tts`)
- **Pricing tier**: 
  - **Free (F0)**: 5 audio hours/month, up to 500k characters/month
  - **Standard (S0)**: Pay-as-you-go, $1 per 1M characters (Cantonese)

Click **Review + Create**, then **Create**

### 3. Get Your Credentials

1. Once deployed, go to your Speech resource
2. Click **Keys and Endpoint** in the left menu
3. Copy one of the keys (KEY 1 or KEY 2)
4. Note the **Location/Region** (e.g., `eastus`)

### 4. Configure LearnSpeak Backend

1. Copy `.env.example` to `.env` in the backend directory:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `backend/.env` and set:
   ```bash
   AZURE_TTS_KEY=your-key-from-step-3
   AZURE_TTS_REGION=eastus  # Your region from step 3
   TTS_VOICE_CANTONESE=zh-HK-HiuGaaiNeural  # Default Cantonese voice
   TTS_CACHE_ENABLED=true  # Enable caching to reduce costs
   ```

### 5. Test the Setup

1. Start the backend:
   ```bash
   cd backend
   sh run.sh
   ```

2. Log in to the frontend and try creating a word with a translation

3. Click **🎙️ Generate Audio** - audio should be generated and cached

## Pricing Information

### Free Tier (F0)
- **5 audio hours per month** (300 minutes)
- **500,000 characters per month**
- Good for development and small-scale testing

### Standard Tier (S0)
- **Neural voices (high quality)**: $16 per 1M characters
- **Standard voices**: $4 per 1M characters
- Cantonese uses neural voices

### Cost Estimation Examples
- **1 word** (average 3 characters): $0.000048
- **1000 words**: $0.048 (less than 5 cents)
- **10,000 words**: $0.48 (less than 50 cents)

**With caching**: Same audio reused across all students, so cost is one-time per unique word/phrase.

## Available Cantonese Voices

LearnSpeak defaults to `zh-HK-HiuGaaiNeural` (female voice), but you can change it in `.env`:

- **zh-HK-HiuGaaiNeural** - Female, friendly
- **zh-HK-HiuMaanNeural** - Female, calm
- **zh-HK-WanLungNeural** - Male, clear

Preview voices at: https://speech.microsoft.com/portal/voicegallery

## Caching Strategy

LearnSpeak caches generated audio using MD5 hashing:
- **Cache key**: MD5(text + voice + language)
- **Storage**: `backend/uploads/tts-cache/[hash].mp3`
- **Benefits**: 
  - Same word = same audio file (no duplicate API calls)
  - Reused across all students
  - Persists across restarts

## Troubleshooting

### Error: "Azure TTS is not configured"
- Check `AZURE_TTS_KEY` is set in `.env`
- Verify the key is correct (no extra spaces)
- Restart the backend after changing `.env`

### Error: "Failed to synthesize speech"
- Verify `AZURE_TTS_REGION` matches your Speech resource region
- Check your Azure subscription is active
- Verify you haven't exceeded free tier limits

### Audio not playing
- Check browser console for errors
- Verify audio file exists in `uploads/tts-cache/`
- Check file permissions (should be readable)

### Poor audio quality
- Azure neural voices are high quality by default
- Check `speechConfig.SetSpeechSynthesisOutputFormat()` is set to MP3 16kHz
- Verify you're using a neural voice (ends with `Neural`)

## Additional Resources

- [Azure Speech Service Documentation](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/)
- [Azure Speech SDK for Go](https://github.com/Microsoft/cognitive-services-speech-sdk-go)
- [Voice Gallery](https://speech.microsoft.com/portal/voicegallery)
- [Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/)

## Security Best Practices

1. **Never commit** `.env` file to git
2. Use **environment variables** in production
3. **Rotate keys** periodically
4. Use **Azure Key Vault** for production deployments
5. **Monitor usage** in Azure Portal to detect anomalies
