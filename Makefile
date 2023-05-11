
build_go:
	go build -o ./cmd/main ./cmd/main.go

build_wasm:
	GOOS=js GOARCH=wasm go build -o ./static/main.wasm ./go_wasm/main.go

# Default target
all: build_go build_wasm
