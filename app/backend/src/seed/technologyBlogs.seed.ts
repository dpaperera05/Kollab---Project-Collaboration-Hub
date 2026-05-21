import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/user.model";
import { Blog } from "../models/blog.model";

// ── Environment Guard ─────────────────────────────────────────────────────────

if (process.env.ALLOW_TECH_BLOG_SEED !== "true") {
  console.error("❌ ALLOW_TECH_BLOG_SEED must be set to true before running this script.");
  process.exit(1);
}

// ── Author Allowlist ──────────────────────────────────────────────────────────

const BLOG_AUTHORS = [
  {
    email: "pineeakarsha@gmail.com",
    userId: "69ca75d524f6d0e071425a18",
    name: "Pinee Akarsha",
  },
  {
    email: "maya.silva@kollabmail.test",
    userId: "6a0e821c65aa34cb0ecd52e8",
    name: "Maya Silva",
  },
  {
    email: "arjun.mehra@kollabmail.test",
    userId: "6a0e821c65aa34cb0ecd52e9",
    name: "Arjun Mehra",
  },
  {
    email: "sofia.martinez@kollabmail.test",
    userId: "6a0e821c65aa34cb0ecd52ea",
    name: "Sofia Martinez",
  },
  {
    email: "liam.anderson@kollabmail.test",
    userId: "6a0e821c65aa34cb0ecd52eb",
    name: "Liam Anderson",
  },
  {
    email: "aisha.khan@kollabmail.test",
    userId: "6a0e821d65aa34cb0ecd52ec",
    name: "Aisha Khan",
  },
  {
    email: "emma.schneider@kollabmail.test",
    userId: "6a0e821d65aa34cb0ecd52ee",
    name: "Emma Schneider",
  },
  {
    email: "sarah.chen@kollabmail.test",
    userId: "6a0ea2c565aa34cb0ecd5685",
    name: "Sarah Chen",
  },
  {
    email: "james.okonkwo@kollabmail.test",
    userId: "6a0ea2c565aa34cb0ecd5686",
    name: "James Okonkwo",
  },
  {
    email: "maria.gonzalez@kollabmail.test",
    userId: "6a0ea2c565aa34cb0ecd5687",
    name: "Maria Gonzalez",
  },
  {
    email: "rajesh.kumar@kollabmail.test",
    name: "Rajesh Kumar",
  },
  {
    email: "priya.menon@kollabmail.test",
    name: "Priya Menon",
  },
];

// ── Allowed Visible Tags ──────────────────────────────────────────────────────

const ALLOWED_TAGS = [
  "AI/ML", "Web Development", "Mobile", "IoT", "Robotics", "Cybersecurity",
  "Cloud Computing", "Data Science", "Blockchain", "Game Dev", "DevOps",
  "AR/VR", "FinTech", "HealthTech", "EdTech",
  "React", "Python", "TypeScript", "TensorFlow", "Figma", "AWS", "Docker",
  "Node.js", "Flutter", "Rust", "Go", "PostgreSQL", "MongoDB", "GraphQL",
  "Next.js", "Vue.js",
  "Beginner Friendly", "Career Advice", "UI/UX", "APIs", "System Design",
  "Open Source", "Interviews", "Productivity", "Portfolios",
];

// ── Forbidden Words ───────────────────────────────────────────────────────────

const FORBIDDEN_WORDS = ["demo", "seed", "fake", "sample", "dummy", "placeholder", "kollab seed"];

// ── Technology Blog Data ──────────────────────────────────────────────────────

const TECHNOLOGY_BLOGS = [
  {
    authorEmail: "sarah.chen@kollabmail.test",
    title: "Building Responsible AI Features Without Overengineering",
    excerpt: "Learn how teams can add useful AI features without making the product unnecessarily complex or brittle.",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80",
    tags: ["AI/ML", "Python", "System Design", "APIs"],
    viewCount: 742,
    content: `## Start with the problem, not the model

Many teams rush to integrate the latest AI models without clearly defining what user problem they're solving. Before choosing a model, write down the specific task you want to automate or improve. A simple rule-based system or basic regression model often delivers better results than a complex neural network for well-defined problems.

> The best AI feature is one that solves a real problem reliably, not one that uses the most sophisticated algorithm.

## Choose the right level of complexity

Not every AI feature needs a custom-trained model. Consider these tiers of complexity and choose the simplest one that meets your requirements:

- **Tier 1:** Use existing APIs (OpenAI, Hugging Face, cloud provider services)
- **Tier 2:** Fine-tune a pre-trained model on your domain data
- **Tier 3:** Train a model from scratch with your own architecture

For most product features, Tier 1 or Tier 2 provides the best balance of capability and maintenance burden. Training from scratch should be reserved for cases where existing models fundamentally cannot solve your problem.

## Design clear fallback behavior

AI systems make mistakes. Design your feature so that when the AI fails, the user experience degrades gracefully rather than breaking completely. This might mean:

- Showing a confidence score alongside AI suggestions
- Allowing manual override or correction
- Falling back to a simpler non-AI approach when confidence is low
- Logging failures for continuous improvement

Clear fallback behavior builds user trust and makes your product resilient to AI limitations.

## Monitor performance in production

AI behavior can drift over time as user patterns change or input data evolves. Set up lightweight monitoring to track key metrics:

**Essential AI monitoring checklist:**
- Response time and availability
- Confidence score distribution
- User acceptance rate of suggestions
- Manual override frequency
- Edge case detection rate
- Cost per request

Review these metrics weekly during the first month after launch, then monthly as the feature stabilizes.

## Keep the human in the loop

The most successful AI features augment human decision-making rather than replacing it entirely. Position AI as a smart assistant that suggests options, highlights patterns, or automates repetitive tasks, while leaving important decisions to the user.

This approach reduces the risk of harmful mistakes and makes users feel empowered rather than replaced.`,
  },
  {
    authorEmail: "arjun.mehra@kollabmail.test",
    title: "API Design Principles Every Full-Stack Developer Should Know",
    excerpt: "Practical REST API design covering validation, error handling, versioning, and documentation patterns that make APIs easy to use and maintain.",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80",
    tags: ["APIs", "Node.js", "System Design", "Web Development"],
    viewCount: 823,
    content: `## Design URLs that make sense

Your API URLs should be predictable and consistent. Use nouns for resources and HTTP verbs for actions. Avoid mixing conventions or using verbs in URLs.

**Good URL structure:**
- \`GET /users\` - List all users
- \`GET /users/:id\` - Get specific user
- \`POST /users\` - Create new user
- \`PUT /users/:id\` - Update entire user
- \`PATCH /users/:id\` - Update partial user fields
- \`DELETE /users/:id\` - Delete user

Keep URLs short, lowercase, and use hyphens for multi-word resources like \`/user-sessions\` rather than underscores or camelCase.

## Validate input at the boundary

Never trust client input. Validate all request data before processing it. Use a validation library like Zod, Joi, or Yup to define schemas that enforce data types, required fields, and business rules.

\`\`\`typescript
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().int().min(13).optional(),
});

export const createUser = async (req: Request, res: Response) => {
  const validated = createUserSchema.parse(req.body);
  // validated is now type-safe and guaranteed valid
  const user = await User.create(validated);
  return res.status(201).json({ success: true, data: user });
};
\`\`\`

Return clear error messages when validation fails, indicating which fields are invalid and why.

## Use consistent error responses

Structure error responses consistently across all endpoints. Include enough information for debugging without exposing sensitive implementation details.

**Recommended error response format:**
- \`success\`: boolean (always false for errors)
- \`message\`: human-readable error description
- \`code\`: machine-readable error identifier
- \`errors\`: array of field-specific validation errors (optional)

This consistency makes client-side error handling straightforward and predictable.

## Version your API from day one

Even if you only have one version initially, design your API to support versioning. The two most common approaches are URL versioning and header versioning.

URL versioning is simpler and more visible: \`/api/v1/users\`, \`/api/v2/users\`

When you need to make a breaking change, increment the version and maintain the old version for a reasonable transition period.

## Document your API clearly

Good API documentation includes:

**Essential documentation checklist:**
- Authentication requirements and examples
- List of all endpoints with HTTP methods
- Request parameter descriptions and types
- Example request bodies
- Example successful response bodies
- Example error responses
- Rate limiting rules
- Changelog of API updates

Tools like Swagger/OpenAPI make interactive documentation easy to maintain and keep in sync with your code.

## Return appropriate status codes

Use HTTP status codes correctly to communicate what happened:

- \`200 OK\` - Successful GET, PUT, PATCH, or DELETE
- \`201 Created\` - Successful POST
- \`400 Bad Request\` - Client sent invalid data
- \`401 Unauthorized\` - Authentication required or failed
- \`403 Forbidden\` - User lacks permission
- \`404 Not Found\` - Resource doesn't exist
- \`500 Internal Server Error\` - Server-side error

Using correct status codes makes debugging easier and enables proper client-side error handling.`,
  },
  {
    authorEmail: "maya.silva@kollabmail.test",
    title: "Frontend Performance Lessons for Modern Web Apps",
    excerpt: "Practical performance improvements for React apps, including lazy loading, image optimization, and bundle size awareness.",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
    tags: ["React", "TypeScript", "Web Development", "Productivity"],
    viewCount: 891,
    content: `## Measure before optimizing

Don't guess what's slow. Use browser DevTools Performance tab and Lighthouse to identify actual bottlenecks. Focus on metrics that matter to users: First Contentful Paint, Largest Contentful Paint, and Time to Interactive.

Record a performance profile while navigating your app. Look for long tasks that block the main thread and unnecessarily large JavaScript bundles.

> Performance optimization without measurement is premature optimization.

## Split your bundle intelligently

Large JavaScript bundles are the most common frontend performance problem. Use code splitting to break your bundle into smaller chunks that load on demand.

\`\`\`typescript
// Route-level code splitting with React.lazy
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
\`\`\`

This ensures users only download code for routes they actually visit. For most apps, route-level splitting provides the biggest benefit with minimal effort.

## Optimize images and media

Images often account for the majority of page weight. Apply these optimizations consistently:

- Use modern formats like WebP with JPEG fallbacks
- Serve responsive images with \`srcset\` for different screen sizes
- Lazy load images below the fold
- Compress images before upload (aim for under 200KB per image)
- Use loading blur effects during loading

For hero images and critical above-the-fold content, preload them with \`<link rel="preload">\` to avoid layout shifts.

## Avoid unnecessary re-renders

React re-renders can hurt performance when components re-render without their props or state actually changing. Use React DevTools Profiler to identify components that render too frequently.

**Common re-render fixes:**
- Memoize expensive calculations with \`useMemo\`
- Memoize callback functions with \`useCallback\`
- Use \`React.memo\` for pure components
- Move state closer to where it's used
- Split large components into smaller ones

Only optimize renders after profiling shows they're actually a problem. Premature memoization adds complexity without proven benefit.

## Implement progressive loading

Users should see something useful quickly, even if the full page takes time to load. Use skeleton screens or progressive content loading to make the app feel responsive.

**Progressive loading checklist:**
- Show page layout and navigation immediately
- Display skeleton placeholders for content areas
- Load critical data first, optional data later
- Stream data progressively rather than waiting for everything
- Provide feedback during loading states

This approach makes your app feel fast even when loading substantial data.

## Monitor real user performance

Synthetic tests don't capture real user experience. Use Real User Monitoring to track performance metrics from actual users in production. Services like Vercel Analytics, Google Analytics 4, or custom solutions give you visibility into:

- Performance by geographic region
- Performance by device type
- Performance by connection speed
- Core Web Vitals over time

Set performance budgets and get alerts when metrics degrade so you can fix issues before they impact many users.`,
  },
  {
    authorEmail: "james.okonkwo@kollabmail.test",
    title: "Cloud Deployment Basics for Student and Startup Projects",
    excerpt: "Understand deployment environments, environment variables, logs, build pipelines, and monitoring basics for shipping reliable applications.",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
    tags: ["Cloud Computing", "DevOps", "Docker", "AWS"],
    viewCount: 634,
    content: `## Understand your deployment environments

Most applications use at least three environments with different purposes:

- **Development:** Your local machine, rapid iteration, debugging tools active
- **Staging:** Cloud-hosted replica of production, final testing before launch
- **Production:** Live environment serving real users, optimized for stability

Keep these environments as similar as possible to avoid surprises. Use the same database versions, operating systems, and Node.js versions across all environments.

## Manage environment variables properly

Never hardcode secrets or environment-specific configuration in your code. Use environment variables for anything that changes between environments:

- Database connection strings
- API keys and secrets
- Feature flags
- Third-party service URLs
- Port numbers

Use a \`.env\` file locally, but never commit it to version control. In production, set environment variables through your hosting platform's dashboard or CLI.

\`\`\`bash
# .env.example (commit this as documentation)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-here
STRIPE_API_KEY=sk_test_...
NODE_ENV=development
\`\`\`

## Set up a basic CI/CD pipeline

Continuous Integration and Deployment automate testing and deployment, reducing human error and deployment friction. A minimal pipeline should:

**Essential CI/CD steps:**
1. Run automated tests on every commit
2. Build the application
3. Deploy to staging automatically on merge to main branch
4. Deploy to production manually or on tagged releases
5. Run smoke tests after deployment

GitHub Actions, GitLab CI, or CircleCI provide free tiers perfect for small projects. Start simple and add complexity as needed.

## Structure your logs for debugging

Good logging makes production issues much easier to diagnose. Log enough information to understand what happened, but not so much that logs become expensive or hard to search.

**What to log:**
- API requests with method, path, and response time
- Authentication attempts and failures
- Database errors and slow queries
- External API calls and failures
- Application startup and shutdown events

**What not to log:**
- Passwords or API keys
- Credit card numbers or personal identification
- Full request/response bodies by default

Use structured logging with JSON format so you can filter and search logs programmatically.

## Implement health check endpoints

Your application should expose a simple health check endpoint that other systems can use to verify it's running correctly.

\`\`\`typescript
app.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    await db.query('SELECT 1');
    
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    return res.status(503).json({
      status: 'unhealthy',
      error: 'Database connection failed',
    });
  }
});
\`\`\`

Load balancers and monitoring systems use this endpoint to detect when your application is having problems.

## Monitor key metrics from day one

You can't fix what you can't measure. Set up basic monitoring for:

- Application uptime and availability
- Response time for critical endpoints
- Error rate and error types
- Database query performance
- Memory and CPU usage

Free monitoring tools like UptimeRobot, Better Stack, or your cloud provider's built-in monitoring give you visibility without significant cost.

Set up alerts for critical failures so you learn about problems before users do. Start with email alerts, then add Slack or SMS notifications as your project grows.`,
  },
  {
    authorEmail: "rajesh.kumar@kollabmail.test",
    title: "Cybersecurity Habits Every Junior Developer Should Build",
    excerpt: "Essential secure coding habits covering authentication, secrets management, input validation, and the principle of least privilege.",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
    tags: ["Cybersecurity", "APIs", "System Design", "Career Advice"],
    viewCount: 567,
    content: `## Never trust user input

The most fundamental security principle is assuming all user input is malicious until proven otherwise. Validate, sanitize, and escape all data that comes from users, whether it's form submissions, URL parameters, or file uploads.

**Input validation checklist:**
- Check data types match expectations
- Enforce length limits on strings
- Whitelist allowed characters rather than blacklisting dangerous ones
- Validate email formats, URLs, and other structured data
- Reject unexpected or malformed input immediately

Use validation libraries rather than writing custom regular expressions, which often have subtle security vulnerabilities.

## Store secrets securely

Hardcoded passwords, API keys, and tokens are the most common security mistakes in student projects. Follow these rules without exception:

- Never commit secrets to version control
- Use environment variables for all sensitive configuration
- Rotate API keys and passwords regularly
- Use different credentials for each environment
- Store secrets in a secure vault for production (AWS Secrets Manager, HashiCorp Vault)

If you accidentally commit a secret, assume it's compromised immediately. Rotate the credential and push a new commit removing it. Deleting the commit from history isn't enough because Git history is distributed.

> A secret committed to version control should be considered permanently compromised.

## Implement authentication carefully

Authentication is easy to get wrong. Don't build your own authentication system from scratch unless you have security expertise. Use established libraries and patterns:

- Use bcrypt or Argon2 for password hashing, never plain text or MD5
- Implement rate limiting on login endpoints to prevent brute force attacks
- Require strong passwords with reasonable length requirements
- Add multi-factor authentication for sensitive operations
- Use secure session management with httpOnly cookies
- Implement proper password reset flows with time-limited tokens

For most applications, using an authentication service like Auth0, Firebase Auth, or AWS Cognito reduces security risk significantly.

## Apply the principle of least privilege

Users and systems should only have access to exactly what they need to perform their function, nothing more. This limits damage when credentials are compromised.

\`\`\`typescript
// Good: Check specific permission
if (user.permissions.includes('delete:posts')) {
  await deletePost(postId);
}

// Bad: Broad admin check
if (user.isAdmin) {
  await deletePost(postId);
}
\`\`\`

Database users should have the minimum required permissions. Your application database user shouldn't have DROP TABLE privileges in production.

## Sanitize output to prevent XSS

Cross-site scripting attacks happen when user-provided content is displayed without proper escaping. Modern frameworks like React escape content by default, but you can still introduce XSS vulnerabilities:

- Using \`dangerouslySetInnerHTML\` without sanitizing
- Constructing URLs from user input
- Rendering user content in server-side templates
- Storing and displaying unescaped HTML

When you must render user-provided HTML, use a sanitization library like DOMPurify that removes dangerous content while preserving safe markup.

## Keep dependencies updated

Most security vulnerabilities in modern applications come from outdated dependencies, not your own code. Regularly update your dependencies and pay attention to security advisories:

- Run \`npm audit\` weekly to check for known vulnerabilities
- Enable automated security updates through GitHub Dependabot
- Subscribe to security newsletters for frameworks you use
- Update dependencies before they fall too far behind

Set a reminder to review and update dependencies at least monthly. The longer you wait, the harder updates become.

## Build security awareness over time

Security isn't a one-time checklist. Read about common vulnerabilities, follow security researchers, and learn from security incidents at other companies. The OWASP Top 10 list is an excellent starting point for understanding web application security risks.`,
  },
  {
    authorEmail: "aisha.khan@kollabmail.test",
    title: "Designing Mobile Apps People Return To",
    excerpt: "Retention-focused mobile UX principles covering onboarding, notifications, performance, and meaningful user flows that encourage engagement.",
    coverImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1600&q=80",
    tags: ["Mobile", "Flutter", "UI/UX", "Productivity"],
    viewCount: 712,
    content: `## Make the first experience frictionless

Most users decide whether to keep your app within the first 60 seconds. Optimize your onboarding flow to demonstrate value immediately, not after a lengthy tutorial.

**Effective onboarding principles:**
- Show core functionality before requiring account creation
- Use progressive disclosure rather than overwhelming users with all features
- Make skip buttons visible for optional steps
- Personalize the experience based on user choices
- Get to the first success moment as quickly as possible

Measure your onboarding completion rate and iterate on any step where significant drop-off occurs.

## Design notifications that respect attention

Push notifications are powerful for retention but easily become annoying. Every notification should provide clear value and be something the user genuinely wants to know.

Ask yourself: Would I want to receive this notification? If the answer is hesitant, reconsider sending it.

> Good notifications bring users back to your app. Bad notifications train users to disable notifications entirely.

**Notification best practices:**
- Let users customize notification preferences granularly
- Time notifications based on user activity patterns
- Never send promotional notifications disguised as updates
- Provide notification previews that show enough context
- Include action buttons when users can respond directly

Track notification open rates and uninstall rates after notifications to understand if you're adding value or creating friction.

## Optimize for perceived performance

Actual performance and perceived performance are both important. Users will tolerate longer operations if the app feels responsive and provides clear feedback.

Use skeleton screens instead of loading spinners. Skeleton screens show the layout structure while content loads, making the wait feel shorter and less disruptive.

Implement optimistic updates where the UI responds immediately to user actions, assuming the operation will succeed. If it fails, roll back gracefully.

\`\`\`dart
// Optimistic update pattern in Flutter
Future<void> toggleFavorite(Item item) async {
  // Update UI immediately
  setState(() {
    item.isFavorite = !item.isFavorite;
  });
  
  try {
    // Persist to backend
    await api.updateFavorite(item.id, item.isFavorite);
  } catch (error) {
    // Roll back on failure
    setState(() {
      item.isFavorite = !item.isFavorite;
    });
    showError('Failed to update favorite');
  }
}
\`\`\`

## Create habitual interaction patterns

Apps with high retention typically have clear trigger-action-reward loops that encourage daily use. Identify your app's core loop and make it satisfying to complete.

**Elements of effective habit loops:**
- Clear trigger that prompts app opening (notification, routine, or need)
- Simple action that fulfills a user goal
- Variable reward that provides value and occasional delight
- Investment that makes future use more valuable

The best retention strategies feel helpful rather than manipulative. Focus on genuine value delivery, not artificial engagement tricks.

## Provide clear navigation and escape routes

Users should always know where they are in your app and how to get back. Mobile navigation is constrained by small screens, so clarity is essential.

- Use standard navigation patterns (bottom tabs, hamburger menu, or navigation drawer)
- Keep navigation hierarchy shallow (ideally three levels maximum)
- Provide visible back buttons and clear breadcrumbs
- Show active states clearly in navigation
- Allow direct navigation to key screens from anywhere

Test your navigation with users unfamiliar with your app. If they get lost or confused, simplify the structure.

## Make offline functionality graceful

Mobile users frequently experience poor or no connectivity. Apps that fail completely without internet feel unreliable, even if the connection issue isn't your fault.

Implement offline-first architecture where possible:

- Cache recently viewed content for offline access
- Queue user actions to sync when connectivity returns
- Show clear offline indicators
- Provide meaningful offline states rather than blank screens
- Sync intelligently to avoid overwhelming users with changes

Even basic offline support dramatically improves perceived reliability and user trust.`,
  },
  {
    authorEmail: "emma.schneider@kollabmail.test",
    title: "What Makes a Data Dashboard Useful",
    excerpt: "Build dashboards that drive decisions through clear metrics selection, effective filters, meaningful drilldowns, and avoiding vanity metrics.",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
    tags: ["Data Science", "PostgreSQL", "Productivity", "UI/UX"],
    viewCount: 489,
    content: `## Start with the decisions, not the data

Before building a dashboard, identify what decisions it should support. A useful dashboard helps users understand a situation and choose an action, not just display numbers.

Ask stakeholders: What question are you trying to answer? What action would you take based on this data? Design your dashboard to make those specific decisions easier.

> Dashboards should enable action, not just display information.

## Choose metrics that matter

Not all metrics deserve dashboard space. Focus on metrics that are actionable, understandable, and actually influence decisions.

**Useful metrics have these qualities:**
- Clearly defined calculation method
- Direct connection to business or product goals
- Can be influenced by team actions
- Meaningful to the intended audience
- Update frequency matches decision cadence

Vanity metrics like total user count or cumulative revenue look impressive but rarely drive meaningful decisions. Prefer rate of change, cohort retention, and conversion metrics that reveal trends and problems.

## Design for scanning, not studying

Dashboard users want to understand the situation quickly, not analyze complex visualizations. Optimize for fast comprehension:

- Put the most important metric prominently at the top
- Use color to highlight problems or opportunities
- Show comparison periods (week over week, year over year)
- Include trend indicators (up/down arrows with percentages)
- Limit to 5-7 key metrics on the primary view

More detailed analysis should be available through drilldowns, but the overview should communicate status at a glance.

\`\`\`sql
-- Good metric query: shows change over time
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as new_users,
  COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', created_at)) as change_from_previous
FROM users
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
\`\`\`

## Implement smart filtering

Effective filters let users explore data from different perspectives without overwhelming them with options. Design filters that match how users think about the data:

- Default to the most common filter combination
- Show filter selections clearly
- Persist filter state in URL for shareability
- Limit simultaneous filters to avoid analysis paralysis
- Provide quick filter presets for common scenarios

Test filters with actual users to ensure they match mental models.

## Build meaningful drilldowns

Summary metrics raise questions that drilldowns should answer. When a metric looks unusual, users should be able to click through to understand why.

**Effective drilldown hierarchy:**
1. Overall metric (e.g., total revenue this month)
2. Breakdown by category (revenue by product line)
3. Breakdown by time (revenue by day)
4. Individual transactions or users

Each level should provide enough context to either take action or drill deeper. Avoid drilldowns that lead to raw data dumps without interpretation.

## Avoid misleading visualizations

Poor chart choices can mislead users even when the underlying data is correct. Follow these visualization rules:

- Always start bar charts at zero
- Choose chart types that match data relationships
- Use consistent color schemes across dashboards
- Label axes clearly with units
- Include response counts for percentages
- Show confidence intervals for predictions

When in doubt, use simple bar or line charts. Fancy visualizations often obscure rather than clarify.

## Update at the right frequency

Different metrics need different refresh rates. Real-time updates create urgency but can be distracting. Batch updates are calmer but might miss time-sensitive issues.

**Common update cadences:**
- Real-time: System health, critical errors, live user counts
- Hourly: Operational metrics, campaign performance
- Daily: Business metrics, user engagement, revenue
- Weekly/Monthly: Strategic metrics, long-term trends

Match update frequency to decision frequency. If users only review weekly, hourly updates add no value and create unnecessary database load.`,
  },
  {
    authorEmail: "james.okonkwo@kollabmail.test",
    title: "DevOps Practices That Make Small Teams More Reliable",
    excerpt: "Adopt CI/CD, deployment checks, rollback planning, observability, and release confidence practices that prevent incidents.",
    coverImage: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1600&q=80",
    tags: ["DevOps", "Docker", "AWS", "Productivity"],
    viewCount: 698,
    content: `## Automate testing before deployment

Manual testing before every deployment is slow, inconsistent, and doesn't scale. Automated tests catch regressions immediately and give you confidence to deploy frequently.

**Essential automated test layers:**
- Unit tests for business logic
- Integration tests for API contracts
- End-to-end tests for critical user flows
- Performance tests for response times
- Security scans for vulnerabilities

Run fast tests on every commit. Run slower end-to-end tests before production deployment. Don't wait until tests are comprehensive to start deploying automatically—even basic smoke tests add value.

## Make deployments boring and frequent

Deployments should be routine events, not stressful all-hands-on-deck emergencies. The way to make deployments boring is to do them often.

Deploy to staging daily or after every merged pull request. Deploy to production weekly at minimum, daily if possible. Frequent deployments mean smaller changes, which are easier to test and debug when something goes wrong.

> If deployment is painful, do it more often until it becomes automatic.

Use feature flags to deploy code without immediately exposing it to users. This decouples deployment from release, giving you more control over rollout timing and scope.

## Build rollback into your deployment process

Every deployment should have a clearly defined rollback procedure that's tested regularly. When something goes wrong in production, you need to restore service quickly, not figure out recovery procedures under pressure.

\`\`\`bash
# Deployment script with automatic rollback
deploy() {
  echo "Deploying version $NEW_VERSION..."
  
  # Store current version
  PREVIOUS_VERSION=$(get_current_version)
  
  # Deploy new version
  kubectl set image deployment/app app=$NEW_VERSION
  
  # Wait for rollout and check health
  if ! kubectl rollout status deployment/app --timeout=5m; then
    echo "Deployment failed, rolling back to $PREVIOUS_VERSION"
    kubectl set image deployment/app app=$PREVIOUS_VERSION
    exit 1
  fi
  
  # Run smoke tests
  if ! run_smoke_tests; then
    echo "Smoke tests failed, rolling back"
    kubectl set image deployment/app app=$PREVIOUS_VERSION
    exit 1
  fi
  
  echo "Deployment successful"
}
\`\`\`

Practice rollbacks in staging environments so the process is familiar when you need it in production.

## Implement comprehensive logging

You can't debug what you can't observe. Structured logging makes troubleshooting production issues dramatically faster.

Log every significant application event with enough context to reconstruct what happened:

- User actions and outcomes
- External API calls and responses
- Database queries and execution times
- Authentication events
- Errors with full stack traces
- Feature flag evaluations

Use structured JSON logging so you can search and filter logs programmatically. Include correlation IDs that trace requests across services.

## Monitor what matters to users

Monitoring should answer the question: Is the application working for users right now? Track metrics that directly reflect user experience, not just system internals.

**User-facing metrics to monitor:**
- Request success rate by endpoint
- p95 and p99 response times
- Error rate and error types
- Authentication success rate
- Critical user flow completion rate

Set up alerts for meaningful thresholds, not arbitrary numbers. Alert fatigue from noisy alerts is worse than no alerts at all.

## Document incident response procedures

When production breaks at 2 AM, you don't want to be searching documentation for recovery steps. Maintain a clear incident response playbook that anyone on the team can follow.

**Incident response checklist:**
1. Acknowledge the alert and assess severity
2. Check recent deployments and changes
3. Review error logs and monitoring dashboards
4. Identify the root cause or rollback if unknown
5. Communicate status to stakeholders
6. Implement fix or rollback
7. Verify recovery with monitoring
8. Document incident and prevention steps

Run practice incidents quarterly so the team stays familiar with procedures and tools.

## Build observability from the start

Observability means being able to understand system behavior from external outputs without needing to deploy new code. Build this capability early, not after you start having production issues.

Implement distributed tracing to follow requests across services. Use metrics to track trends over time. Collect logs for detailed debugging. Together, these give you visibility into what your system is doing and why.

Small teams benefit enormously from managed observability platforms that provide logs, metrics, and traces in one place without requiring infrastructure expertise.`,
  },
  {
    authorEmail: "maria.gonzalez@kollabmail.test",
    title: "UX Research Methods for Technical Products",
    excerpt: "Lightweight research techniques including user interviews, usability testing, journey mapping, and prioritization for small teams.",
    coverImage: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1600&q=80",
    tags: ["UI/UX", "Figma", "Career Advice", "Productivity"],
    viewCount: 621,
    content: `## Start with user interviews

Before building features, talk to people who might use them. User interviews reveal motivations, frustrations, and workflows that you can't discover through analytics or assumptions.

**Effective interview structure:**
- Start with open questions about their current process
- Ask them to walk through recent examples
- Focus on problems and contexts, not solutions
- Probe for workarounds and pain points
- End with their ideal outcome

Avoid leading questions like "Would you use a feature that does X?" Instead ask "How do you currently accomplish X?" and listen for unmet needs.

> Users are experts at describing their problems, but rarely expert at designing solutions.

Record interviews (with permission) so you can focus on listening rather than note-taking. Review recordings to identify patterns across multiple users.

## Conduct lightweight usability testing

Usability testing doesn't require a formal lab or expensive tools. Five users testing your prototype will reveal most major usability issues.

Give users realistic tasks and watch them complete them without guidance:

1. Set up screen recording to capture their actions
2. Give them a specific goal (e.g., "Find and book an appointment")
3. Ask them to think aloud while working
4. Don't help or explain—observe where they struggle
5. Note confusion, errors, and unexpected paths

You'll quickly see where your interface makes sense and where it confuses people. One hour of usability testing prevents weeks of building the wrong thing.

\`\`\`markdown
## Usability Test Script Template

**Task:** Schedule a meeting with your mentor

**Success criteria:** User reaches confirmation screen

**Prompts if stuck:**
- "What are you looking for?"
- "What do you think this button does?"
- "Is this what you expected to happen?"

**Observe:**
- Time to complete task
- Number of errors or wrong paths
- Moments of confusion or hesitation
- Features they discover vs. features they miss
\`\`\`

## Map user journeys

Journey maps visualize the complete user experience from initial problem awareness through goal completion. They help identify friction points and opportunities for improvement.

Create a simple journey map by listing:

**Journey map components:**
- User goal or trigger
- Steps the user takes
- Touchpoints with your product
- User thoughts and feelings at each step
- Pain points and obstacles
- Opportunities for improvement

Focus on one specific user type and one specific goal per journey map. Trying to map every possible user and scenario creates unusable complexity.

## Prioritize based on impact and effort

UX research often reveals more problems than you can solve immediately. Use a simple prioritization framework to decide what to tackle first.

Plot each improvement opportunity on a 2x2 matrix:

- High impact, low effort: Do immediately
- High impact, high effort: Plan carefully and resource appropriately
- Low impact, low effort: Do when convenient
- Low impact, high effort: Probably not worth doing

Impact is how much the improvement affects user success and satisfaction. Effort is time and complexity to implement. Be honest about both dimensions.

## Validate with prototypes, not production code

Build interactive prototypes in Figma, Framer, or similar tools to test ideas before writing code. Prototyping is fast, cheap, and lets you test multiple approaches without technical constraints.

Prototypes for testing should be realistic enough to feel like the actual product, but don't need to work perfectly or handle edge cases. Focus on the core interaction you want to validate.

Test prototypes with users the same way you'd test production features. Their feedback is just as valuable and comes much earlier in the process.

## Run continuous discovery, not one-time research

UX research isn't a phase that happens before development. Effective teams integrate lightweight research into every sprint through:

- Weekly user interview sessions
- Bi-weekly usability tests of new features
- Regular review of user support tickets
- Periodic analysis of user behavior analytics
- Quarterly journey mapping updates

Small, frequent research activities keep the team connected to real user needs and prevent building based on assumptions that drift from reality.

## Make research visible and actionable

Research is only valuable if it influences decisions. Share findings in formats that make them easy to use:

- Record and clip key interview moments
- Create highlight reels of usability test pain points
- Summarize findings as user stories or job stories
- Display journey maps in team spaces
- Maintain a shared repository of research insights

The best research documentation is short, visual, and linked directly to the problems you're solving.`,
  },
  {
    authorEmail: "priya.menon@kollabmail.test",
    title: "Common Database Design Mistakes in Growing Applications",
    excerpt: "Avoid schema design pitfalls, missing indexes, unnecessary duplication, migration complexity, and query performance issues as your app scales.",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80",
    tags: ["PostgreSQL", "MongoDB", "System Design", "Web Development"],
    viewCount: 837,
    content: `## Avoid premature denormalization

The first database mistake many developers make is denormalizing data too early to avoid joins. While denormalization can improve read performance, it creates consistency problems that are harder to fix than slow queries.

Start with normalized data structure. Add strategic denormalization only after profiling shows that specific queries are actually slow and that indexes won't solve the problem.

> Premature optimization is the root of all evil, especially in database design.

When you do denormalize, treat denormalized data as a cache that can be rebuilt from the source of truth. Never put unique information only in denormalized fields.

## Index the right columns

Missing indexes are the most common cause of slow queries. Every query filter, join condition, and sort operation benefits from appropriate indexes.

**When to add an index:**
- Columns in WHERE clauses
- Columns in JOIN conditions
- Columns in ORDER BY clauses
- Foreign key columns
- Columns frequently used for grouping

Don't index everything blindly. Indexes speed up reads but slow down writes. Each index also consumes disk space. Profile your actual queries and index based on real usage patterns.

\`\`\`sql
-- Add index for common query patterns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX idx_orders_status_date ON orders(status, order_date) WHERE status != 'completed';
\`\`\`

## Plan for schema migrations early

Schema changes become harder as your database grows and your application gains users. Design your migration strategy before you need it.

Use migration tools like Knex, TypeORM migrations, or Alembic from the start. Migrations should be:

- Version controlled alongside code
- Idempotent (safe to run multiple times)
- Reversible when possible
- Tested in staging before production
- Fast enough to avoid extended downtime

For large tables, consider zero-downtime migration strategies like dual-write periods or online schema change tools.

## Choose the right data types

Using VARCHAR(255) for everything wastes space and hurts performance. Choose data types that match your data's actual constraints:

- Use INTEGER types with appropriate size (SMALLINT, INT, BIGINT)
- Use DECIMAL for money, never FLOAT
- Use TIMESTAMP for dates with timezone awareness
- Use BOOLEAN for true/false, not strings or integers
- Use ENUM or CHECK constraints for limited options
- Use JSONB in PostgreSQL for flexible nested data

Correct data types enable better indexes, smaller storage, faster queries, and database-level validation.

## Avoid N+1 query problems

N+1 queries happen when you load a collection and then make additional database queries for each item. This kills performance as data grows.

\`\`\`javascript
// Bad: N+1 queries
const users = await User.find({});
for (const user of users) {
  user.posts = await Post.find({ authorId: user.id }); // N additional queries
}

// Good: Single query with join
const users = await User.find({})
  .populate('posts'); // Or use SQL JOIN
\`\`\`

Always use eager loading (joins or includes) when you know you'll need related data. Most ORMs provide query debugging tools to identify N+1 issues.

## Design for data ownership and access patterns

Schema design should reflect how you'll actually query the data. In MongoDB, embed documents you'll always access together. In PostgreSQL, join tables that represent different entities.

**MongoDB embedding guidelines:**
- Embed data that's always accessed together
- Embed one-to-few relationships (user and addresses)
- Keep embedded arrays bounded in size
- Reference data that's accessed independently

**PostgreSQL join guidelines:**
- Join when data represents distinct entities
- Join for many-to-many relationships
- Join when the same data is referenced from multiple tables
- Join when data is updated independently

## Handle soft deletes thoughtfully

Soft deletes (marking records as deleted rather than removing them) seem convenient but complicate queries and indexes. Every query needs \`WHERE deleted_at IS NULL\`.

If you need soft deletes, implement them consistently:

- Add \`deleted_at\` timestamp column
- Create database views that filter deleted records
- Update all indexes to handle deleted records efficiently
- Document whether queries should include deleted records
- Provide admin interfaces to actually delete old soft-deleted records

Consider if you truly need soft deletes or if an audit log table would serve the same purpose more cleanly.

## Monitor query performance in production

Development databases are small and fast. Production databases reveal performance problems that didn't exist in testing. Monitor slow queries from day one.

Enable slow query logging in your database. Most databases can log queries exceeding a time threshold. Review these logs weekly and add indexes or optimize queries that appear frequently.

Use query analysis tools like pg_stat_statements in PostgreSQL or MongoDB's profiler to understand actual query patterns. Production usage often differs significantly from what you expected during design.`,
  },
  {
    authorEmail: "pineeakarsha@gmail.com",
    title: "Practical IoT Architecture for Smart Environments",
    excerpt: "Design reliable IoT systems covering sensor data flow, device commands, edge vs cloud responsibilities, alert handling, and dashboard integration.",
    coverImage: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=1600&q=80",
    tags: ["IoT", "Cloud Computing", "APIs", "System Design"],
    viewCount: 453,
    content: `## Separate edge and cloud responsibilities

IoT systems span constrained edge devices and powerful cloud infrastructure. Design your architecture to leverage the strengths of each layer.

**Edge device responsibilities:**
- Immediate sensor reading and basic filtering
- Local decision-making for time-critical actions
- Buffering data during connectivity interruptions
- Edge processing to reduce bandwidth usage

**Cloud responsibilities:**
- Long-term data storage and analysis
- Complex machine learning and pattern detection
- Centralized device management and updates
- User dashboard and notification services

Don't try to run complex processing on resource-constrained devices, but don't send unnecessary data to the cloud either. Find the right balance based on latency requirements and network constraints.

## Design resilient communication patterns

IoT devices often operate in unreliable network conditions. Your architecture must handle intermittent connectivity gracefully.

Use message queues (MQTT, AWS IoT Core, Azure IoT Hub) rather than direct HTTP requests. Message queues provide:

- Automatic retry on network failures
- Quality of service guarantees
- Efficient bandwidth usage for constrained networks
- Offline buffering on edge devices

\`\`\`python
# Reliable MQTT publishing pattern
import paho.mqtt.client as mqtt
import json
import time

def publish_sensor_data(client, sensor_id, reading):
    topic = f"sensors/{sensor_id}/data"
    payload = json.dumps({
        "sensor_id": sensor_id,
        "value": reading,
        "timestamp": time.time(),
    })
    
    # QoS 1 ensures at-least-once delivery
    result = client.publish(topic, payload, qos=1)
    
    if result.rc != mqtt.MQTT_ERR_SUCCESS:
        # Buffer locally for retry
        buffer_message(topic, payload)
\`\`\`

## Implement smart data sampling

Sending every sensor reading to the cloud wastes bandwidth and storage. Implement intelligent sampling strategies based on your requirements:

- Time-based sampling: Send readings every N seconds
- Change-based sampling: Send only when value changes significantly
- Event-based sampling: Send when thresholds are crossed
- Statistical sampling: Send min/max/average over time windows

For most environmental monitoring, change-based sampling dramatically reduces data volume while maintaining accuracy.

## Handle device commands reliably

Sending commands to IoT devices (turn on a light, adjust a thermostat) requires careful design because devices might be offline when commands are issued.

**Reliable command pattern:**
1. User issues command through cloud API
2. Cloud stores command in persistent queue
3. Device polls for pending commands or receives via subscription
4. Device executes command and acknowledges completion
5. Cloud updates command status and notifies user

Store command history so users can see what actions were taken and when, even if the device was offline at command time.

## Design meaningful alert thresholds

Alert fatigue kills IoT system value. Users ignore notifications when too many are false alarms or irrelevant.

Define alert conditions carefully:

- Use hysteresis to avoid flapping (different on/off thresholds)
- Require sustained conditions before alerting
- Rate-limit repeated alerts for the same condition
- Allow user-customizable thresholds when appropriate
- Include context in alerts (current value, threshold, duration)

Test alert thresholds with real users before deploying to production. What seems important to engineers might not matter to actual users.

## Build useful dashboards, not data dumps

IoT dashboards should show actionable insights, not just raw sensor readings. Users want to understand the current state and trends, not analyze data.

**Effective IoT dashboard elements:**
- Current status indicators for each device
- Trend charts showing recent history
- Alerts and anomalies highlighted prominently
- Device health and connectivity status
- Quick actions for common commands

Update dashboards in real-time using WebSockets so users see changes immediately. Cache historical data to make dashboard loading fast.

## Plan for device provisioning and updates

Managing one IoT device is easy. Managing hundreds requires systematic provisioning and update processes.

Implement secure device provisioning:

1. Generate unique device credentials during manufacturing
2. Register device in cloud on first connection
3. Provision device-specific configuration and certificates
4. Assign device to user account or location

Plan for over-the-air firmware updates from day one. You will need to fix bugs and add features after deployment. Use staged rollouts to catch problems before updating all devices.

## Monitor device health continuously

IoT reliability depends on detecting and fixing device problems quickly. Track metrics that indicate device health:

- Last successful connection timestamp
- Battery level for battery-powered devices
- Signal strength for wireless devices
- Error rate and retry counts
- Memory and CPU usage
- Sensor reading consistency

Alert administrators when devices go offline unexpectedly or show unusual behavior patterns. Automated health monitoring prevents small issues from becoming system failures.`,
  },
  {
    authorEmail: "sofia.martinez@kollabmail.test",
    title: "How to Turn Coursework Projects into Professional Case Studies",
    excerpt: "Transform student projects into portfolio case studies by explaining the problem, solution, your role, process, evidence, outcomes, and lessons learned.",
    coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80",
    tags: ["Portfolios", "Career Advice", "Productivity", "Open Source"],
    viewCount: 924,
    content: `## Frame the project around a problem

Recruiters and hiring managers care more about problems you solved than technologies you used. Start each case study by clearly stating the problem or opportunity your project addressed.

**Effective problem statements:**
- Identify who experiences the problem
- Explain the impact or cost of the current situation
- Quantify the problem when possible
- Describe why existing solutions are inadequate

Instead of "Built a task management app with React," write "Students in project-based courses lack a simple way to track individual responsibilities within team assignments, leading to missed deadlines and unclear accountability."

> Strong portfolios demonstrate problem-solving ability, not just technical skills.

## Explain your specific role and contributions

Team projects are valuable experience, but you need to clarify what you personally contributed. Recruiters can't tell if you wrote all the code or just attended meetings.

Be specific about your responsibilities:

- What features or components did you own?
- What technical decisions did you make and why?
- What challenges did you solve independently?
- How did you collaborate with team members?

If you worked on a team of five and built three of fifteen features, say that clearly. Honesty builds credibility, and ownership of specific components is impressive even in collaborative work.

## Document your process, not just the outcome

How you approached the project matters as much as what you built. Show your thinking process through:

**Process documentation to include:**
- Initial research and competitive analysis
- User research or problem validation
- Design iterations and decisions
- Technical architecture choices
- Testing and quality assurance approach
- Deployment and monitoring setup

Include sketches, wireframes, architecture diagrams, or early prototypes. This demonstrates systematic thinking and professional development practices.

## Provide concrete evidence

Screenshots and descriptions are good. Interactive previews and focused code excerpts are better. Deployed projects that recruiters can interact with are best.

Make it easy for reviewers to verify your work:

- Link to live deployment
- Link to public GitHub repository
- Include architecture diagrams
- Show before/after comparisons
- Embed video demonstrations
- Include code snippets with commentary

If the project involves private code or sensitive data, create a simplified public version that demonstrates your key contributions.

\`\`\`typescript
// Example: Explaining a technical decision with code
// Chose MongoDB for flexible schema during rapid iteration phase

interface UserProfile {
  userId: string;
  // Skills array allows dynamic growth without migrations
  skills: string[];
  // Embedded projects avoid join queries for profile display
  projects: Array<{
    title: string;
    role: string;
    technologies: string[];
  }>;
}
\`\`\`

## Quantify outcomes and impact

Numbers make achievements concrete and memorable. Even rough estimates are more convincing than vague claims.

Track and report metrics like:

- Number of users or test participants
- Performance improvements (load time, response time)
- Code quality metrics (test coverage, bundle size)
- User satisfaction scores
- Adoption or engagement rates
- Time or cost savings

If you don't have production usage data, use development metrics or testing results. "Reduced API response time from 800ms to 120ms" is specific and impressive.

## Share lessons learned honestly

Every project teaches you something, even if it didn't succeed completely. Sharing what you learned shows growth mindset and self-awareness.

**What to reflect on:**
- What would you do differently next time?
- What technical or process mistakes did you make?
- What surprised you during development?
- What skills did this project develop?
- What questions do you still have?

Hiring managers value candidates who learn from experience and can articulate their development. Honest reflection is more impressive than claiming perfection.

## Structure case studies for scanning

Recruiters review many portfolios quickly. Make yours easy to scan by using clear structure:

1. Project title and one-sentence summary
2. Problem statement and context
3. Your role and timeline
4. Key challenges and solutions
5. Technical approach and architecture
6. Results and metrics
7. Lessons learned
8. Links to preview, code, and artifacts

Use headings, bullets, and visual hierarchy. Include enough detail for interested readers to dive deep, but make the core story clear in under three minutes of reading.

## Update projects as you grow

Your portfolio should evolve as you gain experience. Revisit old case studies periodically and update them with:

- Better writing and clearer explanations
- New insights about what you'd do differently
- Connections to concepts you learned later
- Improved visual design and documentation
- Links to subsequent projects that built on these skills

A portfolio is never finished. Regular updates demonstrate continuous learning and professional communication skills.`,
  },
];

const TECHNOLOGY_BLOG_TITLES = TECHNOLOGY_BLOGS.map((b) => b.title);

// ── Validation Helpers ────────────────────────────────────────────────────────

const validateBlogData = (blogs: typeof TECHNOLOGY_BLOGS): void => {
  console.log("\n📋 Validating blog data...");

  if (blogs.length !== 12) {
    throw new Error(`Expected exactly 12 blogs, got ${blogs.length}`);
  }

  const titles = new Set<string>();
  const authorEmails = blogs.map((b) => b.authorEmail);
  const uniqueAuthors = new Set(authorEmails);

  for (const blog of blogs) {
    // Check required fields
    if (!blog.title || !blog.excerpt || !blog.content || !blog.authorEmail) {
      throw new Error(`Blog missing required fields: ${blog.title || "unknown"}`);
    }

    // Check title uniqueness
    if (titles.has(blog.title)) {
      throw new Error(`Duplicate blog title: ${blog.title}`);
    }
    titles.add(blog.title);

    // Check author exists in allowlist
    const author = BLOG_AUTHORS.find((a) => a.email === blog.authorEmail);
    if (!author) {
      throw new Error(`Blog author not in allowlist: ${blog.authorEmail}`);
    }

    // Check content length (concise professional post, minimum 350 words)
    const wordCount = blog.content.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 350) {
      throw new Error(`Blog content too short (${wordCount} words): ${blog.title}`);
    }

    // Check tags
    if (!Array.isArray(blog.tags) || blog.tags.length < 3 || blog.tags.length > 6) {
      throw new Error(`Blog must have 3-6 tags: ${blog.title}`);
    }

    for (const tag of blog.tags) {
      if (!ALLOWED_TAGS.includes(tag)) {
        throw new Error(`Invalid tag "${tag}" in blog: ${blog.title}`);
      }
    }

    // Check for forbidden words in visible content
    const visibleText = `${blog.title} ${blog.excerpt} ${blog.content} ${blog.tags.join(" ")}`;
    for (const word of FORBIDDEN_WORDS) {
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedWord}\\b`, "i");
      if (regex.test(visibleText)) {
        throw new Error(`Forbidden word "${word}" found in blog: ${blog.title}`);
      }
    }

    // Check cover image
    if (!blog.coverImage || !blog.coverImage.startsWith("https://")) {
      throw new Error(`Invalid coverImage URL in blog: ${blog.title}`);
    }

    // Check view count
    if (!blog.viewCount || blog.viewCount < 80 || blog.viewCount > 950) {
      throw new Error(`Invalid viewCount (must be 80-950) in blog: ${blog.title}`);
    }
  }

  console.log(`✅ All ${blogs.length} blogs validated successfully`);
  console.log(`✅ ${uniqueAuthors.size} unique authors`);
  console.log(`✅ All tags are in allowed list`);
  console.log(`✅ No forbidden words detected`);
};

// ── Main Seed Function ────────────────────────────────────────────────────────

const run = async () => {
  const isReset = process.argv.includes("--reset");
  let upsertedCount = 0;
  let matchedCount = 0;
  let modifiedCount = 0;
  let failedCount = 0;
  let resetDeletedCount = 0;

  console.log("\n🌱 Technology Blog Seeding Started");
  console.log("═".repeat(60));
  console.log(`Reset mode: ${isReset ? "ENABLED (will delete and recreate)" : "DISABLED (will skip existing)"}`);

  try {
    // Validate blog data before connecting to database
    validateBlogData(TECHNOLOGY_BLOGS);

    await connectDB();
    console.log("✅ Connected to MongoDB");

    // ── Resolve and validate authors ────────────────────────────────────────

    console.log("\n👥 Validating authors...");
    const resolvedAuthors: Map<string, string> = new Map();

    for (const author of BLOG_AUTHORS) {
      const user = await User.findOne({ email: author.email }).lean();

      if (!user) {
        throw new Error(`Author not found in database: ${author.email}`);
      }

      const dbUserId = user._id.toString();

      // If userId is provided in allowlist, validate it matches
      if (author.userId && author.userId !== dbUserId) {
        throw new Error(
          `Author ID mismatch for ${author.email}: expected ${author.userId}, found ${dbUserId}`
        );
      }

      resolvedAuthors.set(author.email, dbUserId);
      console.log(`  ✓ ${author.name} (${author.email}) → ${dbUserId}`);
    }

    console.log(`✅ All ${resolvedAuthors.size} authors validated`);

    // ── Handle reset if requested ────────────────────────────────────────────

    if (isReset) {
      console.log("\n🗑️  Reset mode: Deleting existing technology blogs...");

      const authorIds = Array.from(resolvedAuthors.values());
      const resetFilter = {
        userId: { $in: authorIds },
        title: { $in: TECHNOLOGY_BLOG_TITLES },
      };

      const deleteResult = await Blog.deleteMany(resetFilter);
      resetDeletedCount = deleteResult.deletedCount || 0;
      console.log(`✅ Deleted ${resetDeletedCount} existing technology blogs`);
    }

    // ── Upsert blogs ──────────────────────────────────────────────────────────

    console.log("\n📝 Upserting technology blogs...");

    for (const blog of TECHNOLOGY_BLOGS) {
      const authorId = resolvedAuthors.get(blog.authorEmail);
      if (!authorId) {
        console.error(`  ❌ SKIP: Author not resolved for ${blog.authorEmail}`);
        failedCount++;
        continue;
      }

      const filter = {
        userId: authorId,
        title: blog.title,
      };

      const update = {
        $set: {
          userId: authorId,
          title: blog.title,
          coverImage: blog.coverImage,
          excerpt: blog.excerpt,
          content: blog.content,
          tags: blog.tags,
          viewCount: blog.viewCount,
        },
      };

      try {
        const result = await Blog.updateOne(filter, update, { upsert: true });

        if (result.upsertedCount) {
          console.log(`  ✓ INSERTED: "${blog.title}" by ${blog.authorEmail}`);
          upsertedCount++;
        } else if (result.matchedCount) {
          matchedCount++;
          if (result.modifiedCount) {
            console.log(`  ↻ UPDATED: "${blog.title}" by ${blog.authorEmail}`);
            modifiedCount++;
          } else {
            console.log(`  ≡ UNCHANGED: "${blog.title}" by ${blog.authorEmail}`);
          }
        }
      } catch (err) {
        console.error(`  ❌ FAILED: "${blog.title}" - ${err}`);
        failedCount++;
      }
    }

    // ── Final Summary ─────────────────────────────────────────────────────────

    console.log("\n" + "═".repeat(60));
    console.log("✅ Technology Blog Seeding Complete");
    console.log("═".repeat(60));
    console.log(`Total intended blogs:    ${TECHNOLOGY_BLOGS.length}`);
    console.log(`Newly inserted:          ${upsertedCount}`);
    console.log(`Already existed:         ${matchedCount}`);
    console.log(`  └─ Modified:           ${modifiedCount}`);
    console.log(`  └─ Unchanged:          ${matchedCount - modifiedCount}`);
    console.log(`Failed:                  ${failedCount}`);
    if (isReset) {
      console.log(`Reset deleted:           ${resetDeletedCount}`);
    }
    console.log("═".repeat(60));
  } catch (err) {
    console.error("\n❌ Technology blog seeding failed:");
    console.error(err);
    throw err;
  }
};

// ── Execute with exit code handling ───────────────────────────────────────────

let exitCode = 0;

run()
  .catch((err) => {
    console.error("\n❌ Fatal error during technology blog seeding");
    console.error(err);
    exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
    process.exit(exitCode);
  });
