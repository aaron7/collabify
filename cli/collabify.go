package main

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"time"

	"collabify/api"

	"github.com/getkin/kin-openapi/openapi3filter"
	"github.com/pkg/browser"
	"github.com/urfave/cli/v2"
)

const defaultAppUrl = "https://collabify.it" // Base URL for the app
const defaultListenHost = "localhost"        // `localhost` is recommended for most use cases
const defaultListenPort = "0"                // 0 uses the next available port

func init() {
	openapi3filter.RegisterBodyDecoder("text/markdown", openapi3filter.FileBodyDecoder)
}

func main() {
	appUrl := getEnv("COLLABIFY_APP_URL", defaultAppUrl)
	listenHost := getEnv("COLLABIFY_LISTEN_HOST", defaultListenHost)
	listenPort := getEnv("COLLABIFY_LISTEN_PORT", defaultListenPort)
	allowedOrigins := []string{appUrl}

	app := &cli.App{
		Name:  "collabify",
		Usage: "serve a markdown file over HTTP",
		Action: func(c *cli.Context) error {
			filename := c.Args().Get(0)
			if filename == "" {
				return cli.Exit("You must provide a filename", 1)
			}
			if _, err := os.Stat(filename); err != nil {
				return err
			}

			// Generate a random fileId and authToken
			fileId, err := generateRandomUrlSafeString(8)
			if err != nil {
				return err
			}
			authToken, err := generateRandomUrlSafeString(16)
			if err != nil {
				return err
			}

			listener, err := net.Listen("tcp", ":"+listenPort)
			if err != nil {
				fmt.Println("Failed to listen:", err)
			}
			defer listener.Close()

			// This may be different from listenPort if listenPort
			// was set to 0 (i.e. use the next available port)
			port := listener.Addr().(*net.TCPAddr).Port

			r := api.CreateRouter(filename, fileId, authToken, allowedOrigins)

			// Start the HTTP server
			serverStarted := make(chan error)
			go func() {
				err := http.Serve(listener, r)
				if err != nil {
					serverStarted <- err
					return
				}
			}()

			select {
			case err := <-serverStarted:
				fmt.Println("Server failed to start:", err)

			case <-time.After(100 * time.Millisecond):
				localUrl := fmt.Sprintf("http://%s:%d", listenHost, port)
				newSessionUrl, err := buildNewSessionUrl(appUrl, localUrl, fileId, authToken)
				if err != nil {
					log.Fatal("Failed to build new URL:", err)
				}

				fmt.Println("Opening", newSessionUrl)
				browser.OpenURL(newSessionUrl)
			}

			log.Fatal(http.Serve(listener, r))
			return nil
		},
	}

	err := app.Run(os.Args)
	if err != nil {
		fmt.Println(err)
	}
}
