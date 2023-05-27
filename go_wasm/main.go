package main

// This is the file that should be compiled into the WASM binary.

// Adapts Go functions to JS functions. Creates a global "wasm"
// object in JS that organizes wasm functions.

// JS example: const { res, error } = wasm.ecdh.mixKeys(a, b)

// Return values are converted to an appropriate JS value.
// An error string will be returned by all called wasm functions.
// an empty error string indicates no error

import (
	"encoding/base64"
	"syscall/js"
)

var ret = map[string]string{
	"res":   "",
	"error": "",
}

func main() {
	b64 := base64.StdEncoding

	ecdh := map[string]any{
		// Parameters:
		// Result: private key as base64 string
		"newPrivateKey": js.FuncOf(func(this js.Value, args []js.Value) any {
			b, err := NewPrivateKey()

			ret["res"] = b64.EncodeToString(b)
			ret["error"] = err.Error()
			return ret
		}),
		// Parameters: privateKey as base64 string
		// Result: public key as base64 string
		"publicKey": js.FuncOf(func(this js.Value, args []js.Value) any {
			privateKey, _ := b64.DecodeString(args[0].String())

			b, err := PublicKey(privateKey)

			ret["res"] = b64.EncodeToString(b)
			ret["error"] = err.Error()
			return ret
		}),
		// Parameters: private key and external  public key as base64 strings
		// Result: base64 string shared secret
		"mixKeys": js.FuncOf(func(this js.Value, args []js.Value) any {
			privateKey, _ := b64.DecodeString(args[0].String())
			publicKey, _ := b64.DecodeString(args[1].String())

			b, err := MixKeys(privateKey, publicKey)

			ret["res"] = b64.EncodeToString(b)
			ret["error"] = err.Error()
			return ret
		}),
	}

	wasm := map[string]any{
		"ecdh": js.ValueOf(ecdh),
	}

	js.Global().Set("wasm", wasm)

	// block here so that process does not end (needed for calling go funcs from js)
	<-make(chan any, 0)
}
