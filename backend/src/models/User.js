import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    googleId: String,
    profilePhoto: String,
    isVerified: { type: Boolean, default: false },
    verificationCode: String,
    verificationCodeExpires: Date,
    resetCode: String,
    resetCodeExpires: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
