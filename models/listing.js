const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const reviewListing = require("./review.js");



const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1589998059171-988b97c09c9d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    set: (v) =>
      v === ""
        ? "https://images.unsplash.com/photo-1589998059171-988b97c09c9d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        : v,
  },
  price: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

//post middleware in app.js for deleting reviews
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing && listing.reviews && listing.reviews.length > 0) {
    await reviewListing.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const bookListing = mongoose.model("bookListing", listingSchema);
module.exports = bookListing;


