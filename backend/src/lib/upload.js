import cloudinary from "./cloudinary.js";

export const hasCloudinary =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

/**
 * Normalize an image reference for storage.
 *
 * - If Cloudinary is configured and the input is a data URL, upload it and
 *   return the hosted URL.
 * - Otherwise return the input untouched, so EzMatch runs with zero image
 *   config in local dev (data URLs are just stored inline in Mongo).
 */
export async function uploadImage(input, folder = "ezmatch") {
  if (!input) return "";
  if (!hasCloudinary) return input;
  if (typeof input !== "string" || !input.startsWith("data:")) return input;

  const res = await cloudinary.uploader.upload(input, { folder });
  return res.secure_url;
}
