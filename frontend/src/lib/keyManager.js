import { generateAndExportKeyPair } from "./crypto";
import { axiosInstance } from "./axios";

const PRIVATE_KEY_STORAGE = "chat:privateKeyJwk";
const PUBLIC_KEY_STORAGE = "chat:publicKeyBase64";
const PUBLIC_KEY_SERVER = "key/public-key";

export const ensureKeyPairAndPublish = async () => {
  let privateKeyJwk = JSON.parse(
    localStorage.getItem(PRIVATE_KEY_STORAGE) || "null"
  );
  let publicKeyBase64 = localStorage.getItem(PUBLIC_KEY_STORAGE);

  if (!privateKeyJwk || !publicKeyBase64) {
    const kp = await generateAndExportKeyPair();
    privateKeyJwk = kp.privateKeyJwk;
    publicKeyBase64 = kp.publicKeyBase64;
    localStorage.setItem(PRIVATE_KEY_STORAGE, JSON.stringify(privateKeyJwk));
    localStorage.setItem(PUBLIC_KEY_STORAGE, publicKeyBase64);

    try {
      await axiosInstance.post(PUBLIC_KEY_SERVER, {
        publicKey: publicKeyBase64,
      });
    } catch (err) {
      console.error("Failed to publish public key", err);
    }
  }
  localStorage.setItem("chat:publicKey", publicKeyBase64);
  return privateKeyJwk;
};

export function getStoredPrivateKeyJwk() {
  return JSON.parse(localStorage.getItem(PRIVATE_KEY_STORAGE) || "null");
}

export function getStoredPublicKeyBase64() {
  return localStorage.getItem(PUBLIC_KEY_STORAGE);
}
