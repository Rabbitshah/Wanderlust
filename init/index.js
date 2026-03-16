const path = require("path");
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
}

const MONGO_URL = process.env.ATLASDB_URL;

if (!MONGO_URL) {
  throw new Error(
    "ATLASDB_URL is not set. Add it to the project root .env file before running init/index.js."
  );
}

async function main() {
  await mongoose.connect(MONGO_URL);
}

const seedCoordinatesByLocation = {
  Malibu: [-118.6919, 34.0259],
  "New York City": [-74.006, 40.7128],
  Aspen: [-106.8236, 39.1911],
  Florence: [11.2558, 43.7696],
  Portland: [-122.6784, 45.5152],
  Cancun: [-86.8515, 21.1619],
  "Lake Tahoe": [-120.0324, 39.0968],
  "Los Angeles": [-118.2437, 34.0522],
  Verbier: [7.2286, 46.0964],
  "Serengeti National Park": [34.6857, -2.3333],
  Amsterdam: [4.9041, 52.3676],
  Fiji: [178.065, -17.7134],
  Cotswolds: [-1.8433, 51.833],
  Boston: [-71.0589, 42.3601],
  Bali: [115.1889, -8.4095],
  Banff: [-115.5708, 51.1784],
  Miami: [-80.1918, 25.7617],
  Phuket: [98.3381, 7.8804],
  "Scottish Highlands": [-4.2026, 57.1204],
  Dubai: [55.2708, 25.2048],
  Montana: [-110.3626, 46.8797],
  Mykonos: [25.3289, 37.4467],
  "Costa Rica": [-84.09, 9.9281],
  Charleston: [-79.9311, 32.7765],
  Tokyo: [139.6917, 35.6895],
  "New Hampshire": [-71.5724, 43.1939],
  Maldives: [73.2207, 3.2028],
};

function withSeedGeometry(listing) {
  if (listing.geometry?.type && Array.isArray(listing.geometry.coordinates)) {
    return listing;
  }

  const coordinates = seedCoordinatesByLocation[listing.location];
  if (!coordinates) {
    throw new Error(
      `Missing seed coordinates for listing location: ${listing.location}`
    );
  }

  return {
    ...listing,
    geometry: {
      type: "Point",
      coordinates,
    },
  };
}

function withSeedOwner(listing, ownerId) {
  return {
    ...listing,
    owner: ownerId,
  };
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
  const listingsToInsert = initData.data
    .map(withSeedGeometry)
    .map((listing) => withSeedOwner(listing, sampleUser._id));
  await Listing.insertMany(listingsToInsert);

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

async function runSeed() {
  try {
    await main();
    console.log("connected to DB");
    await initDB();
  } catch (err) {
    console.log(err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

runSeed();
