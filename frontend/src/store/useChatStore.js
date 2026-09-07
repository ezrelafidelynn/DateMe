import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useMatchStore } from "./useMatchStore";

export const useChatStore = create((set, get) => ({
  activeMatch: null,
  messages: [],
  isLoading: false,
  isSending: false,
  peerTyping: false,

  openThread: async (matchId) => {
    set({ isLoading: true, messages: [], activeMatch: null });
    try {
      const [matchRes, msgRes] = await Promise.all([
        axiosInstance.get(`/matches/${matchId}`),
        axiosInstance.get(`/messages/${matchId}`),
      ]);
      set({ activeMatch: matchRes.data, messages: msgRes.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not open chat");
    } finally {
      set({ isLoading: false });
    }
  },

  closeThread: () => set({ activeMatch: null, messages: [], peerTyping: false }),

  /** payload: { type, text?, image?, sketch?, sticker?, audio?, game? } */
  send: async (payload) => {
    const { activeMatch } = get();
    if (!activeMatch) return;
    set({ isSending: true });
    try {
      const res = await axiosInstance.post(`/messages/${activeMatch._id}`, payload);
      set({
        messages: [...get().messages, res.data.message],
        activeMatch: { ...activeMatch, revealProgress: res.data.revealProgress },
      });
      useMatchStore.getState().applyReveal(activeMatch._id, res.data.revealProgress);
    } catch (error) {
      toast.error(error.response?.data?.message || "Message failed");
    } finally {
      set({ isSending: false });
    }
  },

  revealMessage: async (id) => {
    set({
      messages: get().messages.map((m) => (m._id === id ? { ...m, blurUntilOpened: false } : m)),
    });
    try {
      await axiosInstance.patch(`/messages/reveal/${id}`);
    } catch {
      /* visual-only fallback is fine */
    }
  },

  setTyping: (isTyping) => {
    const { activeMatch } = get();
    const socket = useAuthStore.getState().socket;
    if (!activeMatch || !socket) return;
    socket.emit("chat:typing", {
      to: activeMatch.withUser._id,
      matchId: activeMatch._id,
      isTyping,
    });
  },

  subscribe: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("chat:typing");
    socket.off("match:reveal");

    socket.on("newMessage", (msg) => {
      const { activeMatch } = get();
      if (!activeMatch || String(msg.matchId) !== String(activeMatch._id)) return;
      set({ messages: [...get().messages, msg], peerTyping: false });
    });

    socket.on("chat:typing", ({ matchId, isTyping }) => {
      const { activeMatch } = get();
      if (activeMatch && String(matchId) === String(activeMatch._id)) {
        set({ peerTyping: !!isTyping });
      }
    });

    socket.on("match:reveal", ({ matchId, revealProgress }) => {
      const { activeMatch } = get();
      if (activeMatch && String(matchId) === String(activeMatch._id)) {
        set({ activeMatch: { ...activeMatch, revealProgress } });
      }
      useMatchStore.getState().applyReveal(matchId, revealProgress);
    });
  },

  unsubscribe: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
    socket?.off("chat:typing");
    socket?.off("match:reveal");
  },
}));
