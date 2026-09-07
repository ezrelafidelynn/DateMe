import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useMatchStore } from "./useMatchStore";

export const useDiscoverStore = create((set, get) => ({
  stack: [],
  loading: false,

  loadStack: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/discover");
      set({ stack: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load profiles");
    } finally {
      set({ loading: false });
    }
  },

  /** action: "stamp" | "pass"; opener: { image, strokes } | null */
  swipe: async (userId, action, { stampStyle = "heart", opener = null } = {}) => {
    set({ stack: get().stack.filter((u) => u._id !== userId) });
    try {
      const res = await axiosInstance.post("/swipe", { to: userId, action, stampStyle, opener });
      if (res.data.matched && res.data.match) {
        useMatchStore.getState().pushFreshMatch(res.data.match);
      }
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Swipe failed");
      return { matched: false };
    }
  },
}));
