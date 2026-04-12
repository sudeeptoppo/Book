const bookListing = require("../models/listing");
const { listingSchema } = require("../utils/schemaValidate.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../utils/schemaValidate.js");
const reviewListing = require("../models/review.js");
const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

const saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  } else {
    res.locals.redirectUrl = null;
  }
  next();
};

const isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await bookListing.findById(id);
  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to edit this listing");
    res.redirect(`/listings/${id}`);
    return;
  }
  next();
};

const validateListing = (req, res, next) => {
  console.log(req.body.listing);
  const result = listingSchema.safeParse(req.body.listing);
  if (!result.success) {
    const errorMessages = result.error.issues
      .map((err) => err.message)
      .join(", ");
    throw new ExpressError(400, `Invalid listing data: ${errorMessages}`);
  }
  next();
};

const validateReview = (req, res, next) => {
  console.log(req.body.review);
  const result = reviewSchema.safeParse(req.body.review);
  if (!result.success) {
    const errorMessages = result.error.issues
      .map((err) => err.message)
      .join(", ");
    throw new ExpressError(400, `Invalid review data: ${errorMessages}`);
  } else {
    next();
  }
};

const isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await reviewListing.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to edit this review");
    res.redirect(`/listings/${id}`);
    return;
  }
  next();
};

module.exports = {
  isLoggedIn,
  saveRedirectUrl,
  isOwner,
  validateListing,
  validateReview,
  isReviewAuthor,
};
