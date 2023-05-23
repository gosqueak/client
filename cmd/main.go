package main

import "github.com/gosqueak/client/api"

const Addr = "localhost:8080"

func main() {
	s := api.NewServer()
	s.Run(Addr)
}
