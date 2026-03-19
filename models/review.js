const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  experienceType: {
    type: String,
    enum: ["Stays", "Experiences", "Activities"],
    default: "Stays",
  },
  stayDuration: {
    type: Number, // Number of nights
    min: 1,
  },
  visitDate: {
    type: Date,
    required: true,
  },
  photos: [
    {
      url: String,
      filename: String,
    },
  ],
  helpful: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
});

// Update the updatedAt field before saving
reviewSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

// Virtual for helpful count
reviewSchema.virtual("helpfulCount").get(function () {
  return this.helpful.length;
});

// Ensure virtuals are serialized
reviewSchema.set("toJSON", { virtuals: true });
reviewSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Review", reviewSchema);
