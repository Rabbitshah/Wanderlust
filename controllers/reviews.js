const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  newReview.listing = listing._id;

  // Set visit date if not provided
  if (!newReview.visitDate) {
    newReview.visitDate = new Date();
  }

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  // Update listing rating
  await updateListingRating(listing._id);

  req.flash("success", "New review created!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  // Update listing rating after deletion
  await updateListingRating(id);

  req.flash("success", "Review deleted!");
  res.redirect(`/listings/${id}`);
};

// New: Get all reviews page
module.exports.getAllReviews = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;

  const filter = {};

  // Filter by experience type
  if (req.query.experienceType) {
    filter.experienceType = req.query.experienceType;
  }

  // Filter by rating
  if (req.query.rating) {
    filter.rating = parseInt(req.query.rating);
  }

  // Filter by verified reviews
  if (req.query.verified === "true") {
    filter.isVerified = true;
  }

  // Filter by featured reviews
  if (req.query.featured === "true") {
    filter.isFeatured = true;
  }

  const reviews = await Review.find(filter)
    .populate("author", "username")
    .populate("listing", "title location country image price")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalReviews = await Review.countDocuments(filter);
  const totalPages = Math.ceil(totalReviews / limit);

  // Get review statistics
  const stats = await Review.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: "$rating",
        },
      },
    },
  ]);

  const ratingDistribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  if (stats.length > 0 && stats[0].ratingDistribution) {
    stats[0].ratingDistribution.forEach((rating) => {
      ratingDistribution[rating]++;
    });
  }

  res.render("reviews/index.ejs", {
    reviews,
    currentPage: page,
    totalPages,
    totalReviews,
    stats: stats[0] || { averageRating: 0, totalReviews: 0 },
    ratingDistribution,
    filters: req.query,
  });
};

// New: Get single review page
module.exports.getReview = async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId)
    .populate("author", "username")
    .populate("listing", "title location country image price description");

  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect("/reviews");
  }

  // Get related reviews
  const relatedReviews = await Review.find({
    listing: review.listing._id,
    _id: { $ne: reviewId },
  })
    .populate("author", "username")
    .limit(3);

  res.render("reviews/show.ejs", { review, relatedReviews });
};

// New: Toggle helpful vote
module.exports.toggleHelpful = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(404).json({ error: "Review not found" });
  }

  const isHelpful = review.helpful.includes(userId);

  if (isHelpful) {
    review.helpful = review.helpful.filter((id) => !id.equals(userId));
  } else {
    review.helpful.push(userId);
  }

  await review.save();

  res.json({
    helpfulCount: review.helpfulCount,
    isHelpful: !isHelpful,
  });
};

// New: Get reviews for a specific listing
module.exports.getListingReviews = async (req, res) => {
  const { listingId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ listing: listingId })
    .populate("author", "username")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalReviews = await Review.countDocuments({ listing: listingId });
  const totalPages = Math.ceil(totalReviews / limit);

  res.json({
    reviews,
    currentPage: page,
    totalPages,
    totalReviews,
  });
};

// New: Update review
module.exports.updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect("/reviews");
  }

  // Check if user is the author
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You don't have permission to edit this review!");
    return res.redirect(`/reviews/${reviewId}`);
  }

  Object.assign(review, req.body.review);
  await review.save();

  // Update listing rating
  await updateListingRating(review.listing);

  req.flash("success", "Review updated!");
  res.redirect(`/reviews/${reviewId}`);
};

// Helper function to update listing rating
async function updateListingRating(listingId) {
  const reviews = await Review.find({ listing: listingId });

  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Listing.findByIdAndUpdate(listingId, {
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length,
    });
  } else {
    await Listing.findByIdAndUpdate(listingId, {
      rating: 5.0,
      reviewCount: 0,
    });
  }
}
