package middleware

import (
	"dannyswat/learnspeak/dto"
	"dannyswat/learnspeak/utils"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

// JWTMiddleware validates JWT tokens and adds user info to context
func JWTMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader == "" {
			return c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Error:   "unauthorized",
				Message: "Missing authorization header",
			})
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Error:   "unauthorized",
				Message: "Invalid authorization header format",
			})
		}

		tokenString := parts[1]
		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			return c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Error:   "unauthorized",
				Message: "Invalid or expired token",
			})
		}

		// Add claims to context
		c.Set("userId", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("roles", claims.Roles)

		return next(c)
	}
}

func RequireAnyRole(requiredRoles ...string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			roles, ok := c.Get("roles").([]string)
			if !ok {
				return c.JSON(http.StatusForbidden, dto.ErrorResponse{
					Error:   "forbidden",
					Message: "User roles not found in context",
				})
			}

			// Check if user has at least one of the required roles
			hasRole := false
			for _, requiredRole := range requiredRoles {
				for _, role := range roles {
					if role == requiredRole {
						hasRole = true
						break
					}
				}
				if hasRole {
					break
				}
			}

			if !hasRole {
				return c.JSON(http.StatusForbidden, dto.ErrorResponse{
					Error:   "forbidden",
					Message: "Insufficient permissions",
				})
			}

			return next(c)
		}
	}
}

// RequireRole middleware checks if user has a specific role
func RequireRole(requiredRole string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			roles, ok := c.Get("roles").([]string)
			if !ok {
				return c.JSON(http.StatusForbidden, dto.ErrorResponse{
					Error:   "forbidden",
					Message: "User roles not found in context",
				})
			}

			// Check if user has the required role
			hasRole := false
			for _, role := range roles {
				if role == requiredRole {
					hasRole = true
					break
				}
			}

			if !hasRole {
				return c.JSON(http.StatusForbidden, dto.ErrorResponse{
					Error:   "forbidden",
					Message: "Insufficient permissions",
				})
			}

			return next(c)
		}
	}
}
