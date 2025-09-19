import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthenticationStore } from "./useAuthenticationStore";
import {
  getStoredPrivateKeyJwk,
  getStoredPublicKeyBase64,
} from "../lib/keyManager";
import {
  decryptText,
  deriveAESGCMKey,
  encryptDataUrl,
  encryptText,
  importPrivateKeyJwk,
  importPublicKeyBase64,
} from "../lib/crypto";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  chats: [],
  selectedUser: null,
  isUsersLoading: false,
  isChatsLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getChats: async () => {
    set({ isChatsLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isChatsLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      const msgs = res.data;

      const privateKeyJwk = getStoredPrivateKeyJwk();
      let privateKey;
      if (privateKeyJwk) {
        privateKey = await importPrivateKeyJwk(privateKeyJwk);
      }
      const decryptedMessages = await Promise.all(
        msgs.map(async (m) => {
          if (
            m.ciphertext &&
            m.iv &&
            m.salt &&
            m.senderPublicKey &&
            privateKey
          ) {
            try {
              const peerPub = await importPublicKeyBase64(m.senderPublicKey);
              const { aesKey } = await deriveAESGCMKey(
                privateKey,
                peerPub,
                m.salt
              );
              const text = m.ciphertext
                ? await decryptText(aesKey, m.ciphertext, m.iv)
                : null;

              return {
                ...m,
                decryptedText: text,
              };
            } catch (error) {
              console.error("❌ Failed to decrypt", {
                id: m._id,
                sender: m.senderId,
                hasCipher: !!m.ciphertext,
                hasIv: !!m.iv,
                hasSalt: !!m.salt,
                hasSenderKey: !!m.senderPublicKey,
                error,
              });
              return { ...m, decryptedText: null };
            }
          } else {
            return { ...m, decryptedText: m.text || null };
          }
        })
      );

      set({ messages: decryptedMessages });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const privateKeyJwk = getStoredPrivateKeyJwk();
    try {
      const privateKey = await importPrivateKeyJwk(privateKeyJwk);
      const res = await axiosInstance.get(
        `/key/${selectedUser._id}/public-key`
      );
      console.log("Public key response:", res.data);

      if (!res.data || !res.data.publicKey) {
        throw new Error("No public key returned from server");
      }

      const recipientPubB64 = res.data.publicKey;
      const recipientPubKey = await importPublicKeyBase64(recipientPubB64);

      const { aesKey, saltBase64 } = await deriveAESGCMKey(
        privateKey,
        recipientPubKey
      );

      let payload = {};

      if (messageData.text) {
        const { ciphertext, iv } = await encryptText(aesKey, messageData.text);
        payload.ciphertext = ciphertext;
        payload.iv = iv;
      }

      if (messageData.image) {
        const { ciphertext: imageCipher, iv: imageIv } = await encryptDataUrl(
          aesKey,
          messageData.image
        );
        payload.image = imageCipher;
        payload.imageIv = imageIv;
      }

      const myPublicKeyB64 = getStoredPublicKeyBase64();
      if (!myPublicKeyB64) {
        throw new Error(
          "No stored public key found — did you run ensureKeyPairAndPublish() at login?"
        );
      }

      const body = {
        ...payload,
        salt: saltBase64,
        senderPublicKey: myPublicKeyB64,
      };

      const postRes = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        body
      );
      set({
        messages: [
          ...messages,
          { ...postRes.data, decryptedText: messageData.text },
        ],
      });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  listenToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthenticationStore.getState().socket;

    socket.off("newMessage");

    socket.on("newMessage", async (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const privateKeyJwk = getStoredPrivateKeyJwk();
      if (!privateKeyJwk) {
        set({ messages: [...get().messages, newMessage] });
        return;
      }

      try {
        const privateKey = await importPrivateKeyJwk(privateKeyJwk);
        const peerPub = await importPublicKeyBase64(newMessage.senderPublicKey);
        const { aesKey } = await deriveAESGCMKey(
          privateKey,
          peerPub,
          newMessage.salt
        );

        let decryptedText = null;

        if (newMessage.ciphertext && newMessage.iv) {
          decryptedText = await decryptText(
            aesKey,
            newMessage.ciphertext,
            newMessage.iv
          );
        }

        if (newMessage.image) {
          // if you stored separate imageIv use that; in our sample we used imageIv field
          const imageIv = newMessage.imageIv || newMessage.iv;
          const decryptedImageDataUrl = await decryptText(
            aesKey,
            newMessage.image,
            imageIv
          );
          newMessage.decryptedImage = decryptedImageDataUrl;
        }
        newMessage.decryptedText = decryptedText;
      } catch (error) {
        console.error("Failed to decrypt incoming message", error);
        newMessage.decryptedText = null;
      }

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  ignoreToMessages: () => {
    const socket = useAuthenticationStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
