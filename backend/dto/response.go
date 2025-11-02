package dto

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error   string            `json:"error"`
	Message string            `json:"message,omitempty"`
	Details map[string]string `json:"details,omitempty"`
}

// SuccessResponse represents a generic success response
type SuccessResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

// ImageItem represents a single uploaded image
type ImageItem struct {
	Filename string `json:"filename"`
	URL      string `json:"url"`
	Size     int64  `json:"size"`
	ModTime  int64  `json:"modTime"`
}

// ImageListResponse represents a paginated list of images
type ImageListResponse struct {
	Images []ImageItem `json:"images"`
	Total  int         `json:"total"`
	Page   int         `json:"page"`
	Pages  int         `json:"pages"`
}
