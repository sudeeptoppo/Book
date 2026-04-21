const bookListing = require("../models/listing.js");

const ExpressError = require("../utils/ExpressError.js");
const axios = require("axios");
const User = require("../models/user");

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

//search books
module.exports.searchBooks = async (req, res) => {
  const query = req.query.q;

  if (!query) {
    req.flash("error", "Type something to search");
    return res.redirect("/listings");
  }

  let books = [];

  // 1️⃣ Search DB
  books = await bookListing.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { author: { $regex: query, $options: "i" } },
    ],
  });

  // 2️⃣ If empty → API
  if (books.length === 0) {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${query}`
      );

      if (response.data.items) {
        books = response.data.items.map((item) => ({
          id: item.id, // 🔥 IMPORTANT
          title: item.volumeInfo.title || "No title",
          author: item.volumeInfo.authors?.join(", ") || "Unknown",
          description: item.volumeInfo.description || "No description",
          image:
            item.volumeInfo.imageLinks?.thumbnail ||
            "https://via.placeholder.com/150",
        }));
      }
    } catch (err) {
      console.log(err);
      req.flash("error", "API error");
      return res.redirect("/listings");
    }
  }

  res.render("listing/search", { books, query });
};

//CLICK BOOK → SAVE + REDIRECT
// get book by externalId

module.exports.getBookByExternalId = async (req, res) => {
  const { externalId } = req.params;

  // 1️⃣ Check DB
  let book = await bookListing.findOne({ externalId });

  // 2️⃣ If not found → API
  if (!book) {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes/${externalId}`
      );

      const data = response.data.volumeInfo;

      book = new bookListing({
        title: data.title || "No title",
        author: data.authors?.join(", ") || "Unknown",
        description: data.description || "No description",
        image:
          data.imageLinks?.thumbnail ||
          "https://via.placeholder.com/150",
        price: 0,
        rating: 0,
        externalId: externalId,
        owner: req.user ? req.user._id : undefined,
      });

      await book.save();
    } catch (err) {
      console.log(err);

      // fallback if duplicate
      book = await bookListing.findOne({ externalId });

      if (!book) {
        req.flash("error", "Book not found");
        return res.redirect("/listings");
      }
    }
  }

  // 3️⃣ Redirect
  res.redirect(`/listings/${book._id}`);
};


module.exports.markAsRead = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(req.user._id);

  // avoid duplicates
  if (!user.readBooks.includes(id)) {
    user.readBooks.push(id);
    await user.save();
  }

  req.flash("success", "Book added to your library!");
  res.redirect(`/listings/${id}`);
};