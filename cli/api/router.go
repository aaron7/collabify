package api

import (
	"fmt"
	"os"

	"github.com/go-chi/chi/v5"
)

func CreateRouter(filename string, fileId string, authToken string, allowedOrigins []string) *chi.Mux {
	swagger, err := GetSwagger()
	if err != nil {
		fmt.Println("Error loading swagger spec:", err)
		os.Exit(1)
	}

	r := chi.NewRouter()

	r.Use(CorsMiddleware(allowedOrigins))
	r.Use(OpenApiRequestValidatorMiddleware(swagger, authToken))

	collabify := NewCollabify(fileId, filename)
	r.Route("/v1", func(r chi.Router) {
		r.Mount("/", HandlerFromMux(collabify, chi.NewMux()))
	})

	return r
}
