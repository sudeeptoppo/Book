const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const mongoUrl = "mongodb://localhost:27017/newBookReview";
const bookListing = require("./models/listing.js");
const initData = require("./init/data.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const user = require("./routes/user.js");

app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionOptions = {
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
};
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  console.log(req.user);
  res.locals.url = req.originalUrl;
  console.log("Current URL:", req.originalUrl);
  next();
});

app.get("/", (req, res) => {
  res.render("listing/signup");
});

app.use("/listings", listings);
app.use("/listings/:id/comments", reviews);
app.use("/", user);

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
  await bookListing.deleteMany({});
  initData = initData.map((listing) => ({
    ...listing,
    owner: "69d97aae8ba7fdf0949adc77",
  }));
  await bookListing.insertMany(initData);
  res.redirect("/listings");
});

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
