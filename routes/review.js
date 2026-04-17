const express = require("express");
const bookListing = require("../models/listing.js");
const reviewListing = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../utils/schemaValidate.js");
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middlewares/middlewares.js");
const reviewController = require("../controller/reviews.js")



//review add route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.addReview),
);

//review delete route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview),
);

module.exports = router;
