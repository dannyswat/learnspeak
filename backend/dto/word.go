package dto

// CreateWordRequest represents the request to create a new word
type CreateWordRequest struct {
	BaseWord     string                   `json:"baseWord" validate:"required,min=1,max=255"`
	ImageURL     string                   `json:"imageUrl" validate:"omitempty,url"`
	Notes        string                   `json:"notes" validate:"omitempty,max=5000"`
	Translations []CreateTranslationInput `json:"translations" validate:"required,min=1,dive"`
}

// CreateTranslationInput represents translation data for word creation
type CreateTranslationInput struct {
	LanguageID   uint   `json:"languageId" validate:"required,min=1"`
	Translation  string `json:"translation" validate:"required,min=1"`
	Romanization string `json:"romanization" validate:"omitempty,max=255"`
	AudioURL     string `json:"audioUrl" validate:"omitempty,url"`
}

// UpdateWordRequest represents the request to update a word
type UpdateWordRequest struct {
	BaseWord     *string                  `json:"baseWord" validate:"omitempty,min=1,max=255"`
	ImageURL     *string                  `json:"imageUrl" validate:"omitempty,url"`
	Notes        *string                  `json:"notes" validate:"omitempty,max=5000"`
	Translations []UpdateTranslationInput `json:"translations" validate:"omitempty,dive"`
}

// UpdateTranslationInput represents translation data for word update
type UpdateTranslationInput struct {
	ID           *uint   `json:"id" validate:"omitempty,min=1"`
	LanguageID   uint    `json:"languageId" validate:"required,min=1"`
	Translation  string  `json:"translation" validate:"required,min=1"`
	Romanization *string `json:"romanization" validate:"omitempty,max=255"`
	AudioURL     *string `json:"audioUrl" validate:"omitempty,url"`
}

// WordResponse represents a word with its translations
type WordResponse struct {
	ID           uint                  `json:"id"`
	BaseWord     string                `json:"baseWord"`
	ImageURL     string                `json:"imageUrl"`
	Notes        string                `json:"notes"`
	CreatedBy    uint                  `json:"createdBy"`
	CreatedAt    string                `json:"createdAt"`
	UpdatedAt    string                `json:"updatedAt"`
	Creator      *CreatorInfo          `json:"creator,omitempty"`
	Translations []TranslationResponse `json:"translations"`
}

// TranslationResponse represents a translation in response
type TranslationResponse struct {
	ID           uint          `json:"id"`
	WordID       uint          `json:"wordId"`
	LanguageID   uint          `json:"languageId"`
	Translation  string        `json:"translation"`
	Romanization string        `json:"romanization"`
	AudioURL     string        `json:"audioUrl"`
	Language     *LanguageInfo `json:"language,omitempty"`
}

// LanguageInfo represents basic language information
type LanguageInfo struct {
	ID         uint   `json:"id"`
	Code       string `json:"code"`
	Name       string `json:"name"`
	NativeName string `json:"nativeName"`
}

// CreatorInfo represents basic creator information
type CreatorInfo struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// WordListResponse represents paginated word list
type WordListResponse struct {
	Words      []WordResponse `json:"words"`
	Total      int64          `json:"total"`
	Page       int            `json:"page"`
	PageSize   int            `json:"pageSize"`
	TotalPages int            `json:"totalPages"`
}

// WordFilterParams represents query parameters for filtering words
type WordFilterParams struct {
	Search     string `query:"search"`
	LanguageID uint   `query:"languageId"`
	CreatedBy  uint   `query:"createdBy"`
	Page       int    `query:"page"`
	PageSize   int    `query:"pageSize"`
}

// UploadResponse represents file upload response
type UploadResponse struct {
	URL      string `json:"url"`
	Filename string `json:"filename"`
	Size     int64  `json:"size"`
}
