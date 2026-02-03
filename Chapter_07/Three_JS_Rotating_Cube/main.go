// main.go

package main

import (
	"flag"
	"html/template"
	"log"
	"net/http"
)

func main() {
	addr := flag.String("addr", ":8080", "HTTP network address")
	flag.Parse()

	mux := http.NewServeMux()

	fileServer := http.FileServer(http.Dir("./static"))
	mux.Handle("/static/", http.StripPrefix("/static", fileServer))

	mux.HandleFunc("/", indexHandler)
	mux.HandleFunc("/about", aboutHandler)

	log.Printf("Starting HTTP Server on port %s", *addr)
	log.Fatal(http.ListenAndServe(*addr, logRequest(mux)))
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Server", "Go")

	files := []string{
		"./templates/base.html",
		"./templates/index.html",
	}

	indexTemplate, _ := template.ParseFiles(files...)
	indexTemplate.ExecuteTemplate(w, "base", nil)
}

func aboutHandler(w http.ResponseWriter, r *http.Request) {
	files := []string{
		"./templates/base.html",
		"./templates/about.html",
	}

	aboutTemplate, _ := template.ParseFiles(files...)
	aboutTemplate.ExecuteTemplate(w, "base", nil)
}

func logRequest(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s %s %s\n", r.RemoteAddr, r.Proto, r.Method, r.URL)
		handler.ServeHTTP(w, r)
	})
}
