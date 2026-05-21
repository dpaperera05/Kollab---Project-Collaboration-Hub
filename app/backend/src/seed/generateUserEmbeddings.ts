/**
 * generateUserEmbeddings.ts
 *
 * Targeted user embedding generation script for Kollab users.
 *
 * Finds eligible users (members/mentors with completed onboarding and public
 * profiles) who are missing recommendation embeddings, then generates and stores
 * embeddings using the existing user embedding service.
 *
 * Usage:
 *   ALLOW_USER_EMBEDDING_SEED=true npm run seed:user-embeddings
 *
 * Safety:
 *   - Requires ALLOW_USER_EMBEDDING_SEED=true environment variable
 *   - Only processes users missing embeddings
 *   - Uses existing embedding service (no manual array creation)
 *   - Does not modify user profile data, passwords, emails, or roles
 *   - Sequential processing to avoid overloading embedding service
 *   - Clear error if embedding service is offline
 */

import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/user.model";
import { generateAndStoreUserRecommendationEmbedding } from "../services/userEmbedding.service";

// ── Environment guard ──────────────────────────────────────────────────────────

if (process.env.ALLOW_USER_EMBEDDING_SEED !== "true") {
  console.error("\n❌ ALLOW_USER_EMBEDDING_SEED must be set to true before running this script.\n");
  process.exit(1);
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Check if a user has at least one useful profile signal that can be used
 * for recommendation embeddings.
 */
function hasUsefulProfileSignals(user: any): boolean {
  const profile = user.profile;
  if (!profile) return false;

  const signals = [
    profile.skills,
    profile.techStack,
    profile.expertiseSkills,
    profile.preferredRoles,
    profile.domainInterests,
    profile.headline,
  ];

  for (const signal of signals) {
    if (Array.isArray(signal) && signal.length > 0) return true;
    if (typeof signal === "string" && signal.trim().length > 0) return true;
  }

  return false;
}

/**
 * Check if a user is missing a recommendation embedding.
 */
function isMissingEmbedding(user: any): boolean {
  const embedding = user.profile?.recommendationEmbedding;
  return !embedding || !Array.isArray(embedding) || embedding.length === 0;
}

// ── Main function ──────────────────────────────────────────────────────────────

async function generateUserEmbeddings() {
  let exitCode = 0;

  try {
    console.log("\n🧠 Starting user embedding generation...\n");

    // Connect to database
    await connectDB();

    // ── Find eligible users ───────────────────────────────────────────────
    console.log("🔍 Finding eligible users...\n");

    const eligibleUsers = await User.find({
      userType: { $in: ["member", "mentor"] },
      onboardingCompleted: true,
      isEmailVerified: true,
      isProfilePublic: { $ne: false },
    })
      .select(
        "name email userType profile.skills profile.techStack profile.expertiseSkills profile.preferredRoles profile.domainInterests profile.headline profile.recommendationEmbedding"
      )
      .lean()
      .exec();

    console.log(`   Found ${eligibleUsers.length} eligible users (members/mentors with verified emails).\n`);

    // ── Filter users with useful signals ──────────────────────────────────
    const usersWithSignals = eligibleUsers.filter((user) => hasUsefulProfileSignals(user));

    console.log(
      `   ${usersWithSignals.length} users have useful profile signals (skills, roles, interests, etc.).\n`
    );

    if (usersWithSignals.length === 0) {
      console.log("✅ No users with profile signals found. Nothing to do.\n");
      return;
    }

    // ── Identify users missing embeddings ─────────────────────────────────
    const missingEmbeddings = usersWithSignals.filter((user) => isMissingEmbedding(user));

    console.log(`   ${missingEmbeddings.length} users are missing recommendation embeddings.\n`);

    if (missingEmbeddings.length === 0) {
      console.log("✅ All eligible users already have embeddings. Nothing to do.\n");
      return;
    }

    // ── Process users sequentially ────────────────────────────────────────
    console.log("💾 Generating embeddings sequentially...\n");

    let successCount = 0;
    let failedCount = 0;

    for (const user of missingEmbeddings) {
      try {
        console.log(`   Processing: ${user.name} (${user.email}, ${user.userType})`);

        await generateAndStoreUserRecommendationEmbedding(user._id.toString());

        console.log(`   ✅ Success\n`);
        successCount++;
      } catch (err: any) {
        console.error(`   ❌ Failed: ${err.message}\n`);

        // Check for embedding service offline error
        if (
          err.message?.includes("ECONNREFUSED") ||
          err.message?.includes("connect") ||
          err.message?.includes("fetch failed")
        ) {
          console.error(
            "\n⚠️  Embedding service appears to be offline.\n" +
              "   Please start the embedding service on port 8001:\n" +
              "   cd app/embedding-service && python main.py\n"
          );
          exitCode = 1;
          break;
        }

        failedCount++;
      }
    }

    // ── Final verification ────────────────────────────────────────────────
    console.log("🔍 Verifying final state...\n");

    const verifiedUsers = await User.find({
      _id: { $in: usersWithSignals.map((u) => u._id) },
    })
      .select("profile.recommendationEmbedding")
      .lean()
      .exec();

    const withEmbeddings = verifiedUsers.filter((u) => !isMissingEmbedding(u)).length;
    const stillMissing = verifiedUsers.length - withEmbeddings;

    // ── Summary ────────────────────────────────────────────────────────────
    console.log("📊 Embedding Generation Summary:");
    console.log(`   Total eligible users: ${usersWithSignals.length}`);
    console.log(`   Users with embeddings: ${withEmbeddings}`);
    console.log(`   Users still missing: ${stillMissing}`);
    console.log(`   Generation success: ${successCount}`);
    console.log(`   Generation failed: ${failedCount}`);

    if (failedCount > 0) {
      exitCode = 1;
    }

    console.log("\n✅ User embedding generation complete.\n");
  } catch (err) {
    console.error("\n❌ Embedding generation failed:", err);
    exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.\n");
    process.exit(exitCode);
  }
}

// Run
generateUserEmbeddings();
