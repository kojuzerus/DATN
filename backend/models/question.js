const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      default: "",
    },

    answeredBy: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Question", questionSchema);
