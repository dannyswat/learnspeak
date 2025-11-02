package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"dannyswat/learnspeak/dto"

	"github.com/labstack/echo/v4"
)

type FileUploadHandler struct {
	uploadDir string
	maxSize   int64
}

func NewFileUploadHandler(uploadDir string, maxSizeMB int64) *FileUploadHandler {
	// Create upload directory if it doesn't exist
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		panic(fmt.Sprintf("Failed to create upload directory: %v", err))
	}

	return &FileUploadHandler{
		uploadDir: uploadDir,
		maxSize:   maxSizeMB * 1024 * 1024, // Convert MB to bytes
	}
}

// UploadAudio handles POST /api/upload/audio
// @Summary Upload audio file
// @Description Upload an audio file for word pronunciation
// @Tags upload
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Audio file"
// @Success 200 {object} dto.UploadResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /api/upload/audio [post]
func (h *FileUploadHandler) UploadAudio(c echo.Context) error {
	return h.uploadFile(c, "audio", []string{".mp3", ".wav", ".ogg", ".m4a", ".webm"})
}

// UploadImage handles POST /api/upload/image
// @Summary Upload image file
// @Description Upload an image file for word illustration
// @Tags upload
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Image file"
// @Success 200 {object} dto.UploadResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /api/upload/image [post]
func (h *FileUploadHandler) UploadImage(c echo.Context) error {
	return h.uploadFile(c, "image", []string{".jpg", ".jpeg", ".png", ".gif", ".webp"})
}

// UploadProfilePhoto handles POST /api/upload/profile
// @Summary Upload profile photo
// @Description Upload a profile photo for the authenticated user
// @Tags upload
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Profile photo file"
// @Success 200 {object} dto.UploadResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /api/upload/profile [post]
func (h *FileUploadHandler) UploadProfilePhoto(c echo.Context) error {
	return h.uploadFile(c, "profile", []string{".jpg", ".jpeg", ".png", ".gif", ".webp"})
}

// uploadFile is a generic file upload handler
func (h *FileUploadHandler) uploadFile(c echo.Context, fileType string, allowedExtensions []string) error {
	// Get file from request
	file, err := c.FormFile("file")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "No file provided")
	}

	// Check file size
	if file.Size > h.maxSize {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("File too large (max %dMB)", h.maxSize/1024/1024))
	}

	// Check file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !contains(allowedExtensions, ext) {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid file type. Allowed: %v", allowedExtensions))
	}

	// Open uploaded file
	src, err := file.Open()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to open uploaded file")
	}
	defer src.Close()

	// Generate unique filename using hash and timestamp
	hash := sha256.New()
	if _, err := io.Copy(hash, src); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to process file")
	}
	hashStr := hex.EncodeToString(hash.Sum(nil))[:16]
	timestamp := time.Now().Unix()
	uniqueFilename := fmt.Sprintf("%s_%d%s", hashStr, timestamp, ext)

	// Create subdirectory for file type
	typeDir := filepath.Join(h.uploadDir, fileType)
	if err := os.MkdirAll(typeDir, 0755); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create directory")
	}

	// Create destination file
	destPath := filepath.Join(typeDir, uniqueFilename)
	dst, err := os.Create(destPath)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create file")
	}
	defer dst.Close()

	// Reset src to beginning
	if _, err := src.Seek(0, io.SeekStart); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to reset file reader")
	}

	// Copy file
	written, err := io.Copy(dst, src)
	if err != nil {
		os.Remove(destPath) // Clean up on error
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to save file")
	}

	// Generate URL (relative to uploads directory)
	fileURL := fmt.Sprintf("/uploads/%s/%s", fileType, uniqueFilename)

	// Return response
	response := dto.UploadResponse{
		URL:      fileURL,
		Filename: uniqueFilename,
		Size:     written,
	}

	return c.JSON(http.StatusOK, response)
}

// ListImages handles GET /api/upload/images?page=1&pageSize=20
// @Summary List uploaded images
// @Description List all uploaded images with pagination
// @Tags upload
// @Produce json
// @Param page query int false "Page number (default: 1)"
// @Param pageSize query int false "Items per page (default: 20)"
// @Success 200 {object} dto.ImageListResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /api/upload/images [get]
func (h *FileUploadHandler) ListImages(c echo.Context) error {
	page := 1
	pageSize := 20

	if p := c.QueryParam("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}
	if ps := c.QueryParam("pageSize"); ps != "" {
		if parsed, err := strconv.Atoi(ps); err == nil && parsed > 0 && parsed <= 100 {
			pageSize = parsed
		}
	}

	// Read images from both image and image-cache directories
	type imageFileWithDir struct {
		entry os.DirEntry
		dir   string
	}

	var imageFilesWithDir []imageFileWithDir

	// Read main image directory
	imageDir := filepath.Join(h.uploadDir, "image")
	entries, err := os.ReadDir(imageDir)
	if err != nil && !os.IsNotExist(err) {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to read images")
	}

	// Add files from image directory
	if err == nil {
		for _, entry := range entries {
			if !entry.IsDir() {
				imageFilesWithDir = append(imageFilesWithDir, imageFileWithDir{entry, "image"})
			}
		}
	}

	// Read image-cache directory
	cacheDir := filepath.Join(h.uploadDir, "image-cache")
	cacheEntries, err := os.ReadDir(cacheDir)
	if err != nil && !os.IsNotExist(err) {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to read image cache")
	}

	// Add files from image-cache directory
	if err == nil {
		for _, entry := range cacheEntries {
			if !entry.IsDir() {
				imageFilesWithDir = append(imageFilesWithDir, imageFileWithDir{entry, "image-cache"})
			}
		}
	}

	// If no images found in either directory, return empty response
	if len(imageFilesWithDir) == 0 {
		return c.JSON(http.StatusOK, dto.ImageListResponse{
			Images: []dto.ImageItem{},
			Total:  0,
			Page:   page,
			Pages:  0,
		})
	}

	// Sort by modification time (newest first)
	sort.Slice(imageFilesWithDir, func(i, j int) bool {
		infoI, _ := imageFilesWithDir[i].entry.Info()
		infoJ, _ := imageFilesWithDir[j].entry.Info()
		return infoI.ModTime().After(infoJ.ModTime())
	})

	// Calculate pagination
	total := len(imageFilesWithDir)
	pages := (total + pageSize - 1) / pageSize
	if page > pages && pages > 0 {
		page = pages
	}

	// Get page slice
	start := (page - 1) * pageSize
	end := start + pageSize
	if start > total {
		start = total
	}
	if end > total {
		end = total
	}

	pageImages := imageFilesWithDir[start:end]

	// Build response
	images := make([]dto.ImageItem, len(pageImages))
	for i, fileWithDir := range pageImages {
		info, _ := fileWithDir.entry.Info()
		images[i] = dto.ImageItem{
			Filename: fileWithDir.entry.Name(),
			URL:      fmt.Sprintf("/uploads/%s/%s", fileWithDir.dir, fileWithDir.entry.Name()),
			Size:     info.Size(),
			ModTime:  info.ModTime().Unix(),
		}
	}

	return c.JSON(http.StatusOK, dto.ImageListResponse{
		Images: images,
		Total:  total,
		Page:   page,
		Pages:  pages,
	})
}

// contains checks if a slice contains a string
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
