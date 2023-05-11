package main

import (
	"encoding/base64"
	"syscall/js"
)

func main() {
	enc := base64.StdEncoding
	ecdh := map[string]any{
		"newPrivateKey": js.FuncOf(func(this js.Value, args []js.Value) any {
			b := newPrivateKey()
			return enc.EncodeToString(b)
		}),
		"publicKey": js.FuncOf(func(this js.Value, args []js.Value) any {
			privateKey, _ := enc.DecodeString(args[0].String())
			return enc.EncodeToString(publicKey(privateKey))
		}),
		"mixKeys": js.FuncOf(func(this js.Value, args []js.Value) any {
			privateKey, _ := enc.DecodeString(args[0].String())
			publicKey, _ := enc.DecodeString(args[1].String())
			return enc.EncodeToString(mixKeys(privateKey, publicKey))
		}),
		"encryptString": js.FuncOf(func(this js.Value, args []js.Value) any {
			s := args[0].String()
			secretKey, _ := enc.DecodeString(args[1].String())
			return encryptString(s, secretKey)
		}),
		"decryptString": js.FuncOf(func(this js.Value, args []js.Value) any {
			s := args[0].String()
			secretKey, _ := enc.DecodeString(args[1].String())
			return decryptString(s, secretKey)
		}),
	}

	wasm := map[string]any{
		"ecdh": js.ValueOf(ecdh),
	}

	js.Global().Set("wasm", wasm)

	// block here so that process does not end (needed for calling go funcs from js)
	<-make(chan any, 0)
} 