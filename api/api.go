package api

import (
	"net/http"

	kit "github.com/gosqueak/apikit"
)

var contentTypes = map[string]string{
	".js":   "application/javascript",
	".wasm": "application/wasm",
	".html": "text/html",
}

var handleServeFile = http.FileServer(http.Dir("../static")).ServeHTTP

type Server struct {
}

func NewServer() *Server {
	return &Server{}
}

func (s *Server) Run(addr string) {
	http.HandleFunc("/", kit.LogMiddleware(s.handleServeStaticfile))

	if err := http.ListenAndServe(addr, nil); err != nil {
		panic(err)
	}
}

func (s *Server) handleServeStaticfile(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	var i int

	// iterate backwards to find "."
	for i = len(path) - 1; i >= 0; i-- {
		if path[i] == '.' {
			break
		}

		if i == 0 { // reached beginning without any "."
			kit.Error(w, "", http.StatusNotFound)
			return
		}
	}

	contentType, ok := contentTypes[path[i:]]

	if !ok {
		kit.Error(w, "", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", contentType)

	handleServeFile(w, r)
}
