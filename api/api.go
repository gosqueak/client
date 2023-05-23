package api

import (
	"net/http"

	kit "github.com/gosqueak/apikit"
)

type Server struct {
}

func NewServer() *Server {
	return &Server{}
}

func (s *Server) Run(addr string) {
	handleServeFile := http.FileServer(http.Dir("../static")).ServeHTTP
	http.HandleFunc("/", kit.LogMiddleware(handleServeFile))

	if err := http.ListenAndServe(addr, nil); err != nil {
		panic(err)
	}
}
