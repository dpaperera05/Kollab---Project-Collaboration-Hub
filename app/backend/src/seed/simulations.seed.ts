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

  // ── UI/UX Designer — Checkout Usability Review ────────────────────────────
  {
    title: "Checkout Usability Review",
    slug: "ui-ux-designer-checkout-usability-review",
    roleCategory: "UI/UX Designer",
    difficulty: "Beginner",
    estimatedMinutes: 20,
    xp: 100,
    passMark: 70,
    status: "active",
    isPublished: true,
    overview:
      "Step into the role of a junior UI/UX designer reviewing a checkout flow with a high abandonment rate. " +
      "Analytics show users are dropping off at the delivery and payment steps. " +
      "You will review the user journey, identify the key usability and accessibility issues, " +
      "prioritise improvements, and communicate your recommendation to the product team.",
    workplaceBrief:
      "You work at Cartly, the same e-commerce startup as your engineering colleagues. " +
      "The product team has flagged that checkout abandonment spiked to 68% last month — " +
      "significantly above the industry average. Data shows most drop-offs happen on the " +
      "delivery and payment steps. Your design lead has asked you to review the checkout flow, " +
      "identify the main usability and accessibility problems, and present a clear recommendation " +
      "before the next sprint planning session.",
    skillsAssessed: [
      "Usability Analysis",
      "Accessibility",
      "User Journey Mapping",
      "Design Reasoning",
      "Communication",
    ],
    tags: ["UX", "Usability", "Accessibility", "Checkout", "Design Review"],
    stages: [
      // ── Stage 1: Usability Brief ───────────────────────────────────────
      {
        id: "ux_checkout_s1",
        title: "Usability Brief",
        narrative:
          "The product team has shared checkout funnel data showing a sharp drop-off at the " +
          "delivery address and payment steps. Before making any design changes, you need to " +
          "establish a clear review approach. Good UX work starts with understanding the problem, " +
          "not with immediately applying solutions.",
        order: 1,
        tasks: [
          {
            id: "ux_checkout_t1",
            type: "scenario_mcq",
            title: "First Review Step",
            prompt:
              "Checkout abandonment has risen sharply. The product manager has asked you to " +
              "review the flow and suggest improvements. What is the best first step?",
            options: [
              "Redesign the entire website immediately",
              "Review the user journey, analytics, and checkout pain points before proposing changes",
              "Change only the button colour",
              "Remove the delivery step entirely",
            ],
            correctAnswer:
              "Review the user journey, analytics, and checkout pain points before proposing changes",
            points: 10,
            skillWeights: {
              "Usability Analysis": 0.5,
              "User Journey Mapping": 0.3,
              "Design Reasoning": 0.2,
            },
            explanation:
              "A designer should always understand where and why users are dropping off before " +
              "proposing changes. Jumping straight to redesigns or cosmetic fixes without evidence " +
              "risks solving the wrong problem and wasting sprint capacity.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 2: Evidence Review ───────────────────────────────────────
      {
        id: "ux_checkout_s2",
        title: "Evidence Review",
        narrative:
          "You have access to several data sources. Choosing the right evidence is critical: " +
          "collecting irrelevant data wastes time, while missing key signals leads to incomplete " +
          "analysis. Select everything that will meaningfully inform your checkout review.",
        order: 2,
        tasks: [
          {
            id: "ux_checkout_t2",
            type: "multi_select",
            title: "Useful UX Evidence",
            prompt:
              "Which of the following would be most useful evidence when reviewing the " +
              "checkout abandonment issue? Select all that apply.",
            options: [
              "Checkout funnel analytics showing where users drop off",
              "User session recordings of checkout attempts",
              "Error messages shown to users during checkout",
              "Mobile checkout screenshots across device sizes",
              "Server CPU temperature logs",
              "Admin panel password policy document",
              "Blog article word-count report",
            ],
            correctAnswers: [
              "Checkout funnel analytics showing where users drop off",
              "User session recordings of checkout attempts",
              "Error messages shown to users during checkout",
              "Mobile checkout screenshots across device sizes",
            ],
            points: 15,
            skillWeights: {
              "Usability Analysis": 0.4,
              "User Journey Mapping": 0.3,
              "Accessibility": 0.2,
              "Design Reasoning": 0.1,
            },
            explanation:
              "Funnel analytics reveal the exact drop-off steps; session recordings show real user " +
              "behaviour; error messages highlight friction points; mobile screenshots expose " +
              "responsive issues. Server metrics and content administration settings are irrelevant " +
              "to a UX review of the checkout flow.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 3: Interface Review ──────────────────────────────────────
      {
        id: "ux_checkout_s3",
        title: "Interface Review",
        narrative:
          "You have reviewed the session recordings and analytics. Now you turn to the interface " +
          "itself. The checkout screen has been flagged in the recordings — users hesitate, scroll " +
          "back, and abandon at the payment step. Review the interface description below and " +
          "identify the core usability issue.",
        order: 3,
        tasks: [
          {
            id: "ux_checkout_t3",
            type: "ui_review",
            title: "Identify the UX Issue",
            context:
              "Current checkout screen observations (from session review and accessibility audit):\n" +
              "- Error messages are small (11px), light grey on white background — contrast ratio ~2.1:1 (WCAG AA requires 4.5:1)\n" +
              "- The delivery cost is not shown until after the user completes the address form\n" +
              "- The 'Continue to Payment' button is visually disabled with no tooltip or explanation\n" +
              "- No inline field validation — users only see errors after attempting to submit\n" +
              "- Mobile viewport: the payment button is partially hidden below the fold on small screens\n",
            prompt:
              "Based on the checkout screen observations above, what is the strongest usability issue " +
              "causing users to abandon at the payment step?",
            options: [
              "The page lacks clear feedback and guidance when users cannot proceed, leaving them confused about why checkout is blocked",
              "The MongoDB collection name used by the checkout API is too long",
              "The API route should use a different port number",
              "The homepage hero image file size is too large",
            ],
            correctAnswer:
              "The page lacks clear feedback and guidance when users cannot proceed, leaving them confused about why checkout is blocked",
            points: 20,
            skillWeights: {
              "Usability Analysis": 0.4,
              "Accessibility": 0.3,
              "Design Reasoning": 0.3,
            },
            explanation:
              "The most impactful issue is the combination of invisible errors, a disabled button with no explanation, " +
              "and no inline validation. Users who cannot see why they are blocked will abandon rather than " +
              "troubleshoot. Fixing feedback clarity directly addresses the observed drop-off pattern.",
            aiGraded: false,
          },
          {
            id: "ux_checkout_t4",
            type: "ordering",
            title: "UX Improvement Order",
            prompt:
              "You are ready to act on your findings. Arrange the following UX review and improvement " +
              "actions in the most effective order from first to last.",
            options: [
              "Review analytics and identify the highest-abandonment step in the checkout funnel",
              "Inspect the checkout screen for usability and accessibility issues",
              "Prioritise issues based on impact on task completion",
              "Propose design improvements with clear rationale for each change",
              "Validate the revised flow with users or usability checks",
            ],
            correctOrder: [
              "Review analytics and identify the highest-abandonment step in the checkout funnel",
              "Inspect the checkout screen for usability and accessibility issues",
              "Prioritise issues based on impact on task completion",
              "Propose design improvements with clear rationale for each change",
              "Validate the revised flow with users or usability checks",
            ],
            points: 15,
            skillWeights: {
              "User Journey Mapping": 0.3,
              "Usability Analysis": 0.3,
              "Design Reasoning": 0.2,
              "Communication": 0.2,
            },
            explanation:
              "Effective UX improvement follows an evidence-first sequence: understand the data, " +
              "audit the interface, prioritise by impact, propose changes with rationale, then " +
              "validate. Skipping evidence gathering or validation risks building the wrong solution " +
              "or missing new issues introduced by the changes.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 4: Design Recommendation ────────────────────────────────
      {
        id: "ux_checkout_s4",
        title: "Design Recommendation",
        narrative:
          "You have reviewed the evidence, identified the core issues, and mapped out an improvement " +
          "plan. The product manager is ready for your recommendation. Write a concise, actionable " +
          "summary that the team can take directly into sprint planning.",
        order: 4,
        tasks: [
          {
            id: "ux_checkout_t5",
            type: "written_response",
            title: "UX Recommendation",
            prompt:
              "Write a short recommendation (3–5 sentences) to the product team explaining: " +
              "(1) the main checkout usability issue you identified, " +
              "(2) your proposed improvement, and " +
              "(3) how you would validate the change before releasing it.",
            points: 10,
            aiGraded: true,
            modelAnswer:
              "The primary usability issue is that users receive no clear guidance when checkout is " +
              "blocked — the Continue button is disabled without explanation, error messages fail " +
              "WCAG contrast requirements, and delivery costs are hidden until the address form is " +
              "completed. I recommend three targeted improvements: replacing the disabled button with " +
              "an enabled button that surfaces inline validation errors on tap; increasing error " +
              "message contrast to meet WCAG AA (minimum 4.5:1); and displaying an estimated " +
              "delivery cost range earlier in the flow so users are not surprised at the payment " +
              "step. To validate the changes, I would run a moderated usability test with 5 " +
              "participants on the revised prototype, then monitor checkout funnel completion rates " +
              "for two weeks after the release.",
            skillWeights: {
              "Communication": 0.4,
              "Usability Analysis": 0.3,
              "Design Reasoning": 0.2,
              "Accessibility": 0.1,
            },
            rubric: [
              {
                criterion: "Problem Understanding",
                maxScore: 2,
                description:
                  "Candidate clearly identifies the core usability issue: lack of clear feedback " +
                  "and guidance during checkout (disabled button without explanation, low-contrast " +
                  "errors, hidden delivery cost). Vague or surface-level descriptions score lower.",
                skillWeights: {
                  "Usability Analysis": 0.6,
                  "Design Reasoning": 0.4,
                },
              },
              {
                criterion: "Recommended UX Improvement",
                maxScore: 3,
                description:
                  "Candidate proposes at least one concrete, actionable improvement that directly " +
                  "addresses the identified issue — such as inline validation, accessible error " +
                  "contrast, button state guidance, or earlier cost disclosure. Higher scores for " +
                  "multiple specific improvements with clear reasoning.",
                skillWeights: {
                  "Design Reasoning": 0.5,
                  "Usability Analysis": 0.3,
                  "Accessibility": 0.2,
                },
              },
              {
                criterion: "Validation Approach",
                maxScore: 3,
                description:
                  "Candidate explains how they would verify the improvement is effective: usability " +
                  "testing, prototype review, A/B testing, funnel metric comparison, or WCAG audit. " +
                  "Higher scores for specific, realistic methods over generic statements.",
                skillWeights: {
                  "Usability Analysis": 0.5,
                  "User Journey Mapping": 0.3,
                  "Design Reasoning": 0.2,
                },
              },
              {
                criterion: "Communication Clarity",
                maxScore: 2,
                description:
                  "Recommendation is concise, non-technical enough for a product manager, " +
                  "structured logically (problem → improvement → validation), and free from " +
                  "jargon that would obscure the message.",
                skillWeights: {
                  "Communication": 1.0,
                },
              },
            ],
          },
        ],
      },
    ],
  },

  // ── Project Manager — Sprint Risk and Stakeholder Response ────────────────
  {
    title: "Sprint Risk and Stakeholder Response",
    slug: "project-manager-sprint-risk-stakeholder-response",
    roleCategory: "Project Manager",
    difficulty: "Intermediate",
    estimatedMinutes: 25,
    xp: 120,
    passMark: 70,
    status: "active",
    isPublished: true,
    overview:
      "Step into the role of a junior project manager supporting a software team mid-sprint. " +
      "Two high-priority tasks are blocked, a developer is unavailable, and the client expects " +
      "a working demo at the end of the week. You must assess the risk, prioritise actions, " +
      "adjust the sprint scope, and communicate clearly with stakeholders — just as you would " +
      "in a real agile delivery role.",
    workplaceBrief:
      "You work as a junior project manager at Launchpad Digital, a mid-size software agency. " +
      "It is Wednesday morning, halfway through a two-week sprint. Your Slack shows two tasks " +
      "flagged as blocked: one because a third-party API has changed its authentication schema, " +
      "and one because the only developer with context on the payments module is on unplanned " +
      "sick leave. The client has a scheduled demo on Friday afternoon and expects to see the " +
      "complete onboarding and payment flows. Your delivery lead has asked you to assess the " +
      "situation and send a stakeholder update by lunchtime.",
    skillsAssessed: [
      "Risk Management",
      "Sprint Planning",
      "Stakeholder Communication",
      "Prioritisation",
      "Decision Making",
    ],
    tags: ["Project Management", "Sprint Planning", "Risk", "Stakeholders", "Agile"],
    stages: [
      // ── Stage 1: Sprint Risk Brief ──────────────────────────────────────
      {
        id: "pm_sprint_risk_s1",
        title: "Sprint Risk Brief",
        narrative:
          "It is Wednesday morning and two tasks in the active sprint are blocked. The client " +
          "demo is on Friday. Before you can take any action, you need to decide on the right " +
          "first step. Reacting without a clear picture risks making the situation worse.",
        order: 1,
        tasks: [
          {
            id: "pm_sprint_risk_t1",
            type: "scenario_mcq",
            title: "First Risk Response",
            prompt:
              "It is midway through the sprint and you have just discovered that two high-priority " +
              "tasks are blocked. The client demo is on Friday. What is the best first action?",
            options: [
              "Hide the issue from the client until demo day and hope it resolves itself",
              "Review blockers, impact, and remaining sprint capacity before deciding next steps",
              "Cancel the whole project immediately and notify the client",
              "Ask the entire team to work through the night without any discussion",
            ],
            correctAnswer:
              "Review blockers, impact, and remaining sprint capacity before deciding next steps",
            points: 10,
            skillWeights: {
              "Risk Management": 0.5,
              "Sprint Planning": 0.3,
              "Decision Making": 0.2,
            },
            explanation:
              "A project manager should always understand the blockers, their impact, and the team's " +
              "remaining capacity before making or communicating any decision. Acting without this " +
              "picture risks misallocating resources, breaking trust with the client, or burning out " +
              "the team on the wrong work.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 2: Situation Assessment ──────────────────────────────────
      {
        id: "pm_sprint_risk_s2",
        title: "Situation Assessment",
        narrative:
          "You know two tasks are blocked, but before escalating to the client or your delivery " +
          "lead you need a full picture of the situation. Stakeholder updates built on incomplete " +
          "information damage credibility. Gather the right data first.",
        order: 2,
        tasks: [
          {
            id: "pm_sprint_risk_t2",
            type: "multi_select",
            title: "Useful Risk Information",
            prompt:
              "Before updating stakeholders about the sprint risk, which information should you " +
              "gather? Select all that apply.",
            options: [
              "Current sprint progress and completed tasks",
              "Blocked tasks and the specific reasons they are blocked",
              "Remaining team capacity for the rest of the sprint",
              "Impact of the blocked work on the client demo scope",
              "The developer's favourite colour",
              "This week's office lunch menu",
              "An old marketing slogan from three years ago",
            ],
            correctAnswers: [
              "Current sprint progress and completed tasks",
              "Blocked tasks and the specific reasons they are blocked",
              "Remaining team capacity for the rest of the sprint",
              "Impact of the blocked work on the client demo scope",
            ],
            points: 15,
            skillWeights: {
              "Risk Management": 0.4,
              "Sprint Planning": 0.3,
              "Prioritisation": 0.2,
              "Stakeholder Communication": 0.1,
            },
            explanation:
              "Understanding sprint progress, the root cause of each blocker, available capacity, and " +
              "the demo impact gives you everything you need for a credible stakeholder update and a " +
              "realistic adjusted plan. Personal preferences and irrelevant operational details add " +
              "noise without informing any decision.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 3: Prioritisation Decision ───────────────────────────────
      {
        id: "pm_sprint_risk_s3",
        title: "Prioritisation Decision",
        narrative:
          "You have assessed the situation. The team cannot complete every planned task before " +
          "Friday's demo. You need to make a clear prioritisation call and then communicate it. " +
          "This is a defining moment: the decision you make here will shape the demo outcome " +
          "and the client relationship.",
        order: 3,
        tasks: [
          {
            id: "pm_sprint_risk_t3",
            type: "scenario_mcq",
            title: "Scope Decision",
            context:
              "Current sprint situation:\n" +
              "- Task A: New user onboarding flow — in progress, 80% complete, critical for demo\n" +
              "- Task B: Payment confirmation screen polish — not started, nice-to-have UI enhancement\n" +
              "- Task C: API authentication update — blocked, depends on the unavailable developer\n" +
              "The team has enough capacity to complete Task A and one small additional item, " +
              "but not all three tasks before Friday.",
            prompt:
              "Given the sprint situation above, what is the best project management decision?",
            options: [
              "Prioritise Task A (critical demo flow), move Task B to the next sprint, and communicate the risk and adjusted scope to the client early",
              "Keep all three tasks in scope and hope the team can find a way to finish everything",
              "Remove the Friday demo entirely without informing the client",
              "Assign Task C to a developer with no context on the payments module and no support",
            ],
            correctAnswer:
              "Prioritise Task A (critical demo flow), move Task B to the next sprint, and communicate the risk and adjusted scope to the client early",
            points: 20,
            skillWeights: {
              "Prioritisation": 0.4,
              "Decision Making": 0.3,
              "Risk Management": 0.2,
              "Stakeholder Communication": 0.1,
            },
            explanation:
              "Protecting the demo's core goal (Task A), deferring a non-critical enhancement (Task B), " +
              "and communicating early maintains trust and keeps the delivery realistic. Hoping everything " +
              "finishes ignores the blockers; cancelling the demo destroys client trust; assigning a " +
              "blocked task without support creates new risks without resolving the original one.",
            aiGraded: false,
          },
          {
            id: "pm_sprint_risk_t4",
            type: "ordering",
            title: "Stakeholder Response Order",
            prompt:
              "You have made the prioritisation call. Arrange the following project manager actions " +
              "in the most effective order from first to last.",
            options: [
              "Identify blockers and confirm their exact impact on the sprint",
              "Review remaining sprint capacity and demo priorities with the team",
              "Agree on a realistic adjusted scope with the team",
              "Communicate the risk and revised plan to stakeholders",
              "Track the mitigation plan and monitor progress until the demo",
            ],
            correctOrder: [
              "Identify blockers and confirm their exact impact on the sprint",
              "Review remaining sprint capacity and demo priorities with the team",
              "Agree on a realistic adjusted scope with the team",
              "Communicate the risk and revised plan to stakeholders",
              "Track the mitigation plan and monitor progress until the demo",
            ],
            points: 15,
            skillWeights: {
              "Sprint Planning": 0.3,
              "Risk Management": 0.3,
              "Stakeholder Communication": 0.3,
              "Decision Making": 0.1,
            },
            explanation:
              "Effective risk response in agile follows a structured sequence: understand the blocker " +
              "first, assess capacity, align the team on a revised scope, communicate to stakeholders, " +
              "then track. Communicating before you have a plan damages credibility; tracking without " +
              "first aligning the team leads to inconsistent messaging.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 4: Stakeholder Communication ─────────────────────────────
      {
        id: "pm_sprint_risk_s4",
        title: "Stakeholder Communication",
        narrative:
          "The team is aligned on the revised plan. Now you need to communicate clearly and " +
          "confidently to the client. A good stakeholder update explains what happened, what " +
          "the team is doing about it, and what the client can expect — without hiding problems " +
          "or overcomplicating the message.",
        order: 4,
        tasks: [
          {
            id: "pm_sprint_risk_t5",
            type: "written_response",
            title: "Stakeholder Update",
            prompt:
              "Write a short update (3–5 sentences) to the client or your delivery supervisor explaining: " +
              "(1) the sprint risk you have identified, " +
              "(2) the adjusted plan to protect the demo outcome, and " +
              "(3) how the team will follow up to keep the delivery on track.",
            points: 10,
            aiGraded: true,
            modelAnswer:
              "We have identified a sprint risk that may affect the scope of Friday's demo: two tasks " +
              "are currently blocked — one due to a third-party API authentication change, and one due " +
              "to an unexpected team member absence. To protect the demo, we have prioritised the " +
              "complete onboarding flow (Task A), which is 80% done and will be finished before Friday, " +
              "and have moved the payment screen polish to the next sprint as a non-critical enhancement. " +
              "The blocked API task is being reviewed for a workaround; if a fix is not feasible this " +
              "sprint, we will present a clear plan for it at the demo. We will provide a progress " +
              "update tomorrow morning and are confident the demo can showcase the core flow as agreed.",
            skillWeights: {
              "Stakeholder Communication": 0.5,
              "Risk Management": 0.2,
              "Prioritisation": 0.2,
              "Decision Making": 0.1,
            },
            rubric: [
              {
                criterion: "Risk Explanation",
                maxScore: 2,
                description:
                  "Candidate clearly identifies the sprint risk and its cause — blocked tasks, " +
                  "unavailable resource, or both. Vague statements like 'we have a problem' without " +
                  "specifics score lower. The explanation should be accurate and non-alarmist.",
                skillWeights: {
                  "Risk Management": 0.6,
                  "Stakeholder Communication": 0.4,
                },
              },
              {
                criterion: "Adjusted Plan",
                maxScore: 3,
                description:
                  "Candidate proposes a concrete, realistic adjusted scope that protects the demo's " +
                  "core goal. Higher scores for explicitly naming what is prioritised, what is deferred, " +
                  "and why. The plan should be actionable rather than vague reassurance.",
                skillWeights: {
                  "Prioritisation": 0.5,
                  "Decision Making": 0.3,
                  "Sprint Planning": 0.2,
                },
              },
              {
                criterion: "Mitigation and Follow-up",
                maxScore: 3,
                description:
                  "Candidate explains how the team will monitor and follow up: a progress update, " +
                  "a workaround investigation, a fallback for the blocked task, or a monitoring " +
                  "commitment before the demo. Higher scores for specific, credible actions over " +
                  "generic promises to 'keep working on it'.",
                skillWeights: {
                  "Risk Management": 0.5,
                  "Stakeholder Communication": 0.3,
                  "Decision Making": 0.2,
                },
              },
              {
                criterion: "Communication Clarity",
                maxScore: 2,
                description:
                  "Update is concise, professional, and accessible to a non-technical client. " +
                  "It is structured logically (risk → plan → follow-up), avoids jargon that " +
                  "obscures the message, and maintains a confident, solution-focused tone.",
                skillWeights: {
                  "Stakeholder Communication": 1.0,
                },
              },
            ],
          },
        ],
      },
    ],
  },

  // ── DevOps Engineer — Deployment Failure and Rollback Decision ────────────
  {
    title: "Deployment Failure and Rollback Decision",
    slug: "devops-engineer-deployment-failure-rollback-decision",
    roleCategory: "DevOps Engineer",
    difficulty: "Intermediate",
    estimatedMinutes: 25,
    xp: 120,
    passMark: 70,
    status: "active",
    isPublished: true,
    overview:
      "Step into the role of a junior DevOps engineer monitoring a production deployment. " +
      "Shortly after the release, error rates spike and users report failed checkout requests. " +
      "You must investigate deployment signals, decide whether to roll back, execute the safest " +
      "mitigation, verify recovery, and communicate the incident status to the engineering team " +
      "— exactly as you would in a real DevOps on-call role.",
    workplaceBrief:
      "You are on deployment watch at Cartly, the same e-commerce platform. The team has just " +
      "pushed a new release at 14:00. By 14:08 your monitoring dashboard shows a sharp increase " +
      "in 5xx error rates on the checkout service. Slack notifications are arriving from customer " +
      "support reporting failed payment attempts. The previous release ran without incident for " +
      "three weeks. The only significant change in this deployment is a new set of checkout " +
      "environment variables. Your engineering lead is on a call and has asked you to own the " +
      "initial assessment and mitigation decision.",
    skillsAssessed: [
      "Deployment Monitoring",
      "Incident Response",
      "CI/CD Reasoning",
      "Rollback Planning",
      "Technical Communication",
    ],
    tags: ["DevOps", "CI/CD", "Deployment", "Rollback", "Monitoring"],
    stages: [
      // ── Stage 1: Deployment Alert ───────────────────────────────────────
      {
        id: "devops_deploy_s1",
        title: "Deployment Alert",
        narrative:
          "Your monitoring dashboard has fired a P1 alert: error rates on the checkout service " +
          "spiked eight minutes after the latest deployment. Before taking any action you must " +
          "decide what to do first. Reacting too fast without confirming impact wastes time; " +
          "reacting too slowly lets the outage deepen.",
        order: 1,
        tasks: [
          {
            id: "devops_deploy_t1",
            type: "scenario_mcq",
            title: "First Incident Action",
            prompt:
              "Your monitoring shows a spike in production errors immediately after a deployment. " +
              "What is the best first action?",
            options: [
              "Ignore the alert because some errors always appear after a deployment",
              "Check deployment logs, monitoring dashboards, and affected services to confirm the impact",
              "Delete the production database to start fresh",
              "Disable all monitoring alerts to stop the noise",
            ],
            correctAnswer:
              "Check deployment logs, monitoring dashboards, and affected services to confirm the impact",
            points: 10,
            skillWeights: {
              "Deployment Monitoring": 0.5,
              "Incident Response": 0.3,
              "CI/CD Reasoning": 0.2,
            },
            explanation:
              "The first step in any production incident is to confirm that the alert is real, understand " +
              "the scope of impact, and correlate it with the deployment. Acting without this data risks " +
              "rolling back a perfectly good release or missing a separate underlying issue.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 2: Signal Analysis ────────────────────────────────────────
      {
        id: "devops_deploy_s2",
        title: "Signal Analysis",
        narrative:
          "The alert is real. You now have access to several data sources. Choosing the right " +
          "signals is critical: too narrow a view and you miss the root cause; irrelevant data " +
          "wastes the time you need to act. Select the signals that will actually tell you " +
          "whether the deployment is responsible.",
        order: 2,
        tasks: [
          {
            id: "devops_deploy_t2",
            type: "multi_select",
            title: "Useful Deployment Signals",
            prompt:
              "Which of the following signals are most useful when deciding whether the deployment " +
              "is causing the production error spike? Select all that apply.",
            options: [
              "Error rate trend before and after the deployment",
              "Recent CI/CD pipeline logs for the release",
              "Service health checks for the affected checkout endpoint",
              "Application logs showing errors for failed requests",
              "Website logo colour in the brand guidelines",
              "Team birthday calendar for this month",
              "Blog page font-size CSS variable",
            ],
            correctAnswers: [
              "Error rate trend before and after the deployment",
              "Recent CI/CD pipeline logs for the release",
              "Service health checks for the affected checkout endpoint",
              "Application logs showing errors for failed requests",
            ],
            points: 15,
            skillWeights: {
              "Deployment Monitoring": 0.4,
              "CI/CD Reasoning": 0.3,
              "Incident Response": 0.2,
              "Rollback Planning": 0.1,
            },
            explanation:
              "Error rate trends confirm the timing correlation; CI/CD logs reveal what changed in the " +
              "release; health checks show which services are degraded; application logs expose the " +
              "exact error messages. Brand assets, HR calendars, and CSS variables are irrelevant to " +
              "a production deployment investigation.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 3: Rollback Decision ──────────────────────────────────────
      {
        id: "devops_deploy_s3",
        title: "Rollback Decision",
        narrative:
          "You now have the evidence. The error rate map, CI/CD logs, and application output all " +
          "point to the same deployment. You need to make a decision and act. The right call here " +
          "protects users and gives the team time to investigate safely.",
        order: 3,
        tasks: [
          {
            id: "devops_deploy_t3",
            type: "scenario_mcq",
            title: "Rollback Decision",
            context:
              "Incident signals (gathered from logs and monitoring):\n" +
              "- Error rate increased from <0.5% to 14% within 5 minutes of deployment\n" +
              "- CI/CD diff shows only one change: checkout environment variables updated\n" +
              "- Service health check: checkout endpoint returning 500 for all payment attempts\n" +
              "- Previous release (v2.3.1) was stable for 3 weeks with no checkout errors\n" +
              "- Root cause of the environment variable change not yet confirmed\n",
            prompt:
              "Based on the signals above, what is the best decision?",
            options: [
              "Roll back to the last stable release (v2.3.1) while investigating the faulty deployment separately",
              "Keep the broken release live and wait until the next sprint to fix it",
              "Turn off the checkout service permanently until the root cause is found",
              "Clear the browser cache on the DevOps laptop and refresh the dashboard",
            ],
            correctAnswer:
              "Roll back to the last stable release (v2.3.1) while investigating the faulty deployment separately",
            points: 20,
            skillWeights: {
              "Rollback Planning": 0.4,
              "Incident Response": 0.3,
              "Deployment Monitoring": 0.2,
              "CI/CD Reasoning": 0.1,
            },
            explanation:
              "When a deployment clearly causes production impact and a stable previous release exists, " +
              "rolling back restores service immediately while the root cause is investigated safely " +
              "in a non-production environment. Keeping a broken release live prolongs user impact; " +
              "turning off the service entirely is a more disruptive action than a rollback.",
            aiGraded: false,
          },
          {
            id: "devops_deploy_t4",
            type: "ordering",
            title: "Incident Response Order",
            prompt:
              "You have decided to roll back. Arrange the following DevOps incident response steps " +
              "in the most effective order from first to last.",
            options: [
              "Confirm the issue through monitoring dashboards and application logs",
              "Identify the deployment or configuration change linked to the failure",
              "Roll back or mitigate using the safest approved process",
              "Verify service health after the rollback through logs and health checks",
              "Communicate incident status and next steps to the engineering team",
            ],
            correctOrder: [
              "Confirm the issue through monitoring dashboards and application logs",
              "Identify the deployment or configuration change linked to the failure",
              "Roll back or mitigate using the safest approved process",
              "Verify service health after the rollback through logs and health checks",
              "Communicate incident status and next steps to the engineering team",
            ],
            points: 15,
            skillWeights: {
              "Incident Response": 0.35,
              "Rollback Planning": 0.3,
              "Deployment Monitoring": 0.2,
              "Technical Communication": 0.15,
            },
            explanation:
              "A structured incident response prevents mistakes under pressure: confirm before acting, " +
              "identify the change causing the failure, roll back safely, verify that health is restored, " +
              "then communicate. Communicating before verifying recovery can create conflicting status " +
              "updates; rolling back before identifying the change risks missing a second hidden issue.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 4: Incident Communication ────────────────────────────────
      {
        id: "devops_deploy_s4",
        title: "Incident Communication",
        narrative:
          "The rollback is complete and monitoring shows the error rate returning to normal. " +
          "Your engineering lead and the wider team need a clear status update. A good incident " +
          "communication is factual, concise, and tells people what happened, what was done, " +
          "and what comes next — without speculation or blame.",
        order: 4,
        tasks: [
          {
            id: "devops_deploy_t5",
            type: "written_response",
            title: "Incident Status Update",
            prompt:
              "Write a short update (3–5 sentences) to the engineering team explaining: " +
              "(1) the deployment issue you identified, " +
              "(2) the rollback or mitigation action you took, and " +
              "(3) how you are verifying that the service has recovered.",
            points: 10,
            aiGraded: true,
            modelAnswer:
              "At 14:08 we identified a sharp increase in checkout 5xx error rates following the " +
              "14:00 deployment. CI/CD logs and application error output confirmed the issue was " +
              "linked to updated checkout environment variables introduced in the release. We have " +
              "rolled back to v2.3.1, which restored checkout error rates to below 0.5% within " +
              "two minutes. We are monitoring the service health dashboard and application logs " +
              "for a 30-minute stability window before confirming full recovery. The faulty " +
              "environment variable change is being investigated in a staging environment and " +
              "we will share a root cause analysis and a fix plan before the next release.",
            skillWeights: {
              "Technical Communication": 0.4,
              "Incident Response": 0.3,
              "Rollback Planning": 0.2,
              "Deployment Monitoring": 0.1,
            },
            rubric: [
              {
                criterion: "Incident Explanation",
                maxScore: 2,
                description:
                  "Candidate clearly identifies what went wrong: a production error spike following " +
                  "the deployment, correlated with a specific change (environment variables). " +
                  "Vague descriptions like 'something went wrong' without linking to the deployment " +
                  "or the error evidence score lower.",
                skillWeights: {
                  "Deployment Monitoring": 0.5,
                  "Incident Response": 0.5,
                },
              },
              {
                criterion: "Rollback or Mitigation Plan",
                maxScore: 3,
                description:
                  "Candidate describes a concrete rollback or mitigation action: rolling back to " +
                  "the last stable release, reverting the environment variable change, or equivalent. " +
                  "Higher scores for naming the specific action taken, confirming it was safe and " +
                  "approved, and noting the immediate impact on error rates.",
                skillWeights: {
                  "Rollback Planning": 0.5,
                  "CI/CD Reasoning": 0.3,
                  "Incident Response": 0.2,
                },
              },
              {
                criterion: "Verification Approach",
                maxScore: 3,
                description:
                  "Candidate explains how they are confirming recovery: monitoring error rate trends, " +
                  "reviewing health checks, watching application logs, or observing a stability window. " +
                  "Higher scores for specific, observable verification steps over general reassurances " +
                  "such as 'everything looks fine'.",
                skillWeights: {
                  "Deployment Monitoring": 0.5,
                  "Incident Response": 0.3,
                  "Rollback Planning": 0.2,
                },
              },
              {
                criterion: "Communication Clarity",
                maxScore: 2,
                description:
                  "Update is concise, factual, and accessible to the full engineering team. " +
                  "It is structured logically (incident → action → verification), avoids speculation " +
                  "or blame, and gives the team a clear picture of current service status and next steps.",
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

  // ── AI/ML Engineer — Model Performance Investigation ─────────────────────
  {
    title: "Model Performance Investigation",
    slug: "ai-ml-engineer-model-performance-investigation",
    roleCategory: "AI/ML Engineer",
    difficulty: "Intermediate",
    estimatedMinutes: 30,
    xp: 140,
    passMark: 70,
    status: "active",
    isPublished: true,
    overview:
      "Step into the role of a junior AI/ML engineer working on a recommendation model. " +
      "After a recent update, the model's accuracy has dropped and users are receiving less " +
      "relevant project suggestions. You must investigate model metrics, review data quality, " +
      "analyse error examples, and recommend a concrete next step — exactly as you would in a " +
      "real ML engineering role.",
    workplaceBrief:
      "You are a junior AI/ML engineer at Kollab, working on the project recommendation model " +
      "that helps users discover relevant collaborations. Following last week's platform update, " +
      "which added new project categories, the recommendation quality score dropped from 0.82 to " +
      "0.64. Product support has received multiple user complaints that recommended projects do " +
      "not match their skills, particularly for users interested in AI and DevOps projects. " +
      "Your ML lead has asked you to investigate before deciding whether to retrain or roll back " +
      "the model.",
    skillsAssessed: [
      "Model Evaluation",
      "Data Quality Analysis",
      "ML Reasoning",
      "Error Analysis",
      "Communication",
    ],
    tags: ["AI", "Machine Learning", "Model Evaluation", "Data Quality", "Error Analysis"],
    stages: [
      // ── Stage 1: Model Issue Brief ──────────────────────────────────────
      {
        id: "aiml_model_s1",
        title: "Model Issue Brief",
        narrative:
          "The recommendation model quality has dropped following a platform update. Before " +
          "making any model or data changes you need to decide on the right first step. Jumping " +
          "to a solution without evidence risks making things worse or wasting retraining compute.",
        order: 1,
        tasks: [
          {
            id: "aiml_model_t1",
            type: "scenario_mcq",
            title: "First Investigation Step",
            prompt:
              "Your deployed ML model has started producing worse project recommendations after " +
              "a platform update. What is the best first step?",
            options: [
              "Delete the model and stop all recommendations immediately",
              "Compare current performance metrics with the previous baseline metrics and review recent data changes",
              "Change the website colour scheme to improve user perception",
              "Add more random features to the model without checking the data",
            ],
            correctAnswer:
              "Compare current performance metrics with the previous baseline metrics and review recent data changes",
            points: 10,
            skillWeights: {
              "Model Evaluation": 0.5,
              "ML Reasoning": 0.3,
              "Data Quality Analysis": 0.2,
            },
            explanation:
              "A model performance drop should always be investigated by comparing current metrics " +
              "against the pre-update baseline and checking whether data, feature, or model changes " +
              "correlate with the timing of the drop. Acting without this evidence risks misdiagnosing " +
              "the cause or introducing unnecessary changes.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 2: Evidence Review ────────────────────────────────────────
      {
        id: "aiml_model_s2",
        title: "Evidence Review",
        narrative:
          "You have confirmed that the quality drop is real and correlates with the update. " +
          "Before drawing any conclusions you need to gather the right evidence. Choosing " +
          "irrelevant data sources wastes time; missing key signals means you may misdiagnose " +
          "the root cause.",
        order: 2,
        tasks: [
          {
            id: "aiml_model_t2",
            type: "multi_select",
            title: "Useful ML Investigation Evidence",
            prompt:
              "Which of the following would be most useful when investigating the model " +
              "performance drop? Select all that apply.",
            options: [
              "Previous and current evaluation metrics (accuracy, precision, recall)",
              "Recent training data changes introduced by the platform update",
              "Confusion matrix or concrete examples of incorrect recommendations",
              "Feature distribution changes before and after the update",
              "Navbar link spacing in the frontend design file",
              "User profile avatar border-radius CSS value",
              "Blog page title character length guideline",
            ],
            correctAnswers: [
              "Previous and current evaluation metrics (accuracy, precision, recall)",
              "Recent training data changes introduced by the platform update",
              "Confusion matrix or concrete examples of incorrect recommendations",
              "Feature distribution changes before and after the update",
            ],
            points: 15,
            skillWeights: {
              "Model Evaluation": 0.35,
              "Data Quality Analysis": 0.35,
              "Error Analysis": 0.2,
              "ML Reasoning": 0.1,
            },
            explanation:
              "Metric comparisons confirm the magnitude of the drop; training data changes reveal " +
              "whether new inputs corrupted the model's input distribution; error examples expose " +
              "specific failure patterns; feature distribution shifts show whether the model is " +
              "receiving meaningfully different data. UI styling and content guidelines have no " +
              "bearing on model behaviour.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 3: Error Analysis ─────────────────────────────────────────
      {
        id: "aiml_model_s3",
        title: "Error Analysis",
        narrative:
          "You have gathered the evidence. The pattern is clear: the performance drop is " +
          "concentrated around the newly added project categories. You now need to identify " +
          "the most likely root cause and then decide the best investigation sequence to " +
          "confirm it and plan a fix.",
        order: 3,
        tasks: [
          {
            id: "aiml_model_t3",
            type: "scenario_mcq",
            title: "Likely Root Cause",
            context:
              "Investigation findings so far:\n" +
              "- Model quality score dropped from 0.82 to 0.64 after the platform update\n" +
              "- Platform update added 120 new project categories (AI, DevOps, Data Engineering)\n" +
              "- 64% of newly added projects have missing or empty skill_tags fields\n" +
              "- Recommendation errors are concentrated on AI and DevOps projects\n" +
              "- No changes were made to model architecture or hyperparameters during the update\n",
            prompt:
              "Based on the investigation findings above, what is the most likely root cause?",
            options: [
              "The new project data has missing or inconsistent skill tags, degrading the model's input quality and recommendation signals",
              "The footer copyright text on the website is too short to influence search ranking",
              "The login page has too many buttons, confusing users into clicking wrong recommendations",
              "The database password rotation policy is too strict, blocking model inference calls",
            ],
            correctAnswer:
              "The new project data has missing or inconsistent skill tags, degrading the model's input quality and recommendation signals",
            points: 20,
            skillWeights: {
              "Data Quality Analysis": 0.4,
              "Error Analysis": 0.3,
              "ML Reasoning": 0.2,
              "Model Evaluation": 0.1,
            },
            explanation:
              "When 64% of new records are missing a key feature field (skill_tags) and errors are " +
              "concentrated on those exact new categories, data quality is the most evidence-supported " +
              "root cause. Missing feature signals cause the model to produce weak embeddings or " +
              "similarity scores, leading to poor recommendations for those categories.",
            aiGraded: false,
          },
          {
            id: "aiml_model_t4",
            type: "ordering",
            title: "ML Investigation Order",
            prompt:
              "You have identified the likely root cause. Arrange the following ML investigation " +
              "steps in the most effective order from first to last.",
            options: [
              "Confirm the performance drop using evaluation metrics against the pre-update baseline",
              "Compare recent data and feature distributions with the previous training baseline",
              "Analyse incorrect or low-quality recommendation examples to identify patterns",
              "Identify whether the issue is data quality, model logic, or deployment-related",
              "Recommend retraining, data cleaning, or rollback based on the evidence gathered",
            ],
            correctOrder: [
              "Confirm the performance drop using evaluation metrics against the pre-update baseline",
              "Compare recent data and feature distributions with the previous training baseline",
              "Analyse incorrect or low-quality recommendation examples to identify patterns",
              "Identify whether the issue is data quality, model logic, or deployment-related",
              "Recommend retraining, data cleaning, or rollback based on the evidence gathered",
            ],
            points: 15,
            skillWeights: {
              "Model Evaluation": 0.3,
              "Data Quality Analysis": 0.25,
              "Error Analysis": 0.25,
              "ML Reasoning": 0.2,
            },
            explanation:
              "A rigorous ML investigation follows an evidence-first sequence: confirm the metric " +
              "drop, check data distribution shifts, analyse concrete error examples, classify the " +
              "root cause, then recommend an action. Recommending a fix before identifying the root " +
              "cause is a common ML anti-pattern that leads to wasted retraining compute or masking " +
              "of underlying data quality problems.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 4: Technical Recommendation ──────────────────────────────
      {
        id: "aiml_model_s4",
        title: "Technical Recommendation",
        narrative:
          "The investigation is complete. You have strong evidence pointing to a data quality " +
          "issue. The product team now needs a clear, non-technical summary of what you found, " +
          "why you believe it, and what you recommend. A good ML engineer communicates findings " +
          "in a way that supports a concrete decision — not just 'the model is broken'.",
        order: 4,
        tasks: [
          {
            id: "aiml_model_t5",
            type: "written_response",
            title: "Model Investigation Summary",
            prompt:
              "Write a short update (3–5 sentences) to the product team explaining: " +
              "(1) the likely cause of the model performance drop, " +
              "(2) the evidence that supports your diagnosis, and " +
              "(3) the next step you recommend.",
            points: 10,
            aiGraded: true,
            modelAnswer:
              "Following the platform update that introduced 120 new project categories, the " +
              "recommendation quality score dropped from 0.82 to 0.64. Our investigation found " +
              "that 64% of the newly added projects have missing skill_tags fields, which is the " +
              "primary feature the model uses to match users to relevant projects. Recommendation " +
              "errors are concentrated on the AI and DevOps categories, consistent with these being " +
              "the categories most affected by missing tags. We recommend cleaning and validating " +
              "the skill_tags data for all new projects, adding a validation step to the data " +
              "ingestion pipeline to prevent this in future, and then retraining the model on the " +
              "cleaned dataset. If user impact is severe, a short-term rollback to the previous " +
              "model version should be considered while the data fix is in progress.",
            skillWeights: {
              "Communication": 0.4,
              "ML Reasoning": 0.25,
              "Data Quality Analysis": 0.2,
              "Model Evaluation": 0.15,
            },
            rubric: [
              {
                criterion: "Problem Explanation",
                maxScore: 2,
                description:
                  "Candidate clearly identifies the performance drop and its likely origin — the " +
                  "platform update, the new project categories, or the missing skill_tags data. " +
                  "Vague statements like 'the model is not working' without referencing the update " +
                  "or the data quality issue score lower. The explanation should be specific and " +
                  "accessible to a non-technical product audience.",
                skillWeights: {
                  "Communication": 0.5,
                  "ML Reasoning": 0.5,
                },
              },
              {
                criterion: "Evidence-Based Reasoning",
                maxScore: 3,
                description:
                  "Candidate supports their diagnosis with concrete evidence: the metric drop " +
                  "(0.82 → 0.64), the proportion of missing tags (64%), the concentration of " +
                  "errors on new categories, or a combination. Higher scores for citing specific " +
                  "numbers or observations over generic statements like 'the data quality is poor'. " +
                  "Reasoning should connect the evidence to the recommended cause.",
                skillWeights: {
                  "Data Quality Analysis": 0.4,
                  "Error Analysis": 0.35,
                  "Model Evaluation": 0.25,
                },
              },
              {
                criterion: "Recommended Next Step",
                maxScore: 3,
                description:
                  "Candidate proposes a concrete, actionable next step: data cleaning, skill_tags " +
                  "validation, pipeline checks, model retraining, or a short-term rollback. Higher " +
                  "scores for recommendations that are proportionate to the severity, logically " +
                  "sequenced (fix data before retraining), and include a contingency if the fix " +
                  "takes time (e.g., rollback while cleaning proceeds).",
                skillWeights: {
                  "ML Reasoning": 0.4,
                  "Data Quality Analysis": 0.35,
                  "Model Evaluation": 0.25,
                },
              },
              {
                criterion: "Communication Clarity",
                maxScore: 2,
                description:
                  "Update is concise, structured, and accessible to a product team without deep ML " +
                  "expertise. It flows logically (problem → evidence → recommendation), avoids " +
                  "unexplained ML jargon, and gives the reader a clear basis for a next decision " +
                  "rather than leaving them uncertain about what to do.",
                skillWeights: {
                  "Communication": 1.0,
                },
              },
            ],
          },
        ],
      },
    ],
  },

  // ── Data Analyst — Sales Dashboard Insight Review ────────────────────────
  {
    title: "Sales Dashboard Insight Review",
    slug: "data-analyst-sales-dashboard-insight-review",
    roleCategory: "Data Analyst",
    difficulty: "Beginner",
    estimatedMinutes: 20,
    xp: 100,
    passMark: 70,
    status: "active",
    isPublished: true,
    overview:
      "Step into the role of a junior data analyst reviewing a monthly sales dashboard for an " +
      "e-commerce team. The numbers tell a mixed story: total revenue is up, but conversion " +
      "rate is down and cart abandonment has increased. You must interpret the metrics together, " +
      "identify the real business insight, and communicate a clear, evidence-backed finding to " +
      "the team — exactly as you would in a real analyst role.",
    workplaceBrief:
      "You are a junior data analyst at Cartly, an e-commerce platform. The head of growth has " +
      "shared this month's sales dashboard and asked you to prepare a short insight summary before " +
      "the weekly review meeting. At first glance the headline looks positive: total revenue is up " +
      "12%. But as you scroll further you see that the conversion rate dropped 7% and cart " +
      "abandonment increased 10%. Average order value is up 18%. The growth lead wants to know " +
      "what is really happening and what the team should investigate next.",
    skillsAssessed: [
      "Data Interpretation",
      "Business Insight",
      "Metric Analysis",
      "Data Communication",
      "Critical Thinking",
    ],
    tags: ["Data Analysis", "Dashboard", "Sales Metrics", "Business Insight", "Reporting"],
    stages: [
      // ── Stage 1: Dashboard Brief ────────────────────────────────────────
      {
        id: "da_sales_s1",
        title: "Dashboard Brief",
        narrative:
          "The dashboard is open in front of you. Revenue is up but two other metrics are moving " +
          "in the wrong direction. Before drawing any conclusions or writing your summary, you " +
          "need to decide how to approach a set of metrics that are sending mixed signals.",
        order: 1,
        tasks: [
          {
            id: "da_sales_t1",
            type: "scenario_mcq",
            title: "First Analysis Step",
            prompt:
              "Your dashboard shows that revenue increased but conversion rate and cart abandonment " +
              "moved in the opposite direction. What is the best first step?",
            options: [
              "Report only the revenue increase and ignore the other metrics in your summary",
              "Compare related metrics together and identify what changed across the customer journey",
              "Delete the dashboard because the numbers are contradictory",
              "Change the chart colours before analysing the data to make it look more professional",
            ],
            correctAnswer:
              "Compare related metrics together and identify what changed across the customer journey",
            points: 10,
            skillWeights: {
              "Data Interpretation": 0.5,
              "Critical Thinking": 0.3,
              "Metric Analysis": 0.2,
            },
            explanation:
              "Mixed signals on a dashboard are common. A data analyst should resist focusing on a " +
              "single positive number in isolation. Comparing related metrics across the customer " +
              "journey — traffic, conversion, order value, abandonment — reveals the full picture " +
              "and prevents misleading conclusions.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 2: Metric Review ──────────────────────────────────────────
      {
        id: "da_sales_s2",
        title: "Metric Review",
        narrative:
          "You have decided to look at the metrics together. Not all the numbers on the dashboard " +
          "are equally useful for this question. Choosing the right metrics will help you explain " +
          "the gap between rising revenue and falling conversion.",
        order: 2,
        tasks: [
          {
            id: "da_sales_t2",
            type: "multi_select",
            title: "Useful Metrics",
            prompt:
              "Which of the following metrics would be most useful for understanding why revenue " +
              "increased while conversion rate decreased? Select all that apply.",
            options: [
              "Conversion rate trend over the past 30 days",
              "Average order value compared to the previous period",
              "Cart abandonment rate by checkout step",
              "Traffic source breakdown (organic, paid, direct, referral)",
              "Footer text character length on the homepage",
              "Admin profile picture shape setting",
              "CSS class naming convention in the design system",
            ],
            correctAnswers: [
              "Conversion rate trend over the past 30 days",
              "Average order value compared to the previous period",
              "Cart abandonment rate by checkout step",
              "Traffic source breakdown (organic, paid, direct, referral)",
            ],
            points: 15,
            skillWeights: {
              "Metric Analysis": 0.4,
              "Data Interpretation": 0.3,
              "Business Insight": 0.2,
              "Critical Thinking": 0.1,
            },
            explanation:
              "Conversion rate trend shows how the drop evolved; average order value explains " +
              "why revenue could rise despite fewer conversions; cart abandonment by step points " +
              "to where users drop off; traffic source breakdown reveals whether a quality shift " +
              "in visitors is responsible. UI styling and admin settings have no analytical value " +
              "for this question.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 3: Insight Identification ────────────────────────────────
      {
        id: "da_sales_s3",
        title: "Insight Identification",
        narrative:
          "You have the right metrics in front of you. The pattern is becoming clear. You now " +
          "need to identify the strongest business insight the data is communicating, then decide " +
          "the best sequence of analysis steps to present to the growth team.",
        order: 3,
        tasks: [
          {
            id: "da_sales_t3",
            type: "scenario_mcq",
            title: "Business Insight",
            context:
              "Dashboard metrics for this month vs last month:\n" +
              "- Total revenue: +12%\n" +
              "- Average order value: +18%\n" +
              "- Conversion rate: -7%\n" +
              "- Cart abandonment rate: +10%\n" +
              "- Total site traffic: roughly flat (+1%)\n",
            prompt:
              "Based on the metrics above, what is the strongest business insight?",
            options: [
              "Revenue growth is likely driven by larger individual purchases, but fewer users are successfully converting — suggesting friction somewhere in the checkout journey",
              "The business has no problems because revenue increased, so no further analysis is needed",
              "The website should immediately remove all products and rebuild the catalogue from scratch",
              "The dashboard is unreliable because it shows more than one metric at a time",
            ],
            correctAnswer:
              "Revenue growth is likely driven by larger individual purchases, but fewer users are successfully converting — suggesting friction somewhere in the checkout journey",
            points: 20,
            skillWeights: {
              "Business Insight": 0.4,
              "Data Interpretation": 0.3,
              "Metric Analysis": 0.2,
              "Critical Thinking": 0.1,
            },
            explanation:
              "With traffic flat, the only way revenue can rise while conversion falls is if the " +
              "users who do convert are spending more. The +18% average order value confirms this. " +
              "The +10% cart abandonment suggests a growing proportion of users are dropping out " +
              "before completing a purchase, pointing to checkout journey friction that is worth " +
              "investigating even though the headline revenue number looks positive.",
            aiGraded: false,
          },
          {
            id: "da_sales_t4",
            type: "ordering",
            title: "Analysis Workflow Order",
            prompt:
              "You have identified the insight. Arrange the following analysis steps in the most " +
              "effective order from first to last.",
            options: [
              "Review the key dashboard metrics and note which ones changed unusually",
              "Compare related metrics such as conversion rate, revenue, order value, and abandonment",
              "Segment the data by traffic source, device type, or product category to isolate the pattern",
              "Form a business insight supported by the evidence you have gathered",
              "Communicate the insight with a recommended next investigation or action",
            ],
            correctOrder: [
              "Review the key dashboard metrics and note which ones changed unusually",
              "Compare related metrics such as conversion rate, revenue, order value, and abandonment",
              "Segment the data by traffic source, device type, or product category to isolate the pattern",
              "Form a business insight supported by the evidence you have gathered",
              "Communicate the insight with a recommended next investigation or action",
            ],
            points: 15,
            skillWeights: {
              "Metric Analysis": 0.3,
              "Data Interpretation": 0.25,
              "Business Insight": 0.25,
              "Data Communication": 0.2,
            },
            explanation:
              "A structured analysis workflow moves from observation to insight to communication: " +
              "flag unusual changes first, compare related metrics to understand them, segment to " +
              "isolate the root pattern, synthesise into an insight, then communicate. Communicating " +
              "before forming an evidence-based insight leads to vague or misleading summaries; " +
              "segmenting before comparing related metrics can send the analysis in the wrong direction.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 4: Insight Communication ─────────────────────────────────
      {
        id: "da_sales_s4",
        title: "Insight Communication",
        narrative:
          "Your analysis is complete. The growth team is waiting for your summary before the " +
          "weekly review meeting. A strong analyst insight update is specific, evidence-backed, " +
          "and tells the reader what to do next — not just what the numbers say.",
        order: 4,
        tasks: [
          {
            id: "da_sales_t5",
            type: "written_response",
            title: "Dashboard Insight Summary",
            prompt:
              "Write a short update (3–5 sentences) to the e-commerce team explaining: " +
              "(1) the main insight from the dashboard, " +
              "(2) the evidence that supports it, and " +
              "(3) the follow-up action you recommend.",
            points: 10,
            aiGraded: true,
            modelAnswer:
              "This month's revenue increase of 12% appears to be driven primarily by a rise in " +
              "average order value (+18%) rather than by more customers completing purchases. " +
              "Conversion rate fell 7% and cart abandonment increased 10%, while total traffic " +
              "was roughly flat — indicating that a growing proportion of visitors are dropping " +
              "off before checkout completion. The revenue headline is positive, but the underlying " +
              "trend suggests friction in the checkout journey that is preventing a larger share of " +
              "visitors from converting. I recommend segmenting cart abandonment by checkout step, " +
              "device type, and traffic source to identify where users are dropping off and whether " +
              "the issue is concentrated in a specific segment.",
            skillWeights: {
              "Data Communication": 0.4,
              "Business Insight": 0.3,
              "Data Interpretation": 0.2,
              "Critical Thinking": 0.1,
            },
            rubric: [
              {
                criterion: "Insight Explanation",
                maxScore: 2,
                description:
                  "Candidate clearly identifies the core insight: that revenue growth is driven by " +
                  "higher order value rather than more conversions, and that conversion and abandonment " +
                  "metrics signal checkout friction. Statements that simply repeat the headline numbers " +
                  "without synthesising them into a business insight score lower.",
                skillWeights: {
                  "Business Insight": 0.5,
                  "Data Interpretation": 0.5,
                },
              },
              {
                criterion: "Evidence-Based Reasoning",
                maxScore: 3,
                description:
                  "Candidate supports the insight with specific metric evidence: the revenue and " +
                  "order value increases, the conversion rate drop, the cart abandonment rise, and " +
                  "the flat traffic figure. Higher scores for reasoning that connects the numbers " +
                  "into a coherent story (e.g., traffic is flat so revenue can only rise if order " +
                  "value rises). Generic statements like 'the metrics show a problem' without citing " +
                  "numbers score lower.",
                skillWeights: {
                  "Metric Analysis": 0.4,
                  "Data Interpretation": 0.35,
                  "Critical Thinking": 0.25,
                },
              },
              {
                criterion: "Recommended Follow-up Action",
                maxScore: 3,
                description:
                  "Candidate recommends a concrete, targeted next investigation: segmenting " +
                  "abandonment by checkout step, device type, traffic source, or product category. " +
                  "Higher scores for recommendations that are specific and logically connected to " +
                  "the insight (i.e., they would actually help locate the source of the friction). " +
                  "Vague recommendations like 'investigate further' without specifying what to " +
                  "investigate score lower.",
                skillWeights: {
                  "Business Insight": 0.4,
                  "Data Communication": 0.35,
                  "Metric Analysis": 0.25,
                },
              },
              {
                criterion: "Communication Clarity",
                maxScore: 2,
                description:
                  "Update is concise, structured, and accessible to a non-technical growth team " +
                  "audience. It flows logically (insight → evidence → next step), avoids jargon " +
                  "without losing precision, and gives the reader a clear basis for deciding what " +
                  "to investigate next.",
                skillWeights: {
                  "Data Communication": 1.0,
                },
              },
            ],
          },
        ],
      },
    ],
  },

  // ── QA Engineer — Regression Testing and Bug Triage ──────────────────────
  {
    title: "Regression Testing and Bug Triage",
    slug: "qa-engineer-regression-testing-bug-triage",
    roleCategory: "QA Engineer",
    difficulty: "Beginner",
    estimatedMinutes: 22,
    xp: 110,
    passMark: 70,
    status: "active",
    isPublished: true,
    overview:
      "Step into the role of a junior QA engineer testing a checkout update before release. " +
      "A previous payment bug has been fixed, but you need to make sure the fix did not break " +
      "related flows. You must select meaningful regression tests, classify a newly discovered " +
      "bug by severity, and communicate the release risk clearly — just as you would on a real " +
      "QA team.",
    workplaceBrief:
      "You are a junior QA engineer at Cartly. The development team has fixed a payment " +
      "processing bug that caused some users to receive duplicate charge errors during checkout. " +
      "The fix is ready for release, and your QA lead has asked you to run regression tests " +
      "before it goes to production. While testing, you discover that payment is completing " +
      "successfully but the order confirmation page is sometimes failing to display the order " +
      "number. You need to test, triage, and advise the team on release readiness by end of day.",
    skillsAssessed: [
      "Test Case Design",
      "Bug Triage",
      "Regression Testing",
      "Quality Reasoning",
      "Communication",
    ],
    tags: ["QA", "Regression Testing", "Bug Triage", "Test Cases", "Quality Assurance"],
    stages: [
      // ── Stage 1: QA Brief ───────────────────────────────────────────────
      {
        id: "qa_regression_s1",
        title: "QA Brief",
        narrative:
          "A bug fix is ready for release. Before you write a single test case you need to " +
          "decide on the right first action. Jumping straight to execution without understanding " +
          "the affected area risks missing the tests that matter most.",
        order: 1,
        tasks: [
          {
            id: "qa_regression_t1",
            type: "scenario_mcq",
            title: "First Testing Decision",
            prompt:
              "A payment processing bug fix is ready for release. What is the best first action " +
              "before you start testing?",
            options: [
              "Test only the exact scenario where the original bug occurred and ignore all related flows",
              "Review the bug fix, the affected checkout area, and related payment flows before selecting regression tests",
              "Approve the release without any testing because the developer says it is fixed",
              "Rewrite the entire checkout application to prevent future bugs",
            ],
            correctAnswer:
              "Review the bug fix, the affected checkout area, and related payment flows before selecting regression tests",
            points: 10,
            skillWeights: {
              "Regression Testing": 0.4,
              "Test Case Design": 0.3,
              "Quality Reasoning": 0.3,
            },
            explanation:
              "Understanding the fix and its surrounding area is essential before selecting regression " +
              "tests. Testing only the originally reported scenario risks missing regressions in related " +
              "flows that share the same code path. A QA engineer should map the affected components " +
              "first, then decide which tests provide the best coverage.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 2: Regression Test Selection ─────────────────────────────
      {
        id: "qa_regression_s2",
        title: "Regression Test Selection",
        narrative:
          "You have reviewed the fix. It touched the payment processing service and the order " +
          "creation handler. Now you need to choose the most relevant regression tests. Not every " +
          "test on the list is useful for validating a payment bug fix — picking the right ones " +
          "is part of the QA engineer's job.",
        order: 2,
        tasks: [
          {
            id: "qa_regression_t2",
            type: "multi_select",
            title: "Useful Regression Tests",
            prompt:
              "Which of the following test cases are most useful for validating a checkout " +
              "payment bug fix? Select all that apply.",
            options: [
              "Successful checkout with valid card details",
              "Failed payment attempt with invalid card details",
              "Checkout flow using a saved delivery address",
              "Cart total recalculation after changing item quantity",
              "Blog comment text formatting and line-height style",
              "Admin dashboard colour theme preference setting",
              "Footer social media icon horizontal spacing",
            ],
            correctAnswers: [
              "Successful checkout with valid card details",
              "Failed payment attempt with invalid card details",
              "Checkout flow using a saved delivery address",
              "Cart total recalculation after changing item quantity",
            ],
            points: 15,
            skillWeights: {
              "Test Case Design": 0.4,
              "Regression Testing": 0.35,
              "Quality Reasoning": 0.25,
            },
            explanation:
              "The payment fix touched checkout and order creation, so tests covering the happy path " +
              "(valid payment), error path (invalid card), and related flows (saved address, cart " +
              "recalculation) all validate that nothing adjacent was broken. Blog formatting, admin " +
              "themes, and footer styling are unrelated to the payment service and add no regression " +
              "value here.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 3: Bug Triage ─────────────────────────────────────────────
      {
        id: "qa_regression_s3",
        title: "Bug Triage",
        narrative:
          "You are mid-way through regression testing. All four payment test cases pass, but " +
          "you have discovered a new issue. You need to decide how serious it is and where it " +
          "sits in the release decision, then determine the best sequence for the rest of your " +
          "QA workflow.",
        order: 3,
        tasks: [
          {
            id: "qa_regression_t3",
            type: "scenario_mcq",
            title: "Bug Severity Decision",
            context:
              "New issue found during regression testing:\n" +
              "- Payment completes successfully and the charge is captured\n" +
              "- On approximately 30% of test runs the order confirmation page loads without " +
              "  displaying the order number\n" +
              "- The user receives no on-screen confirmation that their order was placed\n" +
              "- Email confirmation is sent in all cases regardless of the screen issue\n" +
              "- The issue does not appear to affect payment capture or order creation in the database\n",
            prompt:
              "How should this issue be classified?",
            options: [
              "High priority — it affects user confidence and post-payment order confirmation, even though payment succeeds",
              "Low priority — the homepage and navigation still load correctly",
              "Not a bug — payment succeeded so the checkout flow is working",
              "Cosmetic only — missing order numbers have no effect on the customer journey",
            ],
            correctAnswer:
              "High priority — it affects user confidence and post-payment order confirmation, even though payment succeeds",
            points: 20,
            skillWeights: {
              "Bug Triage": 0.4,
              "Quality Reasoning": 0.3,
              "Regression Testing": 0.2,
              "Communication": 0.1,
            },
            explanation:
              "A user who completes payment and sees a blank confirmation screen has no on-screen " +
              "evidence their order was placed. Even though the payment and order are captured correctly, " +
              "this creates a serious trust and support burden: users may attempt to re-order, contact " +
              "support, or dispute the charge. Missing confirmation after payment is a high-priority " +
              "customer experience issue regardless of backend correctness.",
            aiGraded: false,
          },
          {
            id: "qa_regression_t4",
            type: "ordering",
            title: "QA Workflow Order",
            prompt:
              "You have found a new issue during regression testing. Arrange the following QA " +
              "actions in the most effective order from first to last.",
            options: [
              "Review the fixed bug and the affected checkout components",
              "Select regression test cases covering related payment and order confirmation flows",
              "Execute tests and record clear evidence including steps, expected, and actual results",
              "Triage any new or recurring issues by severity and business impact",
              "Communicate the release risk and test summary to the development team",
            ],
            correctOrder: [
              "Review the fixed bug and the affected checkout components",
              "Select regression test cases covering related payment and order confirmation flows",
              "Execute tests and record clear evidence including steps, expected, and actual results",
              "Triage any new or recurring issues by severity and business impact",
              "Communicate the release risk and test summary to the development team",
            ],
            points: 15,
            skillWeights: {
              "Regression Testing": 0.3,
              "Test Case Design": 0.25,
              "Bug Triage": 0.25,
              "Communication": 0.2,
            },
            explanation:
              "A disciplined QA workflow moves from understanding to planning to execution to triage " +
              "to communication. Communicating before triaging produces incomplete risk assessments; " +
              "executing before selecting test cases leads to ad hoc and incomplete coverage. Recording " +
              "evidence before triaging ensures triage decisions are grounded in reproducible results " +
              "rather than impressions.",
            aiGraded: false,
          },
        ],
      },

      // ── Stage 4: QA Release Summary ─────────────────────────────────────
      {
        id: "qa_regression_s4",
        title: "QA Release Summary",
        narrative:
          "Testing is complete. You have regression results, a triaged bug, and a clear picture " +
          "of release risk. The development team is waiting for your summary before making the " +
          "go/no-go decision. A good QA update is specific, evidence-backed, and gives the team " +
          "a clear release recommendation.",
        order: 4,
        tasks: [
          {
            id: "qa_regression_t5",
            type: "written_response",
            title: "Test Summary Update",
            prompt:
              "Write a short update (3–5 sentences) to the development team explaining: " +
              "(1) the regression testing result for the payment bug fix, " +
              "(2) any new issue found and its risk, and " +
              "(3) whether you recommend releasing or holding for a fix.",
            points: 10,
            aiGraded: true,
            modelAnswer:
              "Regression testing of the payment bug fix is complete. The four core test cases — " +
              "successful checkout, failed payment with invalid card, checkout with saved address, " +
              "and cart recalculation — all passed with no regressions found in the original fix. " +
              "However, a new issue was identified during testing: on approximately 30% of runs, " +
              "the order confirmation page fails to display the order number after a successful " +
              "payment, leaving users with no on-screen evidence their order was placed. Although " +
              "payment capture and order creation are not affected, this is a high-priority customer " +
              "trust issue. I recommend holding the release until this confirmation page issue is " +
              "fixed and retested, as releasing in this state is likely to generate support contacts " +
              "and potential duplicate orders from confused users.",
            skillWeights: {
              "Communication": 0.4,
              "Bug Triage": 0.25,
              "Regression Testing": 0.2,
              "Quality Reasoning": 0.15,
            },
            rubric: [
              {
                criterion: "Test Result Summary",
                maxScore: 2,
                description:
                  "Candidate summarises the regression test outcome clearly: which test cases were " +
                  "run, whether the original payment bug fix passed, and whether any regressions " +
                  "were found in related flows. Vague statements like 'testing was done' without " +
                  "describing what was tested or what passed score lower.",
                skillWeights: {
                  "Regression Testing": 0.5,
                  "Test Case Design": 0.5,
                },
              },
              {
                criterion: "Risk or Bug Impact Explanation",
                maxScore: 3,
                description:
                  "Candidate explains the newly found bug and its business impact: missing order " +
                  "confirmation after payment, the intermittent frequency, and the user trust or " +
                  "support implications. Higher scores for linking the specific bug behaviour to a " +
                  "concrete customer impact (e.g., user does not know order was placed, may re-order, " +
                  "may call support). Simply stating 'a bug was found' without describing the impact " +
                  "scores lower.",
                skillWeights: {
                  "Bug Triage": 0.5,
                  "Quality Reasoning": 0.35,
                  "Communication": 0.15,
                },
              },
              {
                criterion: "Release Recommendation",
                maxScore: 3,
                description:
                  "Candidate makes a clear, justified release recommendation: hold for fix (if the " +
                  "confirmation issue is high priority) or release with caveats (if they judge the " +
                  "risk acceptable given the email fallback). Higher scores for recommendations that " +
                  "are proportionate to the severity assessment and logically supported by the " +
                  "evidence. Vague statements like 'it depends' without a position score lower.",
                skillWeights: {
                  "Bug Triage": 0.4,
                  "Quality Reasoning": 0.4,
                  "Communication": 0.2,
                },
              },
              {
                criterion: "Communication Clarity",
                maxScore: 2,
                description:
                  "Update is concise, structured, and clear enough for the development team to act " +
                  "on immediately. It flows logically (test result → risk → recommendation), uses " +
                  "specific details (test names, failure frequency) rather than vague impressions, " +
                  "and gives the reader a basis for a confident go/no-go decision.",
                skillWeights: {
                  "Communication": 1.0,
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
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
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

