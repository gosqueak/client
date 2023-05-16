package main

import "github.com/gosqueak/client/api"

const Addr = ":8080"

func main() {
	s := api.NewServer()
	s.Run(Addr)
}