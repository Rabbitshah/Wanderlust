const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const { location } = req.query;

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

  const allListings = await Listing.find(searchQuery);
  res.render("listings/index.ejs", { allListings, searchLocation: location });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing does not exist");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
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
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

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
      searchParams: req.query,
    });
  } catch (error) {
    console.error("Search error:", error);
    req.flash("error", "Something went wrong with the search");
    res.redirect("/listings");
  }
};
