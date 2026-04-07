const express = require("express");
const bookListing = require("../models/listing.js");
const reviewListing = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../utils/schemaValidate.js");
const router = express.Router();



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




// all listings
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await bookListing.find();
    res.render("listing/index", { allListings });
  }),
);

//create new
router.get("/new", (req, res) => {
  res.render("listing/new");
});

//show individual listing
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await bookListing.findById(id).populate("reviews");
    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }
    res.render("listing/show", { listing });
  }),
);

//create new listing
router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res) => {
    const data = req.body.listing;
    if (!data) {
      throw new ExpressError(400, "Invalid listing data");
    }
    const listing = {
      title: data.title,
      author: data.author,
      description: data.description,
      image: data.image,
      price: Number(data.price), // ✅ convert
      rating: Number(data.rating), // ✅ convert
    };
    const newListing = new bookListing(listing);
    await newListing.save();
    res.redirect("/listings");
  }),
);

//render edit form
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    console.log(id);
    const listing = await bookListing.findById(id);
    console.log(listing);
    res.render("listing/edit", { listing });
  }),
);

//update listing
router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    // safety check
    if (!req.body.listing) {
      throw new ExpressError(400, "Invalid listing data");
    }

    const data = req.body.listing;

    // sanitize + ensure correct types
    const updatedListing = {
      title: data.title,
      author: data.author,
      description: data.description,
      image: data.image || null,
      price: Number(data.price),
      rating: Number(data.rating),
    };

    // update with validation
    const listing = await bookListing.findByIdAndUpdate(id, updatedListing, {
      returnDocument: "after", // return updated doc
      runValidators: true,
    });

    // if listing not found
    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    res.redirect(`/listings/${id}`);
  }),
);

//delete listing
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await bookListing.findByIdAndDelete(id);
    res.redirect("/listings");
  }),
);

module.exports = router;