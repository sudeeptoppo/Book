const express = require("express");
const bookListing = require("../models/listing.js");
const reviewListing = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../utils/schemaValidate.js");
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middlewares/middlewares.js");



//review add route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(async (req, res) => {
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
  }),
);

//review delete route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    console.log("Deleting review:", reviewId, "from listing:", id);

    const listing = await bookListing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found");
      throw new Error("Listing not found");
    }

    const review = await reviewListing.findById(reviewId);
    if (!review) {
      req.flash("error", "Review not found");
      throw new Error("Review not found");
    }

    await bookListing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });

    await reviewListing.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted successfully!");
    res.redirect(303, `/listings/${id}`);
  }),
);

module.exports = router;
