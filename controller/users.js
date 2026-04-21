module.exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);
    console.log("Registered user:", registeredUser);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to BookReview!");
      res.redirect("/listings");
    });
  } catch (e) {
    console.log(e);
    req.flash("error", "An error occurred while registering.");
    res.redirect("/signup");
  }
};

module.exports.loginUser = async (req, res) => {
  req.flash("success", "Welcome back!");
  let redirectUrl = req.session.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Goodbye come back soon!");
    res.redirect("/listings");
  });
};

module.exports.showProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate("readBooks");

  res.render("users/profile", { user });
};
