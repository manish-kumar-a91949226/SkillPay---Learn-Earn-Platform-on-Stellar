import { Router } from "express";
import Challenge from "../models/Challenge.js";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const NATIVE_XLM_SAC = process.env.NATIVE_XLM_SAC;

// GET /api/challenges - browse all open challenges (learners + mentors)
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { status, difficulty } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;

    const challenges = await Challenge.find(filter)
      .populate("mentor", "name email walletAddress")
      .sort({ createdAt: -1 });

    res.json({ challenges });
  } catch (err) {
    next(err);
  }
});

// GET /api/challenges/:id
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id).populate(
      "mentor",
      "name email walletAddress"
    );
    if (!challenge) return res.status(404).json({ error: "Challenge not found" });
    res.json({ challenge });
  } catch (err) {
    next(err);
  }
});

// POST /api/challenges - mentor creates a challenge listing (DB only, not yet on-chain)
router.post("/", requireAuth, requireRole("mentor"), async (req, res, next) => {
  try {
    const { title, description, reward, deadline, difficulty } = req.body;

    if (!title || !description || !reward || !deadline) {
      return res.status(400).json({ error: "title, description, reward, and deadline are required" });
    }

    const challenge = await Challenge.create({
      title,
      description,
      reward,
      deadline,
      difficulty: difficulty || "beginner",
      mentor: req.user.id,
    });

    res.status(201).json({ challenge });
  } catch (err) {
    next(err);
  }
});

// POST /api/challenges/:id/fund - mentor escrows the reward pool on-chain
router.post("/:id/fund", requireAuth, requireRole("mentor"), async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ error: "Challenge not found" });
    if (challenge.mentor.toString() !== req.user.id) {
      return res.status(403).json({ error: "Only the creating mentor can fund this challenge" });
    }
    if (challenge.contractStatus !== "unfunded") {
      return res.status(409).json({ error: "Challenge is already funded or paid" });
    }

    const mentor = await User.findById(req.user.id).select("+walletSecret");
    if (!mentor) return res.status(404).json({ error: "Mentor account not found" });

    const { onChainId, txHash } = req.body;
    if (onChainId === undefined || !txHash) {
      return res.status(400).json({ error: "onChainId and txHash are required from the frontend" });
    }

    challenge.onChainId = onChainId;
    challenge.contractStatus = "funded";
    challenge.status = "funded";
    challenge.fundingTxHash = txHash;
    await challenge.save();

    res.json({ challenge, txHash });
  } catch (err) {
    next(err);
  }
});

export default router;
