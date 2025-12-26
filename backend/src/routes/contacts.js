import express from "express";
import mongoose from "mongoose";
import Contact from "../models/Contact.js";
import Campaign from "../models/Campaign.js"; // Import to register the model
import { authenticate } from "./auth.js";
const router = express.Router();

/**
 * @route   POST /api/contacts
 * @desc    Create new contact
 */
router.post("/", authenticate, async (req, res) => {
  let contactData = {};
  try {
    // Log incoming request for debugging
    console.log("Creating contact - userId:", req.userId);
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // Validate authentication
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized - User ID not found",
      });
    }

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.status(401).json({
        message: "Invalid user ID format",
      });
    }

    // Validate required fields
    if (!req.body.fullName || (typeof req.body.fullName === "string" && req.body.fullName.trim() === "")) {
      return res.status(400).json({
        message: "Full name is required",
      });
    }

    // Prepare contact data
    contactData = {
      fullName: req.body.fullName.trim(),
      user: req.userId,
    };

    // Handle optional fields - only include if they have values
    if (req.body.profileUrl && req.body.profileUrl.trim()) {
      contactData.profileUrl = req.body.profileUrl.trim();
    }

    if (req.body.role && req.body.role.trim()) {
      contactData.role = req.body.role.trim();
    }

    if (req.body.company && req.body.company.trim()) {
      contactData.company = req.body.company.trim();
    }

    // Normalize status - only if provided and not empty
    if (req.body.status && typeof req.body.status === "string" && req.body.status.trim()) {
      const normalizedStatus = req.body.status.toLowerCase().trim();
      // Only set if it's a valid enum value
      const validStatuses = ["prospect", "contacted", "following", "connected", "lead", "client", "inactive"];
      if (validStatuses.includes(normalizedStatus)) {
        contactData.status = normalizedStatus;
      }
    }

    // Normalize priority - only if provided and not empty
    if (req.body.priority && typeof req.body.priority === "string" && req.body.priority.trim()) {
      const normalizedPriority = req.body.priority.toLowerCase().trim();
      // Only set if it's a valid enum value
      const validPriorities = ["low", "medium", "high", "urgent"];
      if (validPriorities.includes(normalizedPriority)) {
        contactData.priority = normalizedPriority;
      }
    }

    // Handle leadScore - convert to number if provided
    if (req.body.leadScore !== undefined && req.body.leadScore !== null && req.body.leadScore !== "") {
      const leadScore = Number(req.body.leadScore);
      if (!isNaN(leadScore)) {
        contactData.leadScore = leadScore;
      }
    }

    // Handle email
    if (req.body.email && req.body.email.trim()) {
      contactData.email = req.body.email.trim();
    }

    // Handle phone
    if (req.body.phone && req.body.phone.trim()) {
      contactData.phone = req.body.phone.trim();
    }

    // Handle dates - only if provided and not empty
    if (req.body.lastContactDate && typeof req.body.lastContactDate === "string" && req.body.lastContactDate.trim() !== "") {
      const date = new Date(req.body.lastContactDate);
      if (!isNaN(date.getTime())) {
        contactData.lastContactDate = date;
      }
    }

    if (req.body.nextFollowUpDate && typeof req.body.nextFollowUpDate === "string" && req.body.nextFollowUpDate.trim() !== "") {
      const date = new Date(req.body.nextFollowUpDate);
      if (!isNaN(date.getTime())) {
        contactData.nextFollowUpDate = date;
      }
    }

    // Handle tags - convert string to array if provided
    if (req.body.tags) {
      if (typeof req.body.tags === "string" && req.body.tags.trim()) {
        // Split by comma or use as single tag
        contactData.tags = req.body.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
      } else if (Array.isArray(req.body.tags)) {
        contactData.tags = req.body.tags.filter(tag => tag && tag.trim());
      }
    }

    // Handle notes
    if (req.body.notes && req.body.notes.trim()) {
      contactData.notes = req.body.notes.trim();
    }

    // Handle campaigns - ensure it's an array
    if (req.body.campaigns) {
      if (Array.isArray(req.body.campaigns)) {
        contactData.campaigns = req.body.campaigns.filter(campaign => campaign);
      } else if (req.body.campaigns) {
        contactData.campaigns = [req.body.campaigns];
      }
    }

    const contact = await Contact.create(contactData);
    
    // Populate campaigns for response
    await contact.populate("campaigns");
    
    res.status(201).json(contact);
  } catch (err) {
    // Handle validation errors
    if (err.name === "ValidationError") {
      const validationErrors = Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      console.error("Validation error:", validationErrors);
      return res.status(400).json({
        message: "Validation error",
        errors: validationErrors,
        error: Object.values(err.errors).map((e) => e.message).join(", "),
      });
    }
    
    // Log the full error for debugging
    console.error("Error creating contact:", {
      message: err.message,
      name: err.name,
      stack: err.stack,
      contactData: contactData,
      userId: req.userId,
    });
    
    res.status(500).json({
      message: "Failed to create contact",
      error: err.message,
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

/**
 * @route   GET /api/contacts
 * @desc    Get all contacts for authenticated user
 */

router.get("/", authenticate, async (req, res) => {
  try {
    // Validate authentication
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized - User ID not found",
      });
    }

    // Filter contacts by authenticated user
    const contacts = await Contact.find({ user: req.userId })
      .populate("campaigns")
      .sort({ createdAt: -1 });

    res.json(contacts);
  } catch (err) {
    console.error("Error fetching contacts:", {
      message: err.message,
      name: err.name,
      stack: err.stack,
      userId: req.userId,
    });
    
    res.status(500).json({
      message: "Failed to fetch contacts",
      error: err.message,
    });
  }
});

/**
 * @route   GET /api/contacts/:id
 * @desc    Get single contact
 */
router.get("/:id", authenticate, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid contact ID format" });
    }

    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.userId, // Ensure user owns this contact
    }).populate("campaigns");

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json(contact);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch contact",
      error: err.message,
    });
  }
});

/**
 * @route   PUT /api/contacts/:id
 * @desc    Update contact
 */
router.put("/:id", authenticate, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid contact ID format" });
    }

    // Normalize status and priority if provided
    if (req.body.status) {
      req.body.status = req.body.status.toLowerCase();
    }

    if (req.body.priority) {
      req.body.priority = req.body.priority.toLowerCase();
    }

    // Prevent user field from being changed
    delete req.body.user;

    const updated = await Contact.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId, // Ensure user owns this contact
      },
      req.body,
      { new: true, runValidators: true }
    ).populate("campaigns");

    if (!updated) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json(updated);
  } catch (err) {
    // Handle validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        error: Object.values(err.errors).map((e) => e.message).join(", "),
      });
    }

    res.status(500).json({
      message: "Failed to update contact",
      error: err.message,
    });
  }
});

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Delete contact
 */
router.delete("/:id", authenticate, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid contact ID format" });
    }

    const deleted = await Contact.findOneAndDelete({
      _id: req.params.id,
      user: req.userId, // Ensure user owns this contact
    });

    if (!deleted) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete contact",
      error: err.message,
    });
  }
});

export default router;
