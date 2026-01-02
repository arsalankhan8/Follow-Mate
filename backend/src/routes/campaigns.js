// src > routes > campaigns.js

import express from "express";
import Campaign from "../models/Campaign.js";
import { authenticate } from "./auth.js";

const router = express.Router();

/* =========================
   CREATE CAMPAIGN
========================= */
router.post("/", authenticate, async (req, res) => {
  try {
    const {
      campaignName,
      description,
      status,
      type,
      startDate,
      endDate,
      targetContacts,
    } = req.body;

    const campaign = await Campaign.create({
      campaignName,
      description,
      status,
      type,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      targetContacts: Array.isArray(targetContacts) ? targetContacts : [],
      user: req.userId,
    });

    res.status(201).json(campaign);
  } catch (err) {
    console.error("Create Campaign Error:", err);
    res.status(500).json({ message: "Failed to create campaign" });
  }
});

/* =========================
   GET ALL CAMPAIGNS
========================= */

router.get("/", authenticate, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate("targetContacts", "fullName email company role");
    res.json(campaigns);
  } catch (err) {
    console.error("Get Campaigns Error:", err);
    res.status(500).json({ message: "Failed to fetch campaigns" });
  }
});

/* =========================
   GET SINGLE CAMPAIGN
========================= */
router.get("/:id", authenticate, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.userId,
    }).populate("targetContacts", "fullName email company role");

    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });

    res.json(campaign);
  } catch (err) {
    console.error("Get Campaign Error:", err);
    res.status(500).json({ message: "Failed to fetch campaign" });
  }
});

/* =========================
   UPDATE CAMPAIGN
========================= */

router.put("/:id", authenticate, async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);

    if (updates.targetContacts && !Array.isArray(updates.targetContacts)) {
      updates.targetContacts = [];
    }
    
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });

    res.json(campaign);
  } catch (err) {
    console.error("Update Campaign Error:", err);
    res.status(500).json({ message: "Failed to update campaign" });
  }
});

/* =========================
   DELETE CAMPAIGN
========================= */

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });

    res.json({ message: "Campaign deleted successfully" });
  } catch (err) {
    console.error("Delete Campaign Error:", err);
    res.status(500).json({ message: "Failed to delete campaign" });
  }
});

export default router;
