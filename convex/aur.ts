import { action } from "./_generated/server";
import { v } from "convex/values";

export const search = action({
  args: { query: v.string() },
  returns: v.any(),
  handler: async (_ctx, args) => {
    if (!args.query) {
      return [];
    }
    const response = await fetch(
      `https://aur.archlinux.org/rpc/?v=5&type=search&arg=${encodeURIComponent(
        args.query
      )}`
    );
    if (!response.ok) {
      throw new Error(`AUR API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.results || [];
  },
});
