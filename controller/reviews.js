const reviewListing = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const bookListing = require("../models/listing.js");

module.exports.addReview = async (req, res) => {
  const { id } = req.params;
  let listing = await bookListing.findById(id);
  const review = new reviewListing(req.body.review);
  review.author = req.user._id;
  if (!listing.reviews) {
    listing.reviews = [];
  }
  listing.reviews.push(review);
  await review.save();
  await listing.save();
  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  console.log("Deleting review:", reviewId, "from listing:", id);

  const listing = await bookListing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    throw new ExpressError(404, "Listing not found");
  }

  const review = await reviewListing.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found");
    throw new ExpressError(404, "Review not found");
  }

  await bookListing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });

  await reviewListing.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted successfully!");
  res.redirect(303, `/listings/${id}`);
};
