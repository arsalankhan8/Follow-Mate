// backend/src/models/Campaign.js
import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    campaignName: { type: String, required: true },
    description: { type: String },

    status: {
      type: String,
      enum: ["planning", "active", "paused", "completed", "cancelled", "other"],
      default: "planning",
    },

    type: {
      type: String,
      enum: ["outreach", "follow", "engagement", "content", "nurture", "other"],
      default: "outreach",
    },

    startDate: { type: Date },
    endDate: { type: Date },

    targetContacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contact" }],
    targetContactsCount: { type: Number, default: 0 },

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Campaign = mongoose.model("Campaign", campaignSchema);
export default Campaign;
