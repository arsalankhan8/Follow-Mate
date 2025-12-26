import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Password auth
    passwordHash: {
      type: String,
      select: false,
    },

    // Google auth
    googleId: {
      type: String,
      index: true,
    },

    profilePhoto: String,

    isVerified: {
      type: Boolean,
      default: false,
    },

    // Verification code for signup/email
    verificationCode: { type: String, default: null },
    verificationCodeExpires: { type: Date, default: null },

    // Only for password users
    resetCode: String,
    resetCodeExpires: Date,
    changePasswordCode: String,
    changePasswordCodeExpires: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
