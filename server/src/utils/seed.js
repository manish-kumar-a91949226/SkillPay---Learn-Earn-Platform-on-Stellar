import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Challenge from "../models/Challenge.js";
import { createFundedWallet } from "../config/stellar.js";

async function seed() {
  await connectDB();

  const email = "mentor@skillpay.dev";
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Seed mentor already exists, skipping.");
    process.exit(0);
  }

  console.log("Creating + funding a testnet wallet for the demo mentor (this calls Friendbot)...");
  const { publicKey, secretKey } = await createFundedWallet();

  const passwordHash = await bcrypt.hash("ChangeMe123!", 10);
  const mentor = await User.create({
    name: "Demo Mentor",
    email,
    password: passwordHash,
    role: "mentor",
    walletAddress: publicKey,
    walletSecret: secretKey,
  });

  await Challenge.create({
    title: "Build a Personal Portfolio",
    description: "Ship a responsive personal portfolio site deployed live, linked from your GitHub.",
    reward: 50,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21), // 3 weeks out
    difficulty: "beginner",
    mentor: mentor._id,
  });

  console.log("Seeded demo mentor:", email, "/ ChangeMe123!");
  console.log("Mentor wallet:", publicKey);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
