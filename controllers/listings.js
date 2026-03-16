const Listing = require("../models/listing");
const Booking = require("../models/booking");
const User = require("../models/user");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

function normalizeAmenities(amenitiesInput) {
  if (!amenitiesInput) return [];
  if (Array.isArray(amenitiesInput)) {
    return amenitiesInput.map((item) => item.trim()).filter(Boolean);
  }
  return amenitiesInput
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildImages(files = []) {
  return files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
}

async function findConflictingBooking(listingId, checkIn, checkOut) {
  return Booking.findOne({
    listing: listingId,
    status: "confirmed",
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  });
}

module.exports.index = async (req, res) => {
  const { location, category, minPrice, maxPrice, guests } = req.query;

  let searchQuery = {};

  // Location search (search in title, location, country, and description)
  if (location && location.trim() !== "") {
    searchQuery.$or = [
      { location: { $regex: location, $options: "i" } },
      { country: { $regex: location, $options: "i" } },
      { title: { $regex: location, $options: "i" } },
      { description: { $regex: location, $options: "i" } },
    ];
  }

  if (category && category !== "all") {
    searchQuery.category = category;
  }

  if (minPrice || maxPrice) {
    searchQuery.price = {};
    if (minPrice) searchQuery.price.$gte = parseInt(minPrice, 10);
    if (maxPrice) searchQuery.price.$lte = parseInt(maxPrice, 10);
  }

  if (guests) {
    searchQuery.maxGuests = { $gte: parseInt(guests, 10) };
  }

  const allListings = await Listing.find(searchQuery);
  const favoriteIds = req.user?.favorites?.map((id) => id.toString()) || [];
  res.render("listings/index.ejs", {
    allListings,
    searchLocation: location,
    selectedCategory: category || "all",
    favoriteIds,
    filters: {
      minPrice: minPrice || "",
      maxPrice: maxPrice || "",
      guests: guests || "",
    },
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner")
    .populate({
      path: "bookings",
      match: { status: "confirmed" },
      select: "checkIn checkOut guests status",
    });
  if (!listing) {
    req.flash("error", "Listing does not exist");
    res.redirect("/listings");
  }
  const isFavorite =
    req.user?.favorites?.some((favoriteId) => favoriteId.equals(listing._id)) ||
    false;
  res.render("listings/show.ejs", { listing, isFavorite });
};

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.amenities = normalizeAmenities(req.body.listing.amenities);
  const uploadedImages = buildImages(req.files);
  if (uploadedImages.length > 0) {
    newListing.images = uploadedImages;
    newListing.image = uploadedImages[0];
  }
  newListing.geometry = response.body.features[0].geometry;
  let savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exist");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("upload", "upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  Object.assign(listing, req.body.listing);
  listing.amenities = normalizeAmenities(req.body.listing.amenities);

  if (req.files && req.files.length > 0) {
    const uploadedImages = buildImages(req.files);
    listing.images = uploadedImages;
    listing.image = uploadedImages[0];
  }

  await listing.save();

  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.deletedListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  // console.log(deletedListing);
  res.redirect("/listings");
};

module.exports.searchListings = async (req, res) => {
  const { location, category, minPrice, maxPrice, guests } = req.query;

  let searchQuery = {};

  // Location search (search in title, location, country, and description)
  if (location && location.trim() !== "") {
    searchQuery.$or = [
      { location: { $regex: location, $options: "i" } },
      { country: { $regex: location, $options: "i" } },
      { title: { $regex: location, $options: "i" } },
      { description: { $regex: location, $options: "i" } },
    ];
  }

  // Category filter
  if (category && category !== "all") {
    searchQuery.category = category;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    searchQuery.price = {};
    if (minPrice) searchQuery.price.$gte = parseInt(minPrice);
    if (maxPrice) searchQuery.price.$lte = parseInt(maxPrice);
  }

  try {
    const allListings = await Listing.find(searchQuery);

    // If it's an AJAX request, return JSON
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({ listings: allListings });
    }

    // Otherwise render the page
    res.render("listings/index.ejs", {
      allListings,
      searchLocation: location,
      selectedCategory: category || "all",
      favoriteIds: req.user?.favorites?.map((id) => id.toString()) || [],
      filters: {
        minPrice: minPrice || "",
        maxPrice: maxPrice || "",
        guests: guests || "",
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    req.flash("error", "Something went wrong with the search");
    res.redirect("/listings");
  }
};

module.exports.toggleFavorite = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);
  const existingIndex = user.favorites.findIndex((favoriteId) =>
    favoriteId.equals(id)
  );

  if (existingIndex >= 0) {
    user.favorites.splice(existingIndex, 1);
    req.flash("success", "Removed from favorites");
  } else {
    user.favorites.push(id);
    req.flash("success", "Added to favorites");
  }

  await user.save();
  res.redirect(req.get("Referrer") || `/listings/${id}`);
};

module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  const { checkIn, checkOut, guests } = req.body.booking;

  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");
  }

  const guestCount = parseInt(guests, 10);
  if (guestCount > listing.maxGuests) {
    req.flash("error", `This listing supports up to ${listing.maxGuests} guests.`);
    return res.redirect(`/listings/${id}`);
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  const conflictingBooking = await findConflictingBooking(id, start, end);
  if (conflictingBooking) {
    req.flash("error", "Those dates are not available. Please choose different dates.");
    return res.redirect(`/listings/${id}`);
  }

  const booking = new Booking({
    listing: listing._id,
    user: req.user._id,
    checkIn: start,
    checkOut: end,
    guests: guestCount,
    nights,
    totalPrice: nights * listing.price,
  });

  await booking.save();
  listing.bookings.push(booking._id);
  await listing.save();

  req.flash("success", "Booking confirmed!");
  res.redirect("/bookings");
};

module.exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    req.flash("error", "Booking not found");
    return res.redirect("/bookings");
  }

  booking.status = "cancelled";
  await booking.save();

  req.flash("success", "Booking cancelled");
  res.redirect("/bookings");
};
