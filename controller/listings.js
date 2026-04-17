const bookListing = require("../models/listing.js");

const ExpressError = require("../utils/ExpressError.js");

module.exports.allListings = async (req, res) => {
  const allListings = await bookListing.find();
  res.render("listing/index", { allListings });
};

module.exports.showIndividualListings = async (req, res) => {
  const { id } = req.params;
  const listing = await bookListing
    .findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  console.log(listing);
  res.render("listing/show", { listing });
};

module.exports.createNewListing = async (req, res) => {
  const data = req.body.listing;

  if (!data) {
    req.flash("error", "Invalid listing data");
    req.flash("error", "Please fill out all required fields correctly.");
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
  console.log(newListing);
  newListing.owner = req.user._id;
  req.flash("success", "Listing created successfully!");
  await newListing.save();
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const listing = await bookListing.findById(id);
  console.log(listing);

  res.render("listing/edit", { listing });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  // safety check
  if (!req.body.listing) {
    req.flash("error", "Invalid listing data");
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
    req.flash("error", "Listing not found");
    throw new ExpressError(404, "Listing not found");
  }
  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await bookListing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
};
