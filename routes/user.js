const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const isLoggedIn = require("../middlewares/middlewares.js");
const userController = require("../controller/users.js");
const { saveRedirectUrl } = require("../middlewares/middlewares.js");

router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(userController.createUser));

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.loginUser,
);

router.post("/logout", userController.logoutUser);
module.exports = router;
