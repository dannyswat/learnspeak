# How to Add a New Language to LearnSpeak

This guide explains how to add support for a new language to the LearnSpeak platform.

## Overview

Adding a new language involves updating four main components:
1. **Database Seed Data** - Add the language to the database migration
2. **Text-to-Speech (TTS) Service** - Configure Azure TTS voice for the language
3. **Frontend Voice Options** - Add voice options for the language in the UI
4. **Translation Service** - Ensure Azure Translator supports the language

## Prerequisites

Before adding a new language, verify:
- The language is supported by [Azure Translator](https://learn.microsoft.com/en-us/azure/ai-services/translator/language-support)
- The language has available voices in [Azure Text-to-Speech](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts)

## Step 1: Add Language to Database Seed

Update the language seed data in the database migration file.

**File:** `/backend/database/migrate.go`

Locate the `seedEssentialData()` function and add your language to the `languages` slice:

```go
// Seed languages
languages := []models.Language{
    {Code: "en", Name: "English", NativeName: "English", Direction: "ltr", IsActive: true},
    {Code: "zh-HK", Name: "Cantonese (Traditional)", NativeName: "廣東話（繁體）", Direction: "ltr", IsActive: true},
    {Code: "zh-CN", Name: "Mandarin (Simplified)", NativeName: "普通话（简体）", Direction: "ltr", IsActive: true},
    {Code: "es", Name: "Spanish", NativeName: "Español", Direction: "ltr", IsActive: true},
    {Code: "fr", Name: "French", NativeName: "Français", Direction: "ltr", IsActive: true},
    {Code: "ja", Name: "Japanese", NativeName: "日本語", Direction: "ltr", IsActive: true},
    {Code: "ko", Name: "Korean", NativeName: "한국어", Direction: "ltr", IsActive: true},
    {Code: "vi", Name: "Vietnamese", NativeName: "Tiếng Việt", Direction: "ltr", IsActive: true},
    // Add your new language here following the same pattern
    {Code: "YOUR_CODE", Name: "Language Name", NativeName: "Native Name", Direction: "ltr", IsActive: true},
}
```

### Language Fields Explained

- **Code**: ISO 639-1 language code (2 letters) or BCP-47 code for regional variants
  - Examples: `en`, `es`, `zh-CN`, `zh-HK`
  - Must match Azure service language codes
  
- **Name**: English name of the language
  - Example: "Vietnamese", "Spanish", "Mandarin (Simplified)"
  
- **NativeName**: Name of the language in its native script
  - Example: "Tiếng Việt", "Español", "普通话（简体）"
  
- **Direction**: Text direction
  - `"ltr"` - Left to right (most languages)
  - `"rtl"` - Right to left (Arabic, Hebrew, etc.)
  
- **IsActive**: Whether the language is enabled
  - `true` - Language is available for use
  - `false` - Language is temporarily disabled

## Step 2: Configure Azure TTS Voice

Add a default voice for the language in the Text-to-Speech service.

**File:** `/backend/services/tts_service.go`

Locate the `getDefaultVoice()` function and add your language to the `voiceMap`:

```go
// Map languages to Azure neural voices
voiceMap := map[string]string{
    "zh-HK": "zh-HK-HiuMaanNeural",  // Cantonese (Hong Kong) - Female
    "zh-CN": "zh-CN-XiaoxiaoNeural", // Mandarin (Simplified) - Female
    "en":    "en-US-JennyNeural",    // English (US) - Female
    "en-US": "en-US-JennyNeural",
    "es":    "es-ES-ElviraNeural", // Spanish - Female
    "fr":    "fr-FR-DeniseNeural", // French - Female
    "ja":    "ja-JP-NanamiNeural", // Japanese - Female
    "ko":    "ko-KR-SunHiNeural",  // Korean - Female
    "vi":    "vi-VN-HoaiMyNeural", // Vietnamese - Female
    // Add your new language voice here
    "YOUR_CODE": "YOUR-REGION-VoiceNameNeural", // Your Language - Gender
}
```

### Finding Azure TTS Voices

1. Visit [Azure TTS Language Support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts)
2. Search for your language
3. Choose a neural voice (recommended) or standard voice
4. Note the voice name format: `{locale}-{voiceName}Neural`
   - Example: `vi-VN-HoaiMyNeural` for Vietnamese (Vietnam, HoaiMy voice, Neural)

### Voice Selection Tips

- **Neural voices** provide more natural-sounding speech (recommended)
- Choose voices appropriate for your target audience:
  - Children's learning: Clear, friendly voices
  - Adults: Professional, neutral voices
- Consider gender representation: Mix of male and female voices
- For regional variants (e.g., en-US vs en-GB), include both if needed

## Step 3: Add Frontend Voice Options

Configure voice selection options for the AudioInput component.

**File:** `/frontend/src/config/voiceOptions.ts`

Add your language voices to the `voiceOptions` object:

```typescript
export const voiceOptions: { [languageCode: string]: VoiceOption[] } = {
  // ... existing languages ...
  
  // Vietnamese (Vietnam)
  'vi': [
    { name: 'HoaiMy (Female)', voice: 'vi-VN-HoaiMyNeural', gender: 'Female' },
    { name: 'NamMinh (Male)', voice: 'vi-VN-NamMinhNeural', gender: 'Male' },
  ],

  // Vietnamese (Vietnam) - alternate code
  'vi-VN': [
    { name: 'HoaiMy (Female)', voice: 'vi-VN-HoaiMyNeural', gender: 'Female' },
    { name: 'NamMinh (Male)', voice: 'vi-VN-NamMinhNeural', gender: 'Male' },
  ],

  // Add your new language here:
  'YOUR_CODE': [
    { name: 'VoiceName (Female)', voice: 'lang-REGION-NameNeural', gender: 'Female' },
    { name: 'VoiceName (Male)', voice: 'lang-REGION-NameNeural', gender: 'Male' },
  ],
};
```

### Voice Options Fields Explained

- **name**: Display name shown in the UI
  - Format: `VoiceName (Gender)`
  - Example: `HoaiMy (Female)`, `Guy (Male)`
  
- **voice**: Azure TTS voice identifier
  - Must match exact Azure voice name
  - Example: `vi-VN-HoaiMyNeural`
  
- **gender**: Voice gender for UI filtering/display
  - Values: `'Male'` or `'Female'`

### Adding Multiple Language Codes

For compatibility, add both the base language code and regional variant:

```typescript
// Base code (2 letters)
'vi': [
  { name: 'HoaiMy (Female)', voice: 'vi-VN-HoaiMyNeural', gender: 'Female' },
],

// Regional variant (BCP-47)
'vi-VN': [
  { name: 'HoaiMy (Female)', voice: 'vi-VN-HoaiMyNeural', gender: 'Female' },
],
```

This ensures the voice selector works regardless of which code format is used in the application.

### Voice Selection Best Practices

✅ **Do:**
- Include at least 2-4 voice options per language
- Provide both male and female voices when available
- Use clear, simple display names
- Match voice names to Azure documentation exactly

❌ **Don't:**
- Add voices that don't exist in Azure
- Use inconsistent naming formats
- Omit gender information
- Forget to add alternate language codes

## Step 4: Verify Azure Translator Support

Azure Translator automatically supports the language if it's in their [supported languages list](https://learn.microsoft.com/en-us/azure/ai-services/translator/language-support).

**No code changes needed** - Azure Translator uses the language code directly.

### Common Language Codes

| Language | Code | Azure Support |
|----------|------|---------------|
| English | `en` | ✅ Full |
| Spanish | `es` | ✅ Full |
| French | `fr` | ✅ Full |
| German | `de` | ✅ Full |
| Italian | `it` | ✅ Full |
| Portuguese | `pt` | ✅ Full |
| Russian | `ru` | ✅ Full |
| Arabic | `ar` | ✅ Full |
| Japanese | `ja` | ✅ Full |
| Korean | `ko` | ✅ Full |
| Chinese (Simplified) | `zh-CN` | ✅ Full |
| Chinese (Traditional) | `zh-TW` or `zh-HK` | ✅ Full |
| Vietnamese | `vi` | ✅ Full |
| Thai | `th` | ✅ Full |
| Hindi | `hi` | ✅ Full |

## Step 5: Database Migration

After updating the code, run the migration to add the language to the database:

```bash
# Navigate to backend directory
cd backend

# Run the application (migration runs automatically on startup)
go run main.go
```

Or if using Docker:

```bash
# Rebuild and restart the containers
docker-compose down
docker-compose up --build
```

The migration system will:
1. Check if the language already exists (by code)
2. Create the language if it doesn't exist
3. Skip if it already exists (idempotent)

## Step 6: Testing

### 1. Verify Language in Database

```sql
-- Connect to your database
SELECT * FROM languages WHERE code = 'YOUR_CODE';
```

Expected result: One row with your language data.

### 2. Test in Frontend

1. Navigate to Topics page
2. Create a new topic
3. Language dropdown should include your new language
4. Select it and save

### 3. Test TTS (Text-to-Speech)

1. Create a topic with your new language
2. Add words to the topic
3. Upload or generate audio for translations
4. Play the audio to verify correct voice

### 4. Test Translation

1. Use the translation feature
2. Translate from/to your new language
3. Verify translations are accurate

### 5. Test Voice Selection

1. Navigate to Word/Topic management
2. Find the audio input component
3. Select your new language
4. Click the voice selector (⋯ button next to Generate)
5. Verify your language's voices appear in the dropdown
6. Select a voice and generate audio
7. Verify the audio uses the selected voice

## Step 7: Frontend Updates (Optional)

The frontend automatically fetches available languages from the API, so no changes are required. However, you may want to:

### Add Language-Specific UI Styling

If your language uses a non-Latin script or RTL direction, you may need CSS adjustments:

**File:** `/frontend/src/components/LanguageSelect.tsx` (or similar)

```typescript
// Example: Special handling for RTL languages
const isRTL = language.direction === 'rtl';
className={`${isRTL ? 'text-right' : 'text-left'}`}
```

## Troubleshooting

### Language Not Appearing in Dropdown

**Possible causes:**
1. Migration didn't run - Check logs for migration errors
2. IsActive is false - Update database: `UPDATE languages SET is_active = true WHERE code = 'YOUR_CODE';`
3. Frontend cache - Clear browser cache and reload

### TTS Not Working

**Possible causes:**
1. Voice name incorrect - Verify against Azure documentation
2. Azure Speech SDK not configured - Check environment variables:
   - `AZURE_SPEECH_KEY`
   - `AZURE_SPEECH_REGION`
3. Language code mismatch - Ensure database code matches TTS voiceMap key
4. Frontend voice options missing - Check `/frontend/src/config/voiceOptions.ts`

### Voice Selector Not Showing

**Possible causes:**
1. Language code not in voiceOptions - Add to `/frontend/src/config/voiceOptions.ts`
2. Empty voice array - Ensure at least one voice is configured
3. Frontend cache - Clear browser cache and rebuild: `npm run build`

### Translation Not Working

**Possible causes:**
1. Language code not supported by Azure - Check [Azure Translator language support](https://learn.microsoft.com/en-us/azure/ai-services/translator/language-support)
2. Azure Translator not configured - Check environment variables:
   - `AZURE_TRANSLATOR_KEY`
   - `AZURE_TRANSLATOR_REGION`
   - `AZURE_TRANSLATOR_ENDPOINT`

### Database Errors

**Error:** "duplicate key value violates unique constraint"
- The language code already exists in the database
- Solution: Update existing record or use different code

**Error:** "foreign key constraint"
- Some data references this language
- Solution: Don't delete, set IsActive to false instead

## Best Practices

### Language Codes

✅ **Do:**
- Use standard ISO 639-1 codes (2 letters): `en`, `es`, `fr`
- Use BCP-47 for regional variants: `en-US`, `en-GB`, `zh-CN`, `zh-TW`
- Keep codes consistent with Azure services

❌ **Don't:**
- Create custom language codes
- Use 3-letter ISO 639-2 codes (unless required)
- Mix code standards

### Native Names

✅ **Do:**
- Use authentic native script: `日本語` not `Nihongo`
- Include regional identifiers when needed: `廣東話（繁體）`
- Use proper Unicode characters

❌ **Don't:**
- Romanize native names
- Use ASCII approximations
- Omit diacritics or special characters

### Voice Selection

✅ **Do:**
- Test voices with sample content
- Choose age-appropriate voices
- Consider regional accents
- Use neural voices when available

❌ **Don't:**
- Use outdated standard voices (prefer neural)
- Ignore voice quality
- Choose inappropriate gender representation

## Example: Adding Thai Language

Here's a complete example of adding Thai support:

### 1. Database Seed (migrate.go)

```go
{Code: "th", Name: "Thai", NativeName: "ไทย", Direction: "ltr", IsActive: true},
```

### 2. Backend TTS Voice (tts_service.go)

```go
"th": "th-TH-PremwadeeNeural", // Thai - Female
```

### 3. Frontend Voice Options (voiceOptions.ts)

```typescript
// Thai (Thailand)
'th': [
  { name: 'Premwadee (Female)', voice: 'th-TH-PremwadeeNeural', gender: 'Female' },
  { name: 'Niwat (Male)', voice: 'th-TH-NiwatNeural', gender: 'Male' },
  { name: 'Achara (Female)', voice: 'th-TH-AcharaNeural', gender: 'Female' },
],

// Thai (Thailand) - alternate code
'th-TH': [
  { name: 'Premwadee (Female)', voice: 'th-TH-PremwadeeNeural', gender: 'Female' },
  { name: 'Niwat (Male)', voice: 'th-TH-NiwatNeural', gender: 'Male' },
  { name: 'Achara (Female)', voice: 'th-TH-AcharaNeural', gender: 'Female' },
],
```

### 4. Verify in Azure Documentation

- Thai is supported by Azure Translator ✅
- Neural voice available: `th-TH-PremwadeeNeural` ✅

### 5. Run Migration

```bash
cd backend
go run main.go
```

### 6. Test

- Create topic in Thai ✅
- Add Thai words ✅
- Select Thai voices in voice selector ✅
- Generate Thai audio ✅
- Translate to/from Thai ✅

## Additional Resources

- [Azure Text-to-Speech Language Support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts)
- [Azure Translator Language Support](https://learn.microsoft.com/en-us/azure/ai-services/translator/language-support)
- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
- [BCP-47 Language Tags](https://www.rfc-editor.org/rfc/bcp/bcp47.txt)

## Support

If you encounter issues:
1. Check application logs for errors
2. Verify Azure service configuration
3. Review this documentation
4. Open an issue on GitHub with:
   - Language you're trying to add
   - Error messages
   - Steps you've already tried

---

**Last Updated:** November 22, 2025  
**Version:** 1.0
