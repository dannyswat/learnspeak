# Ideogram AI Integration Guide

## Overview

LearnSpeak supports **Ideogram AI** as an alternative image generation provider. Ideogram specializes in high-quality, realistic images with excellent text rendering capabilities.

## Why Use Ideogram?

### Advantages
- **Better Text Rendering**: Superior at generating images with text/labels
- **Artistic Quality**: High-quality, realistic images
- **Competitive Pricing**: Often more cost-effective than DALL-E 3
- **Fast Generation**: Typically faster response times
- **No Deployment Needed**: Simple API key authentication

### Comparison with Azure OpenAI DALL-E 3

| Feature | Azure OpenAI DALL-E 3 | Ideogram AI |
|---------|----------------------|-------------|
| **Quality** | Excellent cartoon/artistic | Excellent realistic/design |
| **Text in Images** | Moderate | Excellent |
| **Speed** | 10-30 seconds | 5-15 seconds |
| **Pricing** | $0.04-$0.12 per image | $0.08 per image (standard) |
| **Setup** | Complex (Azure resource + deployment) | Simple (API key only) |
| **Child-Safe** | Built-in filters | Built-in safety |
| **Best For** | Cartoon illustrations | Realistic images, designs |

## Setup Guide

### Step 1: Get Ideogram API Key

1. Go to [Ideogram AI](https://ideogram.ai/)
2. Sign up for an account
3. Navigate to [API Settings](https://ideogram.ai/api)
4. Generate an API key
5. Copy the API key

### Step 2: Configure Environment Variables

Add to your `backend/.env`:

```bash
# Ideogram AI Configuration
IDEOGRAM_API_KEY=your_ideogram_api_key_here

# Set Ideogram as the provider
IMAGE_GENERATION_PROVIDER=ideogram

# Enable caching (recommended)
IMAGE_CACHE_ENABLED=true
```

### Step 3: Restart Backend

```bash
cd backend
# Stop the backend (Ctrl+C if running)
go run main.go
```

You should see:
```
Initializing image generation with provider: ideogram
✅ Ideogram AI image generator initialized
```

### Step 4: Test Image Generation

1. Log in as a teacher
2. Go to "Create Word" or "Bulk Word Creation"
3. Click "🎨 Generate Image"
4. Image should generate in 5-15 seconds!

## Switching Between Providers

You can easily switch between Azure OpenAI and Ideogram:

### Use Azure OpenAI (DALL-E 3)

```bash
IMAGE_GENERATION_PROVIDER=azure
```

### Use Ideogram

```bash
IMAGE_GENERATION_PROVIDER=ideogram
```

**Note**: Restart the backend after changing providers.

## Pricing

### Ideogram Pricing (as of January 2025)

| Tier | Resolution | Price per Image |
|------|------------|-----------------|
| Standard | Up to 1024px | $0.08 |
| HD | Up to 2048px | $0.16 |

### Cost Comparison

For 1000 vocabulary words:

- **Azure DALL-E 3 Standard**: $40
- **Ideogram Standard**: $80
- **With Caching** (after first generation): ~$0 (free)

**Recommendation**: If you prioritize text rendering or realistic images, Ideogram's higher cost may be worth it.

## Features

### Supported Image Sizes

| LearnSpeak Size | Ideogram Aspect Ratio |
|-----------------|----------------------|
| `1024x1024` | ASPECT_1_1 (Square) |
| `1792x1024` | ASPECT_16_9 (Landscape) |
| `1024x1792` | ASPECT_9_16 (Portrait) |

### Image Styles

Ideogram automatically uses:
- **Model**: V_2 (latest version)
- **Style**: DESIGN (optimized for educational content)
- **Magic Prompt**: AUTO (enhances prompts automatically)
- **Negative Prompt**: Filters inappropriate content

### Safety Features

- Built-in content safety checks
- `is_image_safe` flag verification
- Negative prompt filtering for inappropriate content
- Child-safe prompt engineering

## Configuration Reference

### Full .env Example

```bash
# Choose your provider
IMAGE_GENERATION_PROVIDER=ideogram  # or "azure"

# Ideogram Configuration
IDEOGRAM_API_KEY=your_ideogram_api_key

# Azure OpenAI Configuration (if using Azure)
AZURE_OPENAI_KEY=your_azure_key
AZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=dall-e-3

# Cache settings (works with both providers)
IMAGE_CACHE_ENABLED=true
```

## API Endpoint

Ideogram uses:
- **Endpoint**: `https://api.ideogram.ai/generate`
- **Method**: POST
- **Authentication**: API Key in header

## Troubleshooting

### Error: "Ideogram API is not configured"

**Solution**: Add `IDEOGRAM_API_KEY` to your `.env` file and restart the backend.

### Error: "401 Unauthorized"

**Cause**: Invalid API key

**Solution**:
1. Check your API key in [Ideogram Dashboard](https://ideogram.ai/api)
2. Ensure no extra spaces in `.env`
3. Regenerate API key if needed

### Error: "Generated image was flagged as unsafe"

**Cause**: Ideogram's safety filter blocked the image

**Solution**:
1. Review the word/prompt
2. Try different wording
3. Contact Ideogram support if issue persists

### Error: "Failed to parse response"

**Cause**: API response format issue

**Solution**:
1. Check Ideogram service status
2. Verify API key is valid
3. Try again in a few minutes

### Slow Generation (>30 seconds)

**Causes**:
- Ideogram API load
- Network latency
- Complex prompts

**Solutions**:
- Try during off-peak hours
- Use caching for repeated words
- Check internet connection

## Best Practices

### 1. Use Caching

Always keep `IMAGE_CACHE_ENABLED=true`:
- First generation: ~5-15 seconds + $0.08
- Subsequent requests: <100ms + $0.00

### 2. Choose the Right Provider

- **Use Azure DALL-E 3** for: Cartoon-style, playful illustrations
- **Use Ideogram** for: Realistic images, images with text labels

### 3. Batch Pre-Generation

Generate common vocabulary images during setup:
```bash
# Generate images for common words during off-hours
# Cache will make them instant for students
```

### 4. Monitor Usage

Check Ideogram dashboard for:
- API usage
- Monthly costs
- Rate limits

### 5. Test Both Providers

Try both providers with the same words to see which works better for your content:

```bash
# Test with Azure
IMAGE_GENERATION_PROVIDER=azure
# Generate some images

# Test with Ideogram  
IMAGE_GENERATION_PROVIDER=ideogram
# Generate same images

# Compare quality and choose
```

## Rate Limits

Ideogram API rate limits (check current limits in your dashboard):
- **Standard Plan**: ~100 requests/minute
- **Pro Plan**: Higher limits available

If you hit rate limits, images will queue or fail gracefully.

## Example Images

### Good Use Cases for Ideogram

✅ **Objects with labels** (e.g., "apple 蘋果" with Chinese text visible)
✅ **Realistic scenes** (e.g., classroom, playground)
✅ **Product-like images** (e.g., food items, school supplies)
✅ **Diagrams and educational charts**

### Better with DALL-E 3

✅ **Cartoon characters**
✅ **Whimsical, playful scenes**
✅ **Abstract concepts**
✅ **Storybook-style illustrations**

## Support

- **Ideogram Documentation**: https://ideogram.ai/docs
- **API Status**: https://status.ideogram.ai/
- **Support**: support@ideogram.ai

## Advanced Configuration

### Custom Prompt Templates

The Ideogram generator uses educational prompts optimized for children. To customize:

1. Edit `backend/services/ideogram_generator.go`
2. Modify the `buildEducationalPrompt()` method
3. Restart backend

### Custom Negative Prompts

Current default:
```
"violence, scary, dark, inappropriate, adult content"
```

To customize, edit `NegativePrompt` in `ideogram_generator.go`.

## Summary

**Quick Start**:
1. Get API key from https://ideogram.ai/api
2. Add to `.env`: `IDEOGRAM_API_KEY=your_key`
3. Set `IMAGE_GENERATION_PROVIDER=ideogram`
4. Restart backend
5. Generate images!

**Cost**: ~$0.08 per image (with caching, only first generation costs)

**Best For**: Realistic images, text-heavy images, design-style illustrations

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Service**: Ideogram AI V_2
