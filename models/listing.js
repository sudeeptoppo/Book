const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const reviewListing = require("./review.js");

const listingSchema = new Schema({
  title: String,
  author: String,
  description: String,
  image: String,
  price: Number,
  rating: Number,

  externalId: {
    type: String,
    unique: true,
    sparse: true,
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

//post middleware in app.js for deleting reviews
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing && listing.reviews && listing.reviews.length > 0) {
    await reviewListing.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const bookListing = mongoose.model("bookListing", listingSchema);
module.exports = bookListing;
