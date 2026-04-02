const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const mongoUrl = "mongodb://localhost:27017/newBookReview";
const bookListing = require("./models/listing.js");
const initData = require("./init/data.js");
const ejs = require("ejs");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

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
app.get("/listings", async (req, res) => {
  const allListings = await bookListing.find();
  res.render("listing/index", { allListings });
});

//create new
app.get("/listings/new", (req, res) => {
  res.render("listing/new");
});

//show individual listing
app.get("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await bookListing.findById(id);
  res.render("listing/show", { listing });
});

//create new listing
app.post("/listings", async (req, res) => {
  const data = req.body.listing;
  const newListing = new bookListing(data);
  await newListing.save();
  res.redirect("/listings");
});

//render edit form
app.get("/listings/:id/edit", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const listing = await bookListing.findById(id);
  console.log(listing);
  res.render("listing/edit", { listing });
});

//update listing
app.put("/listings/:id", async (req, res) => {
  const { id } = req.params;
  await bookListing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
});

//delete listing
app.delete("/listings/:id", async (req, res) => {
  const { id } = req.params;
  await bookListing.findByIdAndDelete(id);
  res.redirect("/listings");
});

app.listen(9000, () => {
  console.log("Server started on port 9000");
});
