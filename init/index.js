const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  await Review.deleteMany({});

  // Create a sample user for reviews
  let sampleUser = await User.findOne({ username: "sampleuser" });
  if (!sampleUser) {
    sampleUser = new User({
      username: "sampleuser",
      email: "sample@example.com",
      password: "password123",
    });
    await sampleUser.save();
  }

  // Insert sample listings
  await Listing.insertMany(initData.data);

  // Get the inserted listings to associate with reviews
  const listings = await Listing.find({});

  // Create sample reviews with listing associations
  const sampleReviews = initData.reviews.map((review, index) => ({
    ...review,
    author: sampleUser._id,
    listing: listings[index % listings.length]._id, // Distribute reviews across listings
  }));

  await Review.insertMany(sampleReviews);

  console.log("data was initialized");
};

initDB();
