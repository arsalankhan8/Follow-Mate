// src/routes/engagements.js

import express from "express";
import Engagement from "../models/Engagement.js";
import { authenticate } from "./auth.js";

const router = express.Router();

/* =========================
   CREATE ENGAGEMENT
========================= */
router.post("/", authenticate, async (req, res) => {
  try {
    const { contact, type, date, outcome, notes } = req.body;

    const engagement = await Engagement.create({
      contact,
      type,
      date: date ? new Date(date) : undefined,
      outcome,
      notes,
      user: req.userId, // ✅ requires user field in schema (see note below)
    });

    res.status(201).json(engagement);
  } catch (err) {
    console.error("Create Engagement Error:", err);
    res.status(500).json({ message: "Failed to create engagement" });
  }
});

/* =========================
   GET ALL ENGAGEMENTS
========================= */
router.get("/", authenticate, async (req, res) => {
  try {
    const engagements = await Engagement.find({ user: req.userId }) // ✅ requires user field in schema
      .sort({ createdAt: -1 })
      .populate("contact", "fullName email company role");

    res.json(engagements);
  } catch (err) {
    console.error("Get Engagements Error:", err);
    res.status(500).json({ message: "Failed to fetch engagements" });
  }
});

/* =========================
   GET SINGLE ENGAGEMENT
========================= */
router.get("/:id", authenticate, async (req, res) => {
  try {
    const engagement = await Engagement.findOne({
      _id: req.params.id,
      user: req.userId, // ✅ requires user field in schema
    }).populate("contact", "fullName email company role");

    if (!engagement)
      return res.status(404).json({ message: "Engagement not found" });

    res.json(engagement);
  } catch (err) {
    console.error("Get Engagement Error:", err);
    res.status(500).json({ message: "Failed to fetch engagement" });
  }
});

/* =========================
   UPDATE ENGAGEMENT
========================= */
router.put("/:id", authenticate, async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.date) updates.date = new Date(updates.date);

    const engagement = await Engagement.findOneAndUpdate(
      { _id: req.params.id, user: req.userId }, // ✅ requires user field in schema
      updates,
      { new: true, runValidators: true }
    );

    if (!engagement)
      return res.status(404).json({ message: "Engagement not found" });

    res.json(engagement);
  } catch (err) {
    console.error("Update Engagement Error:", err);
    res.status(500).json({ message: "Failed to update engagement" });
  }
});

/* =========================
   DELETE ENGAGEMENT
========================= */
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const engagement = await Engagement.findOneAndDelete({
      _id: req.params.id,
      user: req.userId, // ✅ requires user field in schema
    });

    if (!engagement)
      return res.status(404).json({ message: "Engagement not found" });

    res.json({ message: "Engagement deleted successfully" });
  } catch (err) {
    console.error("Delete Engagement Error:", err);
    res.status(500).json({ message: "Failed to delete engagement" });
  }
});

export default router;
