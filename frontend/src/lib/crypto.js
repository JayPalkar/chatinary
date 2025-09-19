const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const bufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const base64ToBuffer = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

export const generateAndExportKeyPair = async () => {
  const keyPair = await window.crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );
  const publicSpki = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey
  );
  const privateJwk = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.privateKey
  );
  return {
    publicKeyBase64: bufferToBase64(publicSpki),
    privateKeyJwk: privateJwk,
  };
};

export const importPublicKeyBase64 = async (spkiB64) => {
  const buffer = base64ToBuffer(spkiB64);
  return await window.crypto.subtle.importKey(
    "spki",
    buffer,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );
};

export const importPrivateKeyJwk = async (jwk) => {
  return await window.crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );
};

export const deriveAESGCMKey = async (
  privateKey,
  peerPublicKey,
  saltB64 = null
) => {
  const salt = saltB64
    ? base64ToBuffer(saltB64)
    : window.crypto.getRandomValues(new Uint8Array(16)).buffer;

  const sharedSecret = await window.crypto.subtle.deriveBits(
    { name: "ECDH", public: peerPublicKey },
    privateKey,
    256
  );

  const hkdfKey = await window.crypto.subtle.importKey(
    "raw",
    sharedSecret,
    "HKDF",
    false,
    ["deriveKey"]
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt,
      info: encoder.encode("chatinary key"),
    },
    hkdfKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return { aesKey, saltBase64: bufferToBase64(salt) };
};

export const encryptText = async (aesKey, text) => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    aesKey,
    encoder.encode(text)
  );
  return {
    ciphertext: bufferToBase64(ciphertext),
    iv: bufferToBase64(iv.buffer),
  };
};

export const decryptText = async (aesKey, ciphertextB64, ivB64) => {
  const ctBuf = base64ToBuffer(ciphertextB64);
  const ivBuf = base64ToBuffer(ivB64);
  const plainBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBuf, tagLength: 128 },
    aesKey,
    ctBuf
  );
  return decoder.decode(plainBuffer);
};

export async function encryptDataUrl(aesKey, dataUrl) {
  return encryptText(aesKey, dataUrl);
}
