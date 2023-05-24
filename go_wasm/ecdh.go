package main

import (
	"crypto/ecdh"
	"crypto/rand"
	"crypto/x509"
	"fmt"
)

func NewPrivateKey() (b []byte, err error) {
	var priv *ecdh.PrivateKey

	priv, err = ecdh.X25519().GenerateKey(rand.Reader)
	if err != nil {
		return nil, err
	}

	return x509.MarshalPKCS8PrivateKey(priv)
}

func PublicKey(privBytes []byte) (b []byte, err error) {
	var priv *ecdh.PrivateKey

	parsed, err := x509.ParsePKCS8PrivateKey(privBytes)
	if err != nil {
		return nil, err
	}

	priv, err = assertPriv(parsed)
	if err != nil {
		return nil, err
	}

	return x509.MarshalPKIXPublicKey(priv.PublicKey())
}

func MixKeys(privBytes, pubBytes []byte) (b []byte, err error) {
	privParsed, err := x509.ParsePKCS8PrivateKey(privBytes)
	if err != nil {
		return nil, err
	}
	priv, err := assertPriv(privParsed)
	if err != nil {
		return nil, err
	}

	pubParsed, err := x509.ParsePKIXPublicKey(pubBytes)
	if err != nil {
		return nil, err
	}
	pub, err := assertPub(pubParsed)
	if err != nil {
		return nil, err
	}

	return priv.ECDH(pub)
}

func assertPub(parsedKey any) (k *ecdh.PublicKey, err error) {
	k, ok := parsedKey.(*ecdh.PublicKey)

	if !ok {
		return nil, fmt.Errorf("could not type assert parsed key as *ecdh.PublicKey")
	}

	return k, nil
}

func assertPriv(parsedKey any) (k *ecdh.PrivateKey, err error) {
	k, ok := parsedKey.(*ecdh.PrivateKey)

	if !ok {
		return nil, fmt.Errorf("could not type assert parsed key as *ecdh.PrivateKey")
	}

	return k, nil
}
