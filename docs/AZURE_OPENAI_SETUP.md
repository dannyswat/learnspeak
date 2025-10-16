# Azure OpenAI DALL-E 3 Setup Guide

This guide explains how to set up Azure OpenAI with DALL-E 3 for AI-powered image generation in LearnSpeak.

## Overview

LearnSpeak uses **Azure OpenAI DALL-E 3** to generate educational, child-safe images for vocabulary words. This feature helps teachers quickly create visual learning materials.

## Prerequisites

1. **Azure Account**: Active Azure subscription
2. **Azure OpenAI Service**: Access to Azure OpenAI (requires application approval)
3. **DALL-E 3 Deployment**: DALL-E 3 model deployed in your Azure OpenAI resource

## Step 1: Create Azure OpenAI Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Azure OpenAI"
4. Click "Create" and fill in:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing
   - **Region**: Choose a region (e.g., `East US`, `West Europe`)
     - For Hong Kong: Use `East Asia` or nearest region
   - **Name**: Your resource name (e.g., `learnspeak-openai`)
   - **Pricing Tier**: Standard S0

5. Click "Review + Create" → "Create"

## Step 2: Deploy DALL-E 3 Model

1. Navigate to your Azure OpenAI resource
2. Click "Model deployments" in the left menu
3. Click "Create new deployment"
4. Fill in deployment details:
   - **Select a model**: Choose `dall-e-3`
   - **Model version**: Latest available (e.g., `3.0`)
   - **Deployment name**: `dall-e-3` (or your preferred name)
   - **Content filter**: Default (recommended for child-safe content)
   
5. Click "Create"
6. Wait for deployment to complete (usually 1-2 minutes)

## Step 3: Get API Keys and Endpoint

1. In your Azure OpenAI resource, go to "Keys and Endpoint"
2. Copy the following:
   - **KEY 1** (or KEY 2)
   - **Endpoint** (e.g., `https://YOUR-RESOURCE.openai.azure.com/`)

## Step 4: Configure Environment Variables

Add the following to your `.env` file in the backend directory:

```bash
# Azure OpenAI Configuration
AZURE_OPENAI_KEY=your_azure_openai_key_here
AZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=dall-e-3

# Image Generation Cache (optional)
IMAGE_CACHE_ENABLED=true
```

### Configuration Details

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_OPENAI_KEY` | Your Azure OpenAI API key | `abc123...` |
| `AZURE_OPENAI_ENDPOINT` | Your Azure OpenAI endpoint URL | `https://learnspeak.openai.azure.com/` |
| `AZURE_OPENAI_DEPLOYMENT` | Name of your DALL-E 3 deployment | `dall-e-3` |
| `IMAGE_CACHE_ENABLED` | Enable/disable image caching | `true` or `false` |

## Step 5: Test the Integration

### Backend Test

```bash
cd backend
sh run.sh
```

Check the logs for:
```
✅ Image generation service initialized
```

### Frontend Test

1. Log in as a teacher
2. Go to "Create Word" or "Bulk Word Creation"
3. Enter a word (e.g., "apple")
4. Click "🎨 Generate Image"
5. Wait 10-30 seconds for image generation
6. Image should appear automatically

## Features

### Educational Image Generation

- **Child-Safe Prompts**: All prompts are designed for children ages 4-12
- **Cartoon Style**: Cute, colorful illustrations suitable for learning
- **Context-Aware**: Uses both base word and translation for better results
- **Customizable**: Size, quality, and style options available

### Caching System

Generated images are cached locally to:
- Reduce API costs
- Speed up repeated requests
- Work offline with previously generated images

Cache location: `backend/uploads/image-cache/`

### Image Options

| Parameter | Options | Default | Description |
|-----------|---------|---------|-------------|
| `size` | `1024x1024`, `1792x1024`, `1024x1792` | `1024x1024` | Image dimensions |
| `quality` | `standard`, `hd` | `standard` | Image quality (HD costs more) |
| `style` | `vivid`, `natural` | `vivid` | Image style (vivid = more dramatic) |

## Pricing

### DALL-E 3 Pricing (as of January 2025)

| Quality | Size | Price per Image |
|---------|------|-----------------|
| Standard | 1024×1024 | $0.040 |
| Standard | 1024×1792, 1792×1024 | $0.080 |
| HD | 1024×1024 | $0.080 |
| HD | 1024×1792, 1792×1024 | $0.120 |

### Cost Estimation

- **100 vocabulary words**: $4.00 - $12.00 (depending on quality)
- **500 vocabulary words**: $20.00 - $60.00
- **With caching**: Costs only apply to new/unique images

## Best Practices

### 1. Use Standard Quality

For educational purposes, `standard` quality is sufficient and costs 50% less than HD.

### 2. Enable Caching

Keep `IMAGE_CACHE_ENABLED=true` to avoid regenerating identical images.

### 3. Batch Operations

Use the "Bulk Word Creation" page to generate multiple images efficiently.

### 4. Review Generated Images

Always review AI-generated images before using them with students, as DALL-E 3 may occasionally produce unexpected results.

### 5. Prompt Engineering

The system uses pre-built prompts optimized for educational content:
```
A cute, colorful cartoon illustration of '{word}' ({translation}) 
designed for children learning Cantonese. The image should be simple, 
bright, cheerful, and educational. Safe for children ages 4-12.
```

## Troubleshooting

### Error: "AZURE_OPENAI_KEY is not configured"

**Solution**: Add `AZURE_OPENAI_KEY` to your `.env` file.

### Error: "Failed to generate image: 401 Unauthorized"

**Solution**: 
- Check that your API key is correct
- Verify the key hasn't expired
- Ensure the endpoint URL is correct

### Error: "Failed to generate image: 404 Not Found"

**Solution**:
- Verify your deployment name matches `AZURE_OPENAI_DEPLOYMENT`
- Check that DALL-E 3 is deployed in your Azure OpenAI resource

### Error: "Failed to generate image: 429 Too Many Requests"

**Solution**:
- You've hit rate limits
- Wait a few minutes and try again
- Consider upgrading your Azure OpenAI pricing tier

### Slow Image Generation (>60 seconds)

**Causes**:
- Azure region distance (use closer region)
- High Azure load (try different time)
- Network latency

**Solutions**:
- Use Hong Kong-friendly region (`East Asia`)
- Implement retry logic
- Generate images in advance during off-peak hours

## Security Considerations

### API Key Protection

- **Never commit** `.env` file to Git
- Use Azure Key Vault for production
- Rotate keys regularly (every 90 days)

### Content Safety

- Azure OpenAI includes built-in content filters
- All prompts are designed for child-safe content
- Teachers should review generated images

### Access Control

- Only teachers and admins can generate images
- Learners cannot access image generation endpoints
- Rate limiting recommended for production

## API Endpoints

### Generate Single Image

```http
POST /api/v1/images/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "word": "apple",
  "translation": "蘋果",
  "size": "1024x1024",
  "quality": "standard",
  "style": "vivid"
}
```

### Generate Batch Images

```http
POST /api/v1/images/generate/batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "words": [
    {
      "word": "apple",
      "translation": "蘋果"
    },
    {
      "word": "banana",
      "translation": "香蕉"
    }
  ]
}
```

### Get Cache Statistics

```http
GET /api/v1/images/cache/stats
Authorization: Bearer {token}
```

### Clear Cache

```http
DELETE /api/v1/images/cache
Authorization: Bearer {token}
```

## Region Recommendations for Hong Kong

### Option 1: East Asia (Recommended)

- **Location**: Hong Kong
- **Latency**: Lowest (<10ms)
- **DALL-E 3**: ✅ Supported
- **Compliance**: Hong Kong data residency

### Option 2: Southeast Asia

- **Location**: Singapore
- **Latency**: Low (~20-30ms)
- **DALL-E 3**: ✅ Supported
- **Compliance**: APAC data residency

### Option 3: Japan East

- **Location**: Tokyo
- **Latency**: Medium (~40-60ms)
- **DALL-E 3**: ✅ Supported
- **Compliance**: Asia-Pacific

## Monitoring

### Check Cache Usage

```bash
# Check cache size
du -sh backend/uploads/image-cache

# Count cached images
ls backend/uploads/image-cache/*.png | wc -l
```

### Monitor API Usage

1. Go to Azure Portal
2. Navigate to your Azure OpenAI resource
3. Click "Metrics" → "Total Tokens"
4. View usage trends

### Cost Management

Set up budget alerts in Azure:
1. Azure Portal → Cost Management → Budgets
2. Create new budget
3. Set threshold (e.g., $50/month)
4. Add email alerts

## References

- [Azure OpenAI Service Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [DALL-E 3 Overview](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#dall-e-3)
- [Azure OpenAI Pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/)
- [Content Filtering](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/content-filter)

## Support

For issues or questions:
- Check [Azure OpenAI Status](https://status.azure.com/)
- Review [Azure OpenAI Troubleshooting Guide](https://learn.microsoft.com/en-us/azure/ai-services/openai/troubleshooting)
- Contact LearnSpeak development team

---

**Last Updated**: January 2025
**Version**: 1.0
**Service**: Azure OpenAI DALL-E 3
