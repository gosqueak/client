
build_go:
	go build -o ./cmd/main ./cmd/

build_wasm:
	GOOS=js GOARCH=wasm go build -o ./static/main.wasm ./go_wasm/

# Default target
all: build_go build_wasm
dev: build_wasm
