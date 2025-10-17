# Migration to OpenAI Go SDK v3

## Overview

Updated the Azure OpenAI image generation implementation to use `github.com/openai/openai-go/v3` instead of `v1.12.0`.

## Changes Made

### 1. Package Import Update

**Before:**
```go
import (
    "github.com/openai/openai-go"
    "github.com/openai/openai-go/option"
)
```

**After:**
```go
import (
    "github.com/openai/openai-go/v3"
    "github.com/openai/openai-go/v3/option"
)
```

### 2. Client Initialization

**Before (v1):**
```go
client := openai.NewClient(
    option.WithAPIKey(cfg.AzureOpenAIKey),
    option.WithBaseURL(cfg.AzureOpenAIEndpoint),
)
return &AzureOpenAIGenerator{
    client: &client,
}
```

**After (v3):**
```go
client := openai.NewClient(
    option.WithAPIKey(cfg.AzureOpenAIKey),
    option.WithBaseURL(cfg.AzureOpenAIEndpoint),
)
return &AzureOpenAIGenerator{
    client: &client,
    configured: true,
}
```

### 3. Struct Definition

**Before:**
```go
type AzureOpenAIGenerator struct {
    client *openai.Client
}
```

**After:**
```go
type AzureOpenAIGenerator struct {
    client *openai.Client
    configured bool
}
```

### 4. API Request Parameters

**Before (v1):**
```go
resp, err := g.client.Images.Generate(ctx, openai.ImageGenerateParams{
    Prompt:         prompt,
    Model:          openai.ImageModel(cfg.AzureOpenAIDeployment),
    Size:           imageSize,
    Quality:        imageQuality,
    Style:          imageStyle,
    ResponseFormat: openai.ImageGenerateParamsResponseFormatURL,
})
```

**After (v3):**
```go
params := openai.ImageGenerateParams{
    Prompt: prompt,
    Model:  openai.ImageModel(cfg.AzureOpenAIDeployment),
}

// Set size
switch size {
case "1792x1024":
    params.Size = openai.ImageGenerateParamsSize1792x1024
case "1024x1792":
    params.Size = openai.ImageGenerateParamsSize1024x1792
default:
    params.Size = openai.ImageGenerateParamsSize1024x1024
}

// Set quality
if quality == "hd" {
    params.Quality = openai.ImageGenerateParamsQualityHD
} else {
    params.Quality = openai.ImageGenerateParamsQualityStandard
}

// Set style
if style == "natural" {
    params.Style = openai.ImageGenerateParamsStyleNatural
} else {
    params.Style = openai.ImageGenerateParamsStyleVivid
}

params.ResponseFormat = openai.ImageGenerateParamsResponseFormatURL

resp, err := g.client.Images.Generate(ctxWithTimeout, params)
```

### 5. Enum Value Changes

The v3 SDK uses slightly different enum value naming:

**Quality:**
- `QualityHD` → `QualityHD` (unchanged)
- `QualityStandard` → `QualityStandard` (unchanged)

**Size:**
- `Size1024x1024` → `Size1024x1024` (unchanged)
- `Size1792x1024` → `Size1792x1024` (unchanged)
- `Size1024x1792` → `Size1024x1792` (unchanged)

**Style:**
- `StyleVivid` → `StyleVivid` (unchanged)
- `StyleNatural` → `StyleNatural` (unchanged)

### 6. Configuration Check

Added a `configured` boolean field to track whether the Azure OpenAI credentials are properly set:

```go
func (g *AzureOpenAIGenerator) IsConfigured() bool {
    return g.configured
}
```

## Dependency Update

### go.mod Changes

**Before:**
```go
require (
    github.com/openai/openai-go v1.12.0
)
```

**After:**
```go
require (
    github.com/openai/openai-go/v3 v3.0.0
)
```

## Key Differences in v3

1. **Client Type**: The client is now returned as a struct rather than a pointer
2. **Parameter Building**: Parameters can be set incrementally rather than in a single struct literal
3. **Simpler API**: No need for wrapper functions like `openai.F()` or `openai.String()`
4. **Better Type Safety**: Enum types are more strictly enforced

## Testing

After migration, test the following:

1. **Image Generation**:
   ```bash
   # Set credentials in .env
   AZURE_OPENAI_KEY=your_key
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
   AZURE_OPENAI_DEPLOYMENT=dall-e-3
   IMAGE_GENERATION_PROVIDER=azure
   ```

2. **Generate Test Image**:
   - Navigate to Word Form in the UI
   - Enter a word (e.g., "apple")
   - Click "🎨 Generate Image"
   - Verify image generates successfully

3. **Batch Generation**:
   - Use Bulk Word Creation
   - Generate images for multiple words
   - Verify all images generate correctly

## Troubleshooting

### Issue: "cannot use client as *openai.Client"

**Solution**: In v3, `openai.NewClient()` returns a `openai.Client` struct, not a pointer. Update code to use `&client` when assigning to pointer fields.

### Issue: "undefined: openai.F"

**Solution**: v3 removed the `openai.F()` wrapper function. Assign parameter values directly:
```go
// v1 (old)
Model: openai.F(openai.ImageModel(...))

// v3 (new)
Model: openai.ImageModel(...)
```

### Issue: "undefined: option.WithAPIVersion"

**Solution**: For Azure OpenAI, the API version is typically handled automatically or through the endpoint URL. Remove `option.WithAPIVersion()` if present.

## Benefits of v3

1. **Cleaner API**: Simpler parameter handling
2. **Better Performance**: Improved internal optimizations
3. **Up-to-date**: Latest features and bug fixes from OpenAI
4. **Better Documentation**: More comprehensive godoc comments
5. **Azure Support**: Better support for Azure OpenAI endpoints

## Rollback Plan

If issues arise, revert to v1:

```bash
cd backend
go get github.com/openai/openai-go@v1.12.0
go mod tidy
```

Then revert the code changes in `azure_openai_generator.go` back to the v1 implementation.

## References

- [OpenAI Go SDK v3 Documentation](https://pkg.go.dev/github.com/openai/openai-go/v3)
- [OpenAI Go SDK GitHub](https://github.com/openai/openai-go)
- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)

## Migration Checklist

- [x] Update import statements to v3
- [x] Update client initialization
- [x] Update struct definition with `configured` field
- [x] Update API request parameters
- [x] Update IsConfigured() method
- [x] Update go.mod dependency
- [x] Run go mod tidy
- [ ] Build and test locally
- [ ] Test image generation with Azure
- [ ] Test error handling
- [ ] Deploy to production

---

**Migration Date**: January 2025  
**From Version**: github.com/openai/openai-go v1.12.0  
**To Version**: github.com/openai/openai-go/v3 v3.0.0  
**Status**: Code updated, testing required
