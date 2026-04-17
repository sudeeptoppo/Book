const express = require("express");
const bookListing = require("../models/listing.js");
const reviewListing = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../utils/schemaValidate.js");
const listingController = require("../controller/listings.js");
const router = express.Router();
const {
  isLoggedIn,
  isOwner,
  validateListing,
} = require("../middlewares/middlewares.js");

// all listings
router.get(
  "/",
  wrapAsync(listingController.allListings),
);

//create new
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listing/new");
});

//show individual listing
router.get(
  "/:id",
  wrapAsync(listingController.showIndividualListings),
);

//create new listing
router.post(
  "/",
  validateListing,
  isLoggedIn,
  wrapAsync(listingController.createNewListing),
);

//render edit form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm),
);

//update listing
router.put(
  "/:id",
  validateListing,
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.updateListing),
);

//delete listing
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.deleteListing),
);

module.exports = router;
