const express = require("express");
const router = express.Router({});
const User = require("../models/user.js");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const {
  saveRedirectUrl,
  isLoggedIn,
  isBookingOwner,
} = require("../middlewares.js");

const userController = require("../controllers/users.js");

router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signupPage));

router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    wrapAsync(userController.loginPage)
  );

router.get("/logout", userController.logoutPage);
router.get("/profile", isLoggedIn, wrapAsync(userController.profilePage));
router.get("/bookings", isLoggedIn, wrapAsync(userController.bookingsPage));
router.delete(
  "/bookings/:bookingId",
  isLoggedIn,
  isBookingOwner,
  wrapAsync(require("../controllers/listings.js").cancelBooking)
);

module.exports = router;
