import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateCode } from "../utils/generateCode.js";
import { sendMail } from "../services/mailer.js";
import { verificationEmail, resetPasswordEmail } from "../utils/emailTemplates.js";
import { OAuth2Client } from "google-auth-library";
import upload from "../middlewares/upload.js";
import { uploadToCloudinary } from "../services/cloudinary.js";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const CODE_EXPIRY_MINUTES = 15;
const getExpiryDate = () =>
  new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

// GENERATE TOKEN
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ------------------ SIGNUP ------------------

router.post("/signup", upload.single("profilePhoto"), async (req, res) => {
  const { name, email, password } = req.body;
  let profilePhotoUrl = null;

  // Upload to Cloudinary if user sent a file
  if (req.file) {
    try {
      profilePhotoUrl = await uploadToCloudinary(req.file.buffer);
    } catch (err) {
      return res.status(500).json({ msg: "Image upload failed" });
    }
  }

  // Fallback avatar if no file uploaded
  const finalProfilePhoto = profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

  const hashed = await bcrypt.hash(password, 10);
  const code = generateCode();
  const expiresAt = getExpiryDate();

  let user = await User.findOne({ email });

  if (user) {
    if (user.isVerified) return res.status(400).json({ msg: "Email already exists" });

    user.name = name;
    user.password = hashed;
    user.profilePhoto = finalProfilePhoto;
    user.verificationCode = code;
    user.verificationCodeExpires = expiresAt;
    await user.save();
  } else {
    user = await User.create({
      name,
      email,
      password: hashed,
      verificationCode: code,
      verificationCodeExpires: expiresAt,
      profilePhoto: finalProfilePhoto,
    });
  }

  await sendMail(email, "Verify your Follow Mate account", verificationEmail({ name, code }));

  res.json({ msg: "Verification code sent", userId: user._id });
});


// ------------------ VERIFY EMAIL ------------------

router.post("/verify-email", async (req, res) => {
  const { userId, code } = req.body;
  const user = await User.findById(userId);

  if (!user || user.verificationCode !== code)
    return res.status(400).json({ msg: "Invalid code" });

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
});

// ------------------ RESEND VERIFICATION ------------------

router.post("/resend-verification", async (req, res) => {
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
});

// ------------------ LOGIN ------------------

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "User not found" });

  if (!user.isVerified)
    return res.status(400).json({ msg: "Please verify your email" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ msg: "Invalid password" });

  const token = generateToken(user);

  res.json({ token, user });
});

// ------------------ FORGOT PASSWORD ------------------

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const code = generateCode();

  const user = await User.findOneAndUpdate(
    { email },
    { resetCode: code, resetCodeExpires: getExpiryDate() },
    { new: true }
  );

  if (!user) return res.status(400).json({ msg: "Email not found" });

  await sendMail(
    email,
    "Reset your Follow Mate password",
    resetPasswordEmail({ name: user.name, code })
  );

  res.json({ msg: "Reset code sent", userId: user._id });
});

// ------------------ RESET PASSWORD ------------------

router.post("/reset-password", async (req, res) => {
  const { userId, code, password } = req.body;

  const user = await User.findById(userId);

  if (!user || user.resetCode !== code)
    return res.status(400).json({ msg: "Invalid code" });

  if (!user.resetCodeExpires || user.resetCodeExpires < new Date()) {
    return res.status(400).json({ msg: "Reset code expired" });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetCode = null;
  user.resetCodeExpires = null;
  await user.save();

  res.json({ msg: "Password updated" });
});

// ------------------ VERIFY RESET CODE ------------------

router.post("/verify-reset-code", async (req, res) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return res.status(400).json({ msg: "Missing user or code" });
  }

  const user = await User.findById(userId);
  if (!user || user.resetCode !== code) {
    return res.status(400).json({ msg: "Invalid code" });
  }

  if (!user.resetCodeExpires || user.resetCodeExpires < new Date()) {
    return res.status(400).json({ msg: "Reset code expired, resend a new code" });
  }

  res.json({ msg: "Code verified" });
});

// ------------------ GOOGLE LOGIN ------------------

router.post("/google", async (req, res) => {
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
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        isVerified: true,
        profilePhoto: payload.picture,
      });
    } else {
      if (payload.picture) {
        user.profilePhoto = payload.picture;
      }
      await user.save();
    }

    const token = generateToken(user);
    return res.json({ token, user });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(400).json({ msg: "Google authentication failed" });
  }
});

export default router;
