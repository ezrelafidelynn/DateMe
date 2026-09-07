import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useMatchStore = create((set, get) => ({
  matches: [],
  incomingStamps: [],
  loading: false,
  freshMatch: null, // socket-pushed match -> MatchModal on any screen

  loadMatches: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/matches");
      set({ matches: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load matches");
    } finally {
      set({ loading: false });
    }
  },

  loadIncomingStamps: async () => {
    try {
      const res = await axiosInstance.get("/swipe/incoming");
      set({ incomingStamps: res.data });
    } catch {
      /* non-critical */
    }
  },

  unmatch: async (matchId) => {
    try {
      await axiosInstance.delete(`/matches/${matchId}`);
      set({ matches: get().matches.filter((m) => m._id !== matchId) });
      toast.success("Unmatched");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unmatch");
    }
  },

  block: async (userId) => {
    try {
      await axiosInstance.post(`/matches/block/${userId}`);
      set({ matches: get().matches.filter((m) => m.withUser?._id !== userId) });
      toast.success("Blocked");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to block");
    }
  },

  report: async (payload) => {
    try {
      await axiosInstance.post("/matches/report", payload);
      toast.success("Report sent to moderation");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to report");
    }
  },

  applyReveal: (matchId, revealProgress) =>
    set({
      matches: get().matches.map((m) =>
        m._id === matchId ? { ...m, revealProgress } : m
      ),
    }),

  clearFreshMatch: () => set({ freshMatch: null }),

  pushFreshMatch: (match) =>
    set({ freshMatch: match, matches: dedupePrepend(match, get().matches) }),

  /** Wire socket listeners once, after auth connects. */
  subscribe: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("match:new");
    socket.off("match:closed");
    socket.on("match:new", (match) => {
      set({ freshMatch: match, matches: dedupePrepend(match, get().matches) });
    });
    socket.on("match:closed", ({ matchId }) => {
      set({ matches: get().matches.filter((m) => m._id !== matchId) });
    });
  },
  unsubscribe: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("match:new");
    socket?.off("match:closed");
  },
}));

function dedupePrepend(match, list) {
  const shaped = {
    _id: match._id,
    withUser: match.withUser,
    revealProgress: match.revealProgress || 0,
    messageCount: match.messageCount || 0,
    lastMessageAt: match.lastMessageAt,
    createdAt: match.createdAt,
  };
  return [shaped, ...list.filter((m) => m._id !== match._id)];
}
