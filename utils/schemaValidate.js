const z = require("zod");

const listingSchema = z.object({
  title: z.string(),
  author: z.string(),
  description: z.string(),
  image: z.string().url().or(z.literal("")).nullable(),
  price: z.coerce.number(),   // ✅ FIX
  rating: z.coerce.number().min(0).max(5), // ✅ FIX
});

const reviewSchema = z.object({
  comment: z.string(),
  rating: z.coerce.number().min(1).max(5),
});

module.exports = { listingSchema, reviewSchema };
