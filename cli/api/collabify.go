package api

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

type Collabify struct {
	fileId   string
	filepath string
}

// Ensure that we've conformed to the `ServerInterface` with a compile-time check
var _ ServerInterface = (*Collabify)(nil)

func NewCollabify(fileId string, filepath string) *Collabify {
	return &Collabify{
		fileId:   fileId,
		filepath: filepath,
	}
}

func (c Collabify) GetFile(w http.ResponseWriter, r *http.Request, fileId string) {
	if fileId != c.fileId {
		http.Error(w, "File ID not found", http.StatusNotFound)
		return
	}

	content, err := os.ReadFile(c.filepath)
	if err != nil {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "text/markdown")
	w.Write(content)
}

func (c Collabify) UpdateFile(w http.ResponseWriter, r *http.Request, fileId string) {
	if fileId != c.fileId {
		http.Error(w, "Route not found", http.StatusNotFound)
		return
	}

	content, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	err = os.WriteFile(c.filepath, content, 0644)
	if err != nil {
		http.Error(w, "Failed to write to file", http.StatusInternalServerError)
		return
	}

	log.Println("File updated")

	w.WriteHeader(http.StatusOK)
}

type SessionData struct {
	URL     string `json:"url"`
	JoinURL string `json:"joinUrl"`
}

func (c Collabify) PostSession(w http.ResponseWriter, r *http.Request) {
	var session SessionData

	if err := json.NewDecoder(r.Body).Decode(&session); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	fmt.Printf("\n------------------------\n")
	fmt.Printf("Your session URL: %s\n", session.URL)
	fmt.Printf("Join URL to share: %s\n", session.JoinURL)
	fmt.Printf("------------------------\n\n")

	w.WriteHeader(http.StatusOK)
}

func (c Collabify) Stop(w http.ResponseWriter, r *http.Request) {
	log.Println("Session ended via web")

	w.WriteHeader(http.StatusAccepted)

	go func() {
		os.Exit(0)
	}()
}
