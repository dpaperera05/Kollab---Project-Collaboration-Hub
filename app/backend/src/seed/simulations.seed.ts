import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { Simulation } from "../models/simulation.model";

// ── Simulation data ───────────────────────────────────────────────────────────

const simulations = [
  {
    title: "API Debugging and Incident Response",
    slug: "software-engineer-api-debugging-incident-response",
    roleCategory: "Software Engineer",
    difficulty: "Intermediate",
    estimatedMinutes: 25,
    xp: 120,
    passMark: 70,
    status: "active",
    isPublished: true,
    overview:
      "Step into the role of a junior software engineer responding to a live production incident. " +
      "A critical checkout failure has been reported after the latest backend deployment. " +
      "You will triage the issue, gather evidence, identify the root cause, plan the fix, and " +
      "communicate your findings to the team — just as you would in a real engineering role.",
    workplaceBrief:
      "You work at Cartly, a fast-growing e-commerce startup. It is a Tuesday morning and " +
      "your Slack lights up with alerts: the mobile checkout endpoint is returning 500 errors " +
      "for a large number of users. The incident was reported 12 minutes ago. Your senior " +
      "engineer is in a client meeting and has asked you to take the lead on initial triage. " +
      "Your task is to investigate, identify the root cause, plan the fix, and keep the team " +
      "informed.",
    skillsAssessed: [
      "API Debugging",
      "Backend Reasoning",
      "Incident Response",
      "Problem Solving",
      "Technical Communication",
    ],
    tags: ["API", "Debugging", "Incident Response", "Backend", "Communication"],
    stages: [
      // ── Stage 1: Incident Briefing ──────────────────────────────────────
      {
        id: "se_api_incident_s1",
        title: "Incident Briefing",
        narrative:
          "The mobile app checkout has been failing for the past 12 minutes. Users are unable " +
          "to complete purchases. Your team's alerting system has flagged a spike in 500 responses " +
          "from POST /api/checkout. The last deployment went out 20 minutes ago. " +
          "Your senior engineer has asked you to take ownership of the initial triage.",
        order: 1,
        tasks: [
          {
            id: "se_api_incident_t1",
            type: "scenario_mcq",
            title: "First Response Decision",
            prompt:
              "A production incident has just been reported: the mobile app checkout is returning " +
              "500 errors. What is the best first action you should take?",
            options: [
              "Immediately rewrite the checkout service from scratch",
              "Reproduce the issue and check recent deployment logs and error output",
              "Ask affected users to reinstall the mobile app",
              "Wait until more users complain before investigating",
            ],
            correctAnswer:
              "Reproduce the issue and check recent deployment logs and error output",
            points: 10,
            skillWeights: {
              "Incident Response": 0.5,
              "Problem Solving": 0.3,
              "Backend Reasoning": 0.2,
            },
            explanation:
              "The first step in any incident is to confirm the problem is real, understand its scope, " +
              "and inspect recent changes and logs before attempting a fix. Rewriting code or asking " +
              "users to take action before understanding the cause will waste time and increase risk.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 2: Evidence Gathering ─────────────────────────────────────
      {
        id: "se_api_incident_s2",
        title: "Evidence Gathering",
        narrative:
          "You have confirmed the issue is real: POST /api/checkout is returning 500 errors. " +
          "Before diving into the code, you need to gather the right evidence. " +
          "Good engineers do not guess — they gather data first.",
        order: 2,
        tasks: [
          {
            id: "se_api_incident_t2",
            type: "multi_select",
            title: "Useful Debugging Evidence",
            prompt:
              "You have 5 minutes to gather initial evidence. " +
              "Which of the following would be most useful for investigating this API incident? " +
              "Select all that apply.",
            options: [
              "Recent deployment logs",
              "API error response body from a failed request",
              "Affected endpoint path and an example failing request payload",
              "Server logs showing errors around the time checkout failures began",
              "Marketing banner image file size",
              "User profile avatar colour configuration",
              "Blog page SEO title metadata",
            ],
            correctAnswers: [
              "Recent deployment logs",
              "API error response body from a failed request",
              "Affected endpoint path and an example failing request payload",
              "Server logs showing errors around the time checkout failures began",
            ],
            points: 15,
            skillWeights: {
              "API Debugging": 0.5,
              "Backend Reasoning": 0.3,
              "Problem Solving": 0.2,
            },
            explanation:
              "Deployment logs tell you what changed; the error response body reveals the failure message; " +
              "the request payload shows what data is being sent; server logs show the exact error context. " +
              "Frontend aesthetics and SEO fields are irrelevant to a backend API failure.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 3: Technical Investigation ───────────────────────────────
      {
        id: "se_api_incident_s3",
        title: "Technical Investigation",
        narrative:
          "You now have the deployment diff and the server logs. A pattern is emerging. " +
          "The backend controller was recently updated. Review the code below and " +
          "identify the root cause of the 500 errors.",
        order: 3,
        tasks: [
          {
            id: "se_api_incident_t3",
            type: "code_review",
            title: "Identify the Backend Issue",
            context:
              "// checkout.controller.ts — updated in the last deployment\n" +
              "export const processCheckout = async (req: Request, res: Response) => {\n" +
              "  // The controller now reads 'cartItems' from the request body\n" +
              "  const { cartItems, userId } = req.body;\n" +
              "\n" +
              "  if (!cartItems || cartItems.length === 0) {\n" +
              "    return res.status(400).json({ error: 'No items in cart' });\n" +
              "  }\n" +
              "  // ... rest of checkout logic\n" +
              "};\n" +
              "\n" +
              "// Mobile client — unchanged since last sprint\n" +
              "// POST /api/checkout\n" +
              "// Body: { items: [...], userId: '...' }   <-- sends 'items', not 'cartItems'\n",
            prompt:
              "Based on the code above, what is the most likely root cause of the checkout failures?",
            options: [
              "The backend now expects a field named 'cartItems' but the mobile client still sends 'items', causing the payload to be treated as empty",
              "The website footer has an incorrect copyright link",
              "The MongoDB database name is too short to store checkout records",
              "The CSS grid layout has too many columns on the checkout page",
            ],
            correctAnswer:
              "The backend now expects a field named 'cartItems' but the mobile client still sends 'items', causing the payload to be treated as empty",
            points: 20,
            skillWeights: {
              "API Debugging": 0.5,
              "Backend Reasoning": 0.4,
              "Problem Solving": 0.1,
            },
            explanation:
              "The deployment introduced a breaking API contract change: the field name was renamed from " +
              "'items' to 'cartItems' in the backend without updating the mobile client. " +
              "When the controller reads req.body.cartItems it gets undefined, so cartItems.length " +
              "throws a runtime error, producing a 500 response.",
            aiGraded: false,
          },
          {
            id: "se_api_incident_t4",
            type: "ordering",
            title: "Incident Resolution Order",
            prompt:
              "You have identified the root cause. Arrange the following resolution steps in the " +
              "correct order from first to last.",
            options: [
              "Reproduce the failing checkout request locally",
              "Inspect logs and confirm the payload field mismatch",
              "Apply a backward-compatible fix so both 'items' and 'cartItems' are accepted",
              "Test checkout with both the old and the new payload formats",
              "Communicate the fix and a monitoring plan to the team",
            ],
            correctOrder: [
              "Reproduce the failing checkout request locally",
              "Inspect logs and confirm the payload field mismatch",
              "Apply a backward-compatible fix so both 'items' and 'cartItems' are accepted",
              "Test checkout with both the old and the new payload formats",
              "Communicate the fix and a monitoring plan to the team",
            ],
            points: 15,
            skillWeights: {
              "Incident Response": 0.4,
              "API Debugging": 0.3,
              "Technical Communication": 0.2,
              "Problem Solving": 0.1,
            },
            explanation:
              "Effective incident resolution follows a structured flow: confirm and reproduce first, " +
              "then diagnose, fix in a backward-compatible way, verify with tests, and finally " +
              "communicate clearly to stakeholders. Skipping reproduction or testing risks a " +
              "repeat incident.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 4: Professional Communication ────────────────────────────
      {
        id: "se_api_incident_s4",
        title: "Professional Communication",
        narrative:
          "The root cause is confirmed and a fix is in progress. " +
          "Your project manager has asked for a short written update. " +
          "Communicate the situation clearly and professionally.",
        order: 4,
        tasks: [
          {
            id: "se_api_incident_t5",
            type: "written_response",
            title: "Team Update",
            prompt:
              "Write a short update (3–5 sentences) to your project manager explaining: " +
              "(1) what caused the checkout failures, " +
              "(2) how you are fixing it, and " +
              "(3) how you will verify the solution before closing the incident.",
            points: 10,
            aiGraded: true,
            modelAnswer:
              "The checkout failures were caused by an API contract mismatch introduced in the last deployment: " +
              "the backend was updated to expect 'cartItems' in the request body, but the mobile client " +
              "still sends 'items'. This caused the cart validation to fail and return a 500 error. " +
              "I am applying a backward-compatible fix that accepts both field names so neither client " +
              "version breaks. Before releasing, I will run integration tests with both payload formats " +
              "and monitor the checkout error rate in the dashboard for 30 minutes post-deployment to " +
              "confirm the fix is effective.",
            skillWeights: {
              "Technical Communication": 0.5,
              "Incident Response": 0.3,
              "Problem Solving": 0.2,
            },
            rubric: [
              {
                criterion: "Problem Explanation",
                maxScore: 2,
                description:
                  "Candidate clearly identifies the root cause: an API contract mismatch between the " +
                  "updated backend field name ('cartItems') and the mobile client field ('items').",
                skillWeights: {
                  "Technical Communication": 0.5,
                  "Backend Reasoning": 0.5,
                },
              },
              {
                criterion: "Fix Approach",
                maxScore: 3,
                description:
                  "Candidate describes a backward-compatible fix (accepting both field names) rather " +
                  "than a breaking change. Demonstrates awareness that a hard rename would affect " +
                  "clients that cannot be updated immediately.",
                skillWeights: {
                  "Incident Response": 0.5,
                  "API Debugging": 0.3,
                  "Problem Solving": 0.2,
                },
              },
              {
                criterion: "Verification and Testing Plan",
                maxScore: 3,
                description:
                  "Candidate explains how they will verify the fix: integration tests with both " +
                  "payload formats, monitoring error rates post-deployment, and/or reviewing logs.",
                skillWeights: {
                  "Incident Response": 0.5,
                  "Problem Solving": 0.5,
                },
              },
              {
                criterion: "Communication Clarity",
                maxScore: 2,
                description:
                  "Update is concise, jargon-free enough for a project manager, structured logically, " +
                  "and free from unnecessary technical detail that would obscure the message.",
                skillWeights: {
                  "Technical Communication": 1.0,
                },
              },
            ],
          },
        ],
      },
    ],
  },
];

// ── Seed runner ───────────────────────────────────────────────────────────────

const seed = async () => {
  await connectDB();
  console.log("Starting simulations seed...\n");

  let upserted = 0;
  let skipped = 0;

  for (const data of simulations) {
    try {
      const result = await Simulation.findOneAndUpdate(
        { slug: data.slug },
        { $set: data },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      const action = result.isNew !== undefined ? "Inserted" : "Updated";
      console.log(`  ✓ ${action}: "${data.title}" (${data.slug})`);
      upserted++;
    } catch (err) {
      console.error(`  ✗ Failed to upsert "${data.title}":`, err);
      skipped++;
    }
  }

  console.log(
    `\nSimulations seed complete. Upserted: ${upserted}, Skipped: ${skipped}`
  );

  await mongoose.disconnect();
  console.log("Database disconnected.");
};

seed().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
