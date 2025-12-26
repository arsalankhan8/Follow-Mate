// backend > src > routes > auth.js

import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ipRateLimiter } from "../middlewares/ipRateLimiter.js";
import { generateCode } from "../utils/generateCode.js";
import { sendMail } from "../services/mailer.js";
import {
  verificationEmail,
  resetPasswordEmail,
  changePasswordEmail,
} from "../utils/emailTemplates.js";
import { auth, OAuth2Client } from "google-auth-library";
import upload from "../middlewares/upload.js";
import { uploadToCloudinary } from "../services/cloudinary.js";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const CODE_EXPIRY_MINUTES = 15;
const getExpiryDate = () =>
  new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ msg: "Invalid token" });
  }
};


// GENERATE TOKEN

const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ------------------ SIGNUP ------------------

router.post(
  "/signup",
  ipRateLimiter("Too many signup attempts from your IP."),
  upload.single("profilePhoto"),
  async (req, res) => {
    const { name, email, password } = req.body;
    let profilePhotoUrl = null;
    const code = generateCode();
    const expiresAt = getExpiryDate();

    // Upload to Cloudinary if user sent a file
    if (req.file) {
      try {
        profilePhotoUrl = await uploadToCloudinary(req.file.buffer);
      } catch (err) {
        return res.status(500).json({ msg: "Image upload failed" });
      }
    }

    // Fallback avatar if no file uploaded
    const finalProfilePhoto =
      profilePhotoUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name
      )}&background=random`;

    const hashed = await bcrypt.hash(password, 10);
    let user = await User.findOne({ email });

    if (user) {
      if (user.googleId && !user.passwordHash) {
        // Google-only user exists
        return res.status(400).json({
          msg: "This email is linked to Google login. Please sign in with Google or set a password via 'Forgot Password'.",
        });
      }

      if (user.isVerified)
        return res.status(400).json({ msg: "Email already exists" });

      user.name = name;
      user.passwordHash = hashed; // <- new field
      user.profilePhoto = finalProfilePhoto;
      user.verificationCode = code;
      user.verificationCodeExpires = expiresAt;
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        passwordHash: hashed, // <- new field
        verificationCode: code,
        verificationCodeExpires: expiresAt,
        profilePhoto: finalProfilePhoto,
      });
    }

    await sendMail(
      email,
      "Verify your Follow Mate account",
      verificationEmail({ name, code })
    );

    res.json({ msg: "Verification code sent", userId: user._id });
  }
);

// ------------------ VERIFY EMAIL ------------------

router.post(
  "/verify-email",
  ipRateLimiter("Too many signup attempts"),
  async (req, res) => {
    const { userId, code } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(400).json({ msg: "User not found" });

    // Safe comparison
    if (String(user.verificationCode).trim() !== String(code).trim()) {
      console.log("DB code:", user.verificationCode, "Received code:", code);
      return res.status(400).json({ msg: "Invalid code" });
    }

    if (
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      return res.status(400).json({ msg: "Verification code expired" });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    res.json({ msg: "Email verified" });
  }
);

// ------------------ RESEND VERIFICATION ------------------

router.post(
  "/resend-verification",
  ipRateLimiter("Too many signup attempts from your IP."),
  async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ msg: "Email is required" });

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "Account not found" });
    if (user.isVerified)
      return res.status(400).json({ msg: "Account already verified" });

    const code = generateCode();
    user.verificationCode = code;
    user.verificationCodeExpires = getExpiryDate();
    await user.save();

    await sendMail(
      email,
      "Verify your Follow Mate account",
      verificationEmail({ name: user.name, code })
    );
    res.json({ msg: "Verification code sent", userId: user._id });
  }
);

// ------------------ LOGIN ------------------

router.post(
  "/login",
  ipRateLimiter("Too many signup attempts from your IP."),
  async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) return res.status(400).json({ msg: "User not found" });

    if (!user.isVerified)
      return res.status(400).json({ msg: "Please verify your email" });

    if (!user.passwordHash) {
      return res.status(400).json({
        msg: "This account is linked to Google login. Please continue with Google or set a password via 'Forgot Password'.",
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ msg: "Invalid password" });

    const token = generateToken(user);
    res.json({ token, user });
  }
);

// ------------------ FORGOT PASSWORD ------------------

router.post(
  "/forgot-password",
  ipRateLimiter("Too many signup attempts from your IP."),
  async (req, res) => {
    const { email } = req.body;
    const code = generateCode();

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) return res.status(400).json({ msg: "Email not found" });

    // Block Google-only users
    if (user.googleId && !user.passwordHash) {
      return res.status(400).json({
        msg: "Password login is not enabled. Use Google login or set a password first.",
      });
    }

    // Set reset code
    user.resetCode = code;
    user.resetCodeExpires = getExpiryDate();
    await user.save();

    await sendMail(
      email,
      "Reset your Follow Mate password",
      resetPasswordEmail({ name: user.name, code })
    );

    res.json({ msg: "Reset code sent", userId: user._id });
  }
);

// ------------------ RESET PASSWORD ------------------

router.post(
  "/reset-password",
  ipRateLimiter("Too many signup attempts from your IP."),
  async (req, res) => {
    const { userId, code, password } = req.body;

    const user = await User.findById(userId);

    if (!user || user.resetCode !== code)
      return res.status(400).json({ msg: "Invalid code" });

    if (!user.resetCodeExpires || user.resetCodeExpires < new Date()) {
      return res.status(400).json({ msg: "Reset code expired" });
    }

    if (user.googleId && !user.passwordHash) {
      return res.status(400).json({
        msg: "Password login is not enabled. Use Google login or set a password first.",
      });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetCode = null;
    user.resetCodeExpires = null;
    await user.save();

    res.json({ msg: "Password updated" });
  }
);

// ------------------ VERIFY RESET CODE ------------------

router.post(
  "/verify-reset-code",
  ipRateLimiter("Too many signup attempts from your IP."),
  async (req, res) => {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ msg: "Missing user or code" });
    }

    const user = await User.findById(userId);
    if (!user || user.resetCode !== code) {
      return res.status(400).json({ msg: "Invalid code" });
    }

    if (!user.resetCodeExpires || user.resetCodeExpires < new Date()) {
      return res
        .status(400)
        .json({ msg: "Reset code expired, resend a new code" });
    }

    res.json({ msg: "Code verified" });
  }
);

// ------------------ GOOGLE LOGIN ------------------

router.post(
  "/google",
  ipRateLimiter("Too many signup attempts from your IP."),
  async (req, res) => {
    const { credential, accessToken } = req.body;

    try {
      let payload;

      // --- ID TOKEN FLOW ---
      if (credential) {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      }

      // --- ACCESS TOKEN FLOW ---
      else if (accessToken) {
        const googleUser = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        ).then((r) => r.json());

        if (!googleUser.email) {
          return res.status(400).json({ msg: "Invalid Google access token" });
        }

        payload = {
          email: googleUser.email,
          name: googleUser.name,
          sub: googleUser.sub,
          picture: googleUser.picture,
        };
      }

      // --- NO TOKEN PROVIDED ---
      else {
        return res.status(400).json({ msg: "Missing Google credential" });
      }

      // --- USER PROCESSING ---
      let user = await User.findOne({ email: payload.email }).select(
        "+passwordHash"
      );

      if (!user) {
        user = await User.create({
          name: payload.name,
          email: payload.email,
          googleId: payload.sub,
          isVerified: true,
          profilePhoto: payload.picture,
        });
      } else {
        // Link Google account if missing
        if (!user.googleId) {
          user.googleId = payload.sub;
        }
        if (payload.picture) user.profilePhoto = payload.picture;
        await user.save();
      }

      const token = generateToken(user);
      return res.json({ token, user });
    } catch (error) {
      console.error("Google auth error:", error);
      return res.status(400).json({ msg: "Google authentication failed" });
    }
  }
);

// ------------------ UPDATE PROFILE PHOTO ------------------

router.put(
  "/profile/photo",
  authenticate,
  upload.single("profilePhoto"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ msg: "Please attach an image file" });
    }

    try {
      const photoUrl = await uploadToCloudinary(req.file.buffer);
      const user = await User.findByIdAndUpdate(
        req.userId,
        { profilePhoto: photoUrl },
        { new: true }
      ).select(
        "-password -verificationCode -verificationCodeExpires -resetCode -resetCodeExpires -changePasswordCode -changePasswordCodeExpires"
      );

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      return res.json({ msg: "Profile photo updated", user });
    } catch (error) {
      console.error("Profile photo update failed:", error);
      return res
        .status(500)
        .json({ msg: "Unable to update profile photo right now" });
    }
  }
);

// ------------------ REQUEST CHANGE PASSWORD CODE ------------------

router.post(
  "/change-password/request",
  ipRateLimiter("Too many signup attempts from your IP."),
  authenticate,
  async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // --- Block Google-only users ---
    if (user.googleId && !user.passwordHash) {
      return res.status(400).json({
        msg: "Password login is not enabled. Use Google login or set a password first.",
      });
    }

    const code = generateCode();
    user.changePasswordCode = code;
    user.changePasswordCodeExpires = getExpiryDate();
    await user.save();

    await sendMail(
      user.email,
      "Change your Follow Mate password",
      changePasswordEmail({ name: user.name, code })
    );

    res.json({ msg: "Change password code sent", userId: user._id });
  }
);

// ------------------ VERIFY CHANGE PASSWORD CODE ------------------

router.post(
  "/change-password/verify-code",
  ipRateLimiter("Too many signup attempts from your IP."),
  authenticate,
  async (req, res) => {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ msg: "Code is required" });
    }

    const user = await User.findById(req.userId);
    if (!user || user.changePasswordCode !== code) {
      return res.status(400).json({ msg: "Invalid code" });
    }

    if (
      !user.changePasswordCodeExpires ||
      user.changePasswordCodeExpires < new Date()
    ) {
      return res
        .status(400)
        .json({ msg: "Change password code expired, request a new code" });
    }

    res.json({ msg: "Code verified" });
  }
);

// ------------------ CHANGE PASSWORD ------------------

router.post(
  "/change-password",
  ipRateLimiter("Too many signup attempts from your IP."),
  authenticate,
  async (req, res) => {
    const { code, newPassword } = req.body;

    if (!code || !newPassword) {
      return res
        .status(400)
        .json({ msg: "Code and new password are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 8 characters" });
    }

    const user = await User.findById(req.userId);
    if (!user || user.changePasswordCode !== code) {
      return res.status(400).json({ msg: "Invalid code" });
    }

    if (
      !user.changePasswordCodeExpires ||
      user.changePasswordCodeExpires < new Date()
    ) {
      return res.status(400).json({ msg: "Change password code expired" });
    }

    // Block Google-only users first
if (user.googleId && !user.passwordHash) {
  return res.status(400).json({
    msg: "Password login is not enabled. Use Google login or set a password first.",
  });
}


    user.passwordHash = await bcrypt.hash(newPassword, 10);

    user.changePasswordCode = null;
    user.changePasswordCodeExpires = null;
    await user.save();

    res.json({ msg: "Password changed successfully" });
  }
);

export default router;
