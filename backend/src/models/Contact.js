import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    profileUrl: { type: String },

    role: { type: String },
    company: { type: String },

    status: {
      type: String,
      enum: [
        "prospect",
        "contacted",
        "following",
        "connected",
        "lead",
        "client",
        "inactive",
      ],
      default: "prospect",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    campaigns: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campaign",
      },
    ],

    leadScore: { type: Number, default: 0 },

    email: { type: String },
    phone: { type: String },

    lastContactDate: { type: Date },
    nextFollowUpDate: { type: Date },

    tags: [{ type: String }],
    notes: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },

  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);
