import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useStickerStore = create((set, get) => ({
  stickers: [],
  loaded: false,

  load: async () => {
    try {
      const res = await axiosInstance.get("/stickers");
      set({ stickers: res.data, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  create: async ({ name, image, strokes }) => {
    try {
      const res = await axiosInstance.post("/stickers", { name, image, strokes });
      set({ stickers: [res.data, ...get().stickers] });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save sticker");
      return null;
    }
  },

  remove: async (id) => {
    set({ stickers: get().stickers.filter((s) => s._id !== id) });
    try {
      await axiosInstance.delete(`/stickers/${id}`);
    } catch {
      /* ignore */
    }
  },
}));
