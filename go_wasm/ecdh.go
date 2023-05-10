package main

func newPrivateKey() []byte {
	return []byte("secretkey")
}

func publicKey(privateKey []byte) []byte {
	return privateKey
}

func mixKeys(privateKey, publicKey []byte) []byte {
	return append(privateKey, publicKey...)
}

func encryptString(s string, secretKey []byte) string {
	return s
}

func decryptString(s string, secretKey []byte) string {
	return s
}