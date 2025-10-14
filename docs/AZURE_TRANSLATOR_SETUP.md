# Azure Translator Setup Guide

## Overview
LearnSpeak uses Azure Translator for AI-powered batch translation of vocabulary words. This guide will help you set up your Azure Translator credentials.

## Prerequisites
- Azure account (free tier available)
- Access to Azure Portal

## Setup Steps

### 1. Create Azure Translator Service

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource**
3. Search for **Translator**
4. Select **Translator** by Microsoft
5. Click **Create**

### 2. Configure Translator Service

Fill in the following details:
- **Subscription**: Choose your subscription
- **Resource group**: Create new or select existing
- **Region**: Choose closest region (e.g., `eastus`, `westus2`, `eastasia`)
- **Name**: Give it a unique name (e.g., `learnspeak-translator`)
- **Pricing tier**: 
  - **Free (F0)**: 2M characters/month translation
  - **Standard (S1)**: Pay-as-you-go, $10 per 1M characters

Click **Review + Create**, then **Create**

### 3. Get Your Credentials

1. Once deployed, go to your Translator resource
2. Click **Keys and Endpoint** in the left menu
3. Copy one of the keys (KEY 1 or KEY 2)
4. Note the **Location/Region** (e.g., `eastus`)
5. Note the **Endpoint** (usually `https://api.cognitive.microsofttranslator.com`)

### 4. Configure LearnSpeak Backend

1. Edit `backend/.env` and set:
   ```bash
   AZURE_TRANSLATOR_KEY=your-key-from-step-3
   AZURE_TRANSLATOR_REGION=eastus  # Your region from step 3
   AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com
   TRANSLATOR_CACHE_ENABLED=true  # Enable caching to reduce costs
   ```

### 5. Test the Setup

1. Start the backend:
   ```bash
   cd backend
   go run main.go
   ```

2. Log in to the frontend as a teacher

3. Go to any topic and click **Bulk Add Words**

4. Enter English words in the "Base Word" column

5. Click **🤖 AI Translate** - translations should appear!

## Pricing Information

### Free Tier (F0)
- **2 million characters per month** free
- Suitable for development and small-scale usage
- ~20,000 typical word translations per month

### Standard Tier (S1)
- **$10 per 1 million characters**
- Pay only for what you use
- Suitable for production

### Cost Estimation Examples
- **1 word** (average 5 characters): $0.00005
- **100 words**: $0.005 (half a cent)
- **1000 words**: $0.05 (5 cents)
- **10,000 words**: $0.50 (50 cents)

**With caching**: Translations are cached, so repeated translations are free!

## Supported Languages

Azure Translator supports **100+ languages**, including:

### For Cantonese Learning Platform
- **English** → **Chinese (Traditional)** (`en` → `zh-Hant`)
- **English** → **Chinese (Simplified)** (`en` → `zh-Hans`)
- Auto language detection available

### Language Codes
- `en` - English
- `zh-Hant` - Traditional Chinese (used in Hong Kong, Taiwan)
- `zh-Hans` - Simplified Chinese (used in Mainland China)
- `yue` - Cantonese (limited support)

## Features Used in LearnSpeak

### 1. **Single Translation**
Endpoint: `POST /api/v1/translate`

Request:
```json
{
  "text": "hello",
  "fromLang": "en",
  "toLang": "zh-Hant",
  "suggestion": true
}
```

Response:
```json
{
  "text": "hello",
  "translation": "你好",
  "detectedLanguage": "en",
  "alternatives": ["哈囉", "您好"],
  "cached": false
}
```

### 2. **Batch Translation**
Endpoint: `POST /api/v1/translate/batch`

Request:
```json
{
  "texts": ["apple", "banana", "orange"],
  "fromLang": "en",
  "toLang": "zh-Hant"
}
```

Response:
```json
{
  "results": [
    {
      "text": "apple",
      "translation": "蘋果",
      "cached": false
    },
    {
      "text": "banana",
      "translation": "香蕉",
      "cached": false
    },
    {
      "text": "orange",
      "translation": "橙",
      "cached": true
    }
  ],
  "total": 3,
  "cached": 1
}
```

## Caching Strategy

LearnSpeak caches translations to minimize API costs:

- **Cache key**: MD5(text + fromLang + toLang)
- **Storage**: `backend/uploads/translation-cache/[hash].json`
- **Benefits**: 
  - Same translation = instant response (no API call)
  - Shared across all teachers
  - Persists across restarts

## Troubleshooting

### Error: "Azure Translator is not configured"
- Check `AZURE_TRANSLATOR_KEY` is set in `.env`
- Verify the key is correct (no extra spaces)
- Restart the backend after changing `.env`

### Error: "Failed to translate"
- Verify `AZURE_TRANSLATOR_REGION` matches your resource region
- Check your Azure subscription is active
- Verify you haven't exceeded free tier limits
- Check Azure Portal for service status

### Translations not appearing
- Check browser console for errors
- Verify the backend is running
- Check the language pair is supported
- Try with a simple test word first

### Poor translation quality
- Azure Translator provides high-quality neural translations
- For educational content, consider:
  - Reviewing AI translations before finalizing
  - Using the alternative suggestions feature
  - Providing context in longer phrases

## Usage in Frontend

### Bulk Word Creation
1. Navigate to any topic
2. Click **Quick Add Words** or **Bulk Add Words**
3. Enter English words in the "Base Word" column
4. Select target language (e.g., "Cantonese (Traditional)")
5. Click **🤖 AI Translate** button
6. Translations appear instantly (cached) or within 1-2 seconds
7. Review and edit translations as needed
8. Add optional audio, images, notes
9. Click **Create & Add Words**

### Translation Tips
- Translate single words for vocabulary
- AI works best with common words and phrases
- Review translations for accuracy (especially idioms)
- Use romanization field for pronunciation guidance
- Leverage caching by translating common words first

## API Rate Limits

- **Translations per second**: 10 requests/second (Free), 100 requests/second (Standard)
- **Characters per request**: 50,000 characters max
- **Batch size**: 100 items max per batch request

LearnSpeak's batch translation automatically handles these limits.

## Best Practices

1. **Enable Caching**: Always keep `TRANSLATOR_CACHE_ENABLED=true`
2. **Batch Processing**: Use batch translate for multiple words (more efficient)
3. **Review Translations**: AI is accurate but not perfect - review important content
4. **Monitor Usage**: Check Azure Portal → Cost Management to track spending
5. **Free Tier First**: Start with free tier, upgrade if needed

## Additional Resources

- [Azure Translator Documentation](https://learn.microsoft.com/en-us/azure/cognitive-services/translator/)
- [Translator REST API Reference](https://learn.microsoft.com/en-us/azure/cognitive-services/translator/reference/v3-0-reference)
- [Language Support](https://learn.microsoft.com/en-us/azure/cognitive-services/translator/language-support)
- [Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/)

## Security Best Practices

1. **Never commit** `.env` file to git
2. Use **environment variables** in production
3. **Rotate keys** periodically
4. Use **Azure Key Vault** for production deployments
5. **Monitor usage** for unexpected spikes (could indicate leaked keys)

---

**Note**: Azure Translator and Azure TTS are separate services. You need to set up both for full functionality:
- **Azure TTS**: Audio generation (see `docs/AZURE_TTS_SETUP.md`)
- **Azure Translator**: Text translation (this guide)
