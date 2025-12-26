import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    campaignName: { type: String, required: true },

    description: { type: String },

    status: {
      type: String,
      enum: ["planning", "active", "paused", "completed", "cancelled", "other"],
      default: "planning"
    },

    type: {
      type: String,
      enum: ["outreach", "follow", "engagement", "content", "nurture", "other"],
      default: "outreach"
    },

    startDate: { type: Date },
    endDate: { type: Date },

    targetContacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contact"
      }
    ]
  },
  { timestamps: true }
);


const Campaign = mongoose.model("Campaign", campaignSchema);
export default Campaign;