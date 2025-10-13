package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	Environment        string
	DBHost             string
	DBPort             string
	DBUser             string
	DBPassword         string
	DBName             string
	DBSSLMode          string
	JWTSecret          string
	JWTExpirationHours int
	CORSAllowedOrigins string
	MaxUploadSize      int64
	UploadDir          string
	// Azure TTS Configuration
	AzureTTSKey     string
	AzureTTSRegion  string
	AzureTTSVoice   string
	TTSCacheEnabled bool
}

var AppConfig *Config

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	jwtExpHours, _ := strconv.Atoi(getEnv("JWT_EXPIRATION_HOURS", "24"))
	maxUploadSize, _ := strconv.ParseInt(getEnv("MAX_UPLOAD_SIZE", "10485760"), 10, 64)
	ttsCacheEnabled, _ := strconv.ParseBool(getEnv("TTS_CACHE_ENABLED", "true"))

	AppConfig = &Config{
		Port:               getEnv("PORT", "8080"),
		Environment:        getEnv("ENV", "development"),
		DBHost:             getEnv("DB_HOST", "localhost"),
		DBPort:             getEnv("DB_PORT", "5432"),
		DBUser:             getEnv("DB_USER", "postgres"),
		DBPassword:         getEnv("DB_PASSWORD", "postgres"),
		DBName:             getEnv("DB_NAME", "learnspeak"),
		DBSSLMode:          getEnv("DB_SSLMODE", "disable"),
		JWTSecret:          getEnv("JWT_SECRET", "your-secret-key"),
		JWTExpirationHours: jwtExpHours,
		CORSAllowedOrigins: getEnv("CORS_ALLOWED_ORIGINS", ""),
		MaxUploadSize:      maxUploadSize,
		UploadDir:          getEnv("UPLOAD_DIR", "./uploads"),
		// Azure TTS Configuration
		AzureTTSKey:     getEnv("AZURE_TTS_KEY", ""),
		AzureTTSRegion:  getEnv("AZURE_TTS_REGION", "eastus"),
		AzureTTSVoice:   getEnv("AZURE_TTS_VOICE", "zh-HK-HiuMaanNeural"),
		TTSCacheEnabled: ttsCacheEnabled,
	}

	return AppConfig
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
