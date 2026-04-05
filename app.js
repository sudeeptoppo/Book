const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const mongoUrl = "mongodb://localhost:27017/newBookReview";
const bookListing = require("./models/listing.js");
const reviewListing = require("./models/review.js");
const initData = require("./init/data.js");
const ejs = require("ejs");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./utils/schemaValidate.js");

app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

async function main() {
  await mongoose.connect(mongoUrl);
}

main()
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.render("listing/signup");
});

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

app.get("/testListing", async (req, res) => {
  const sampleListing = new bookListing({
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "A novel set in the Jazz Age",
    image:
      "https://images.unsplash.com/photo-1589998059171-988b97c09c9d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 10,
    rating: 4.5,
  });
  await sampleListing.save();
  console.log("Sample listing saved successfully");
  res.send("Sample listing saved successfully");
});

app.post("/init", async (req, res) => {
  // await bookListing.deleteMany({});
  await bookListing.insertMany(initData);
  res.redirect("/listings");
});

// all listings
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await bookListing.find();
    res.render("listing/index", { allListings });
  }),
);

//create new
app.get("/listings/new", (req, res) => {
  res.render("listing/new");
});

//show individual listing
app.get(
  "/listings/:id",
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
app.post(
  "/listings",
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
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    console.log(id);
    const listing = await bookListing.findById(id);
    console.log(listing);
    res.render("listing/edit", { listing });
  }),
);

//update listing
app.put(
  "/listings/:id",
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
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await bookListing.findByIdAndDelete(id);
    res.redirect("/listings");
  }),
);

//review add route
app.post(
  "/listings/:id/comments",
  validateReview,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    let listing = await bookListing.findById(id);
    const review = new reviewListing(req.body.review);
    if (!listing.reviews) {
      listing.reviews = [];
    }
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    res.redirect(`/listings/${id}`);
  }),
);

app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error/err.ejs", { err });
});

app.listen(9000, () => {
  console.log("Server started on port 9000");
});
