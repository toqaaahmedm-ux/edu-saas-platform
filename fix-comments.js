#!/usr/bin/env node
/**
 * fix-comments.js
 *
 * Replaces the Arabic / mojibake comments flagged by scan-arabic-comments.js
 * with natural, human-sounding English comments — line by line, using the
 * exact line numbers from the report. Original indentation is preserved.
 *
 * Usage (run from your project root, e.g. EduSaas-frontend):
 *   node fix-comments.js --dry-run     -> preview changes, no files touched
 *   node fix-comments.js               -> actually applies the changes
 *
 * IMPORTANT: commit or stash your current work first, so you can review
 * the diff afterwards with `git diff` and revert easily if something looks off.
 */

const fs = require("fs");
const path = require("path");

const DRY_RUN = process.argv.includes("--dry-run");

// file path -> { lineNumber: "new comment content (without leading indentation)" }
const MAP = {
  "src/app/api/auth/login/route.ts": {
    67: `// BE-H04 FIX: read tokens from the set-cookie headers instead of the body`,
    68: `// because the backend doesn't send them in the body at all`,
  },
  "src/app/api/certificates-route.ts": {
    13: `// GET — fetch the student's certificates`,
    33: `// POST — save a new certificate`,
  },
  "src/app/api/courses/[id]/route.ts": {
    13: `// GET — fetch a course by ID (Public)`,
    30: `// PUT — update a course (TEACHER or ADMIN)`,
    55: `// PATCH — change status (ADMIN only)`,
    80: `// DELETE — delete a course (ADMIN only)`,
  },
  "src/app/api/quizzes/route.ts": {
    5: `// BL-01: check auth before returning the questions`,
    13: `// BL-01: proxy to NestJS instead of static mockData`,
  },
  "src/app/not-found.tsx": {
    1: `// [Report 1 - page 4]: fixed TC-06 — 404 page now reflects the platform's identity`,
  },
  "src/app/[locale]/(dashboard)/admin/error.tsx": {
    5: `// [Report 1 - page 4]: fixed TC-05 — handle errors professionally instead of letting the site crash`,
    14: `// log the error to the console for debugging (Inspect)`,
  },
  "src/app/[locale]/(dashboard)/admin/loading.tsx": {
    1: `// [Report 1 - page 4]: fixed TC-04 — professional loading page instead of a blank white screen`,
  },
  "src/app/[locale]/(dashboard)/admin/page.tsx": {
    52: `// H-02: archive first since the backend doesn't allow deleting a published course`,
  },
  "src/app/[locale]/(dashboard)/settings/page.tsx": {
    7: `// import the store`,
    8: `// import the toast`,
    12: `// get the current user's data`,
    14: `// set default values based on the logged-in user (Dynamic Fix)`,
    19: `// example, can be persisted later`,
    23: `// update the form if the user's data changes`,
    35: `// simulate the save operation (success feedback)`,
    95: `/* Form fields — now connected to the store */`,
  },
  "src/app/[locale]/(dashboard)/teacher/courses/new/page.tsx": {
    56: `// FE-C01: use videoData.url instead of the whole object`,
  },
  "src/app/[locale]/(dashboard)/teacher/error.tsx": {
    5: `// [Report 1 - page 4]: fixed TC-05 — handle errors professionally instead of letting the site crash`,
    14: `// log the error to the console for debugging (Inspect)`,
  },
  "src/app/[locale]/(dashboard)/teacher/loading.tsx": {
    1: `// [Report 1 - page 4]: fixed TC-04 — professional loading page instead of a blank white screen`,
  },
  "src/app/[locale]/(dashboard)/teacher/page.tsx": {
    7: `// call the new hook`,
    15: `// fetch stats and courses dynamically`,
    61: `/* Content management table — wired up to the API */`,
  },
  "src/app/[locale]/(student)/error.tsx": {
    5: `// [Report 1 - page 4]: fixed TC-05 — handle errors professionally instead of letting the site crash`,
    14: `// log the error to the console for debugging (Inspect)`,
  },
  "src/app/[locale]/(student)/layout.tsx": {
    12: `/*`,
    13: `The sidebar is rendered directly here since we already set`,
    14: `up the aside styling and fixed width for it in the previous step`,
    15: `*/}`,
    27: `/* Really like this animation as a technique — it gives a more professional feel when navigating */`,
  },
  "src/app/[locale]/(student)/loading.tsx": {
    1: `// [Report 1 - page 4]: fixed TC-04 — professional loading page instead of a blank white screen`,
  },
  "src/app/[locale]/(student)/student/certificates/page.tsx": {
    14: `// PDF-NEW: track which certificate is currently downloading (so we can disable its button`,
    15: `// only, not all of them), and any error that happened during download.`,
    21: `// fetch certificates from the API`,
    30: `// PDF-NEW: download a real PDF certificate generated server-side via Puppeteer,`,
    31: `// instead of relying on window.print() in the browser.`,
    100: `/* Real data from the DB */`,
  },
  "src/app/[locale]/(student)/student/quizzes/page.tsx": {
    26: `// QUIZ-WINDOW-NEW: computes a simple, readable diff like "in 2d 4h" or "in 45m"`,
    49: `// QUIZ-WINDOW-NEW: "ticks" every minute so the countdown updates on its own without`,
    50: `// the student needing to refresh the page.`,
    89: `// QUIZ-WINDOW-NEW: returns the right badge text and icon, or null if the quiz`,
    90: `// is just open as normal (same as before, no extra badge)`,
    168: `// QUIZ-WINDOW-NEW: quizzes without availability data (if we cleared the old`,
    169: `// cache or something went wrong) are treated as "open", same as the original behavior.`,
  },
  "src/app/[locale]/page.tsx": {
    1: `// [Report 1 - page 5]: updated the homepage to a proper SaaS interface (Premium UI & Logic Fix - BIZ-05)`,
    8: `// [Fix]: need to await the cookies to read them correctly (Next.js standard)`,
    12: `// [Fix]: if the user is already logged in, send them straight to where they belong (redirect logic)`,
    28: `/* Ain Shams University badge — official, clean, and neat */`,
    36: `/* Main heading (typography excellence) */`,
    49: `/* Action buttons (SaaS style) */`,
    66: `/* [Report 2]: added micro-interactions to make the platform feel more alive (Premium UX Fix) */`,
  },
  "src/components/shared/FormInput.tsx": {
    10: `// this is the type React Hook Form expects`,
  },
  "src/components/student/Certificate.tsx": {
    9: `// BUG-20/NEW-13: use props instead of hardcoded strings`,
    25: `// CERT-REG-01: propName takes priority`,
    57: `/* BUG-20: institutionName and facultyName come from props */`,
    85: `/* BUG-20: examName comes from props */`,
  },
  "src/components/student/QuizTimer.tsx": {
    12: `// tick the counter every second`,
    20: `// format the time (00:00)`,
    27: `// pick the color: red if under 5 minutes (300 seconds)`,
  },
  "src/data/quizzes.data.ts": {
    1: `// [Report 1 - page 1]: unified the IDs to get rid of the mismatch issue (Fix NEW-03)`,
    2: `// questions start with pharma-1, and the answers have to match it exactly`,
  },
  "src/hooks/useTeacherCourses.ts": {
    4: `// Hook to fetch the teacher's courses dynamically`,
  },
  "src/hooks/useTeacherStats.ts": {
    4: `// Hook to fetch the teacher's live stats from the server`,
  },
  "src/lib/api/auth.api.ts": {
    6: `// calling the Next.js API here, not NestJS directly`,
    7: `// so the cookies get set correctly from the server`,
    21: `// HIGH-15 FIX: before this, register was only sending name/email/password,`,
    22: `// and the role the user picked from the dropdown (student/teacher) was being ignored`,
    23: `// completely — every new user was registered with a default role from the backend`,
    24: `// regardless of what they chose. Now we add the role to the request body.`,
  },
  "src/lib/api/client.ts": {
    63: `// FE-M01: interceptor adds x-tenant-id dynamically to every request`,
    84: `// localStorage might not be available in some environments`,
  },
  "src/lib/api/courses.api.ts": {
    11: `// LESSON-PROGRESS-NEW: last stop point in seconds, 0 if no progress saved`,
    49: `// LESSON-PROGRESS-NEW: saves the last stop point in the video (in seconds) so`,
    50: `// the student can resume from there next time. The frontend handles the debounce, it's`,
    51: `// not called immediately on every timeupdate event.`,
  },
  "src/lib/api/quizzes.api.ts": {
    26: `// QUIZ-WINDOW-NEW: optional, sent as an ISO string if the teacher set them`,
  },
  "src/lib/validators/auth.schema.ts": {
    15: `// FE-C02 + H-04: removed ADMIN — a user can't register as admin`,
  },
  "src/middleware/withRole.ts": {
    1: `// [Report 1 - page 4]: role protection module (modular middleware)`,
  },
  "src/providers/QueryProvider.tsx": {
    10: `// H-01: one minute instead of 0`,
    11: `// H-01: one retry instead of 3`,
    12: `// H-01: doesn't refetch when the tab regains focus`,
  },
  "src/services/courses.service.ts": {
    7: `// FE-C03: changed from "courses" to "teacher-courses"`,
    8: `// FE-C03: new key for admin`,
    13: `// fetch the teacher's courses`,
    26: `// FE-C03: new hook for admin that fetches all courses`,
    39: `// fetch public courses for the student`,
    59: `// fetch a single course by ID`,
    71: `// create a new course`,
    83: `// delete a course`,
    90: `// invalidate both`,
    95: `// update a course`,
    103: `// invalidate both`,
  },
  "src/services/enrollments.service.ts": {
    9: `// FIXBUG-07: calling NestJS directly instead of the local Next.js API`,
    25: `// FIXBUG-07: calling NestJS directly instead of the local Next.js API`,
  },
  "src/services/notifications.service.ts": {
    15: `// ── unread notifications count ──`,
    30: `// ── fetch all notifications ──`,
    45: `// ── mark a notification as read ──`,
    60: `// ── mark all notifications as read ──`,
  },
  "src/types/index.ts": {
    1: `// FE-M05: added SUPER_ADMIN to the Role type to match the backend and useAuthStore`,
    4: `// user data contract, so the whole project stays consistent (Fix TC-04)`,
    14: `// fixed the price field here, kept it as Number always for calculations (Fix Audit Note)`,
    38: `// question definition — removed the correct answer from it so it's not exposed to the student (Security Fix)`,
    39: `// CRIT-08 FIX: the field used to be called question, but the backend actually returns text —`,
    40: `// the template on the quiz page uses currentQ.text, so the type here was wrong`,
    41: `// and wasn't catching the error at compile time. Updated it to match the real`,
    42: `// shape of the data coming from the backend.`,
    49: `// added Quiz so it has a clear shape in the store`,
    54: `// in seconds`,
    55: `// useful for the results page so it knows to send the courseId`,
  },
};

let filesChanged = 0;
let linesChanged = 0;
let linesSkipped = 0;

for (const [relPath, lineMap] of Object.entries(MAP)) {
  const fullPath = path.join(process.cwd(), relPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  SKIP (file not found): ${relPath}`);
    continue;
  }

  const original = fs.readFileSync(fullPath, "utf8");
  const usesCRLF = original.includes("\r\n");
  const lines = original.split(/\r\n|\n/);

  let fileTouched = false;

  for (const [lineNoStr, newContent] of Object.entries(lineMap)) {
    const idx = parseInt(lineNoStr, 10) - 1; // 0-indexed

    if (idx < 0 || idx >= lines.length) {
      console.log(`⚠️  SKIP ${relPath}:${lineNoStr} — line number out of range (file may have changed)`);
      linesSkipped++;
      continue;
    }

    const originalLine = lines[idx];
    const trimmed = originalLine.trim();

    if (trimmed.length === 0) {
      console.log(`⚠️  SKIP ${relPath}:${lineNoStr} — line is empty now (file may have changed), left untouched`);
      linesSkipped++;
      continue;
    }

    const leadingWhitespace = originalLine.match(/^\s*/)[0];
    const newLine = leadingWhitespace + newContent;

    if (newLine === originalLine) {
      continue; // already correct, nothing to do
    }

    if (DRY_RUN) {
      console.log(`\n--- ${relPath}:${lineNoStr} ---`);
      console.log(`- ${originalLine}`);
      console.log(`+ ${newLine}`);
    }

    lines[idx] = newLine;
    fileTouched = true;
    linesChanged++;
  }

  if (fileTouched && !DRY_RUN) {
    const eol = usesCRLF ? "\r\n" : "\n";
    fs.writeFileSync(fullPath, lines.join(eol), "utf8");
    filesChanged++;
  } else if (fileTouched) {
    filesChanged++;
  }
}

console.log("\n──────────────────────────────────────────");
if (DRY_RUN) {
  console.log(`DRY RUN — nothing was written to disk.`);
  console.log(`Would change ${linesChanged} line(s) across ${filesChanged} file(s).`);
  console.log(`Skipped ${linesSkipped} line(s) — review the warnings above.`);
  console.log(`\nRun again without --dry-run to apply the changes.`);
} else {
  console.log(`Done. Changed ${linesChanged} line(s) across ${filesChanged} file(s).`);
  console.log(`Skipped ${linesSkipped} line(s) — review the warnings above.`);
  console.log(`\nRun "git diff" to review, then commit if it looks good.`);
}
