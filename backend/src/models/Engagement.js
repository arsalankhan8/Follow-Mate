import mongoose from "mongoose";

const engagementSchema = new mongoose.Schema(
  {
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      required: true
    },

    type: {
      type: String,
      enum: [
        "message",
        "comment",
        "like",
        "share",
        "connection_request",
        "meeting",
        "call",
        "email",
        "other"
      ],
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    outcome: {
      type: String,
      enum: ["neutral", "positive", "negative", "no_response_yet"],
      default: "neutral"
    },

    notes: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Engagement", engagementSchema);
