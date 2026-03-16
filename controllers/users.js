const User = require("../models/user.js");
const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signupPage = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.loginPage = async (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = res.locals.redirectUrl || "/listings";
  // delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logoutPage = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have logged out!");
    res.redirect("/listings");
  });
};

module.exports.profilePage = async (req, res) => {
  const user = await User.findById(req.user._id).populate("favorites");
  const myListings = await Listing.find({ owner: req.user._id });
  const myBookings = await Booking.find({
    user: req.user._id,
    status: "confirmed",
  })
    .populate("listing")
    .sort({ createdAt: -1 })
    .limit(3);

  res.render("users/profile.ejs", { user, myListings, myBookings });
};

module.exports.bookingsPage = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });

  res.render("users/bookings.ejs", { bookings });
};
