package api

import (
	"context"
	"crypto/sha256"
	"crypto/subtle"
	"errors"
	"fmt"
	"net/http"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/getkin/kin-openapi/openapi3filter"
	middleware "github.com/oapi-codegen/nethttp-middleware"
	"github.com/rs/cors"
)

func CorsMiddleware(allowedOrigins []string) func(next http.Handler) http.Handler {
	return cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}).Handler
}

func OpenApiRequestValidatorMiddleware(swagger *openapi3.T, authToken string) func(next http.Handler) http.Handler {
	return middleware.OapiRequestValidatorWithOptions(swagger, &middleware.Options{
		Options: openapi3filter.Options{
			AuthenticationFunc: authenticate(authToken),
		},
		SilenceServersWarning: true,
	})
}

func authenticate(authToken string) openapi3filter.AuthenticationFunc {
	expectedAuthHeader := "Bearer " + authToken
	expectedHash := sha256.Sum256([]byte(expectedAuthHeader))

	return func(ctx context.Context, input *openapi3filter.AuthenticationInput) error {
		if input.SecuritySchemeName != "bearerAuth" {
			return fmt.Errorf("security scheme %s != 'bearerAuth'", input.SecuritySchemeName)
		}

		providedAuthHeader := input.RequestValidationInput.Request.Header.Get("Authorization")
		providedHash := sha256.Sum256([]byte(providedAuthHeader))

		if subtle.ConstantTimeCompare(expectedHash[:], providedHash[:]) != 1 {
			return errors.New("invalid token")
		}

		return nil
	}
}
