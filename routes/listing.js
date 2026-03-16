const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {
  isLoggedIn,
  isOwner,
  validateListing,
  validateBooking,
} = require("../middlewares.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Search route
router.get("/search", wrapAsync(listingController.searchListings));

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.array("listing[images]", 5),
    validateListing,
    wrapAsync(listingController.createListing)
  );

// New route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.array("listing[images]", 5),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deletedListing));

router.post(
  "/:id/favorite",
  isLoggedIn,
  wrapAsync(listingController.toggleFavorite)
);

router.post(
  "/:id/bookings",
  isLoggedIn,
  validateBooking,
  wrapAsync(listingController.createBooking)
);

// Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
