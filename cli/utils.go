package main

import (
	"crypto/rand"
	"encoding/base64"
	"net/url"
	"os"
)

func generateRandomBytes(n int) ([]byte, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	// Note that err == nil only if we read len(b) bytes.
	if err != nil {
		return nil, err
	}

	return b, nil
}

func generateRandomUrlSafeString(n int) (string, error) {
	b, err := generateRandomBytes(n)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

func buildNewSessionUrl(appUrl, localUrl, fileId, authToken string) (string, error) {
	baseUrl, err := url.Parse(appUrl)
	if err != nil {
		return "", err
	}

	params := url.Values{}
	params.Add("baseUrl", localUrl)
	params.Add("fileId", fileId)
	params.Add("token", authToken)
	params.Add("version", "v1")

	return baseUrl.String() + "/new#" + params.Encode(), nil
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
