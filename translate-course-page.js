// translate-course-page.js
// Run this once from inside EduSaas-frontend:  node translate-course-page.js
//
// What it does:
// 1. Makes a timestamped backup of the target file before touching anything.
// 2. Applies a list of EXACT text replacements (adds useTranslations +
//    swaps hardcoded English strings for t("key") calls under the
//    "studentCoursePlayer" namespace that already exists in ar.json/en.json).
// 3. Every replacement is verified by count BEFORE writing anything to disk.
//    If even one expected string is missing (meaning your file differs from
//    what we expect), the script stops and writes NOTHING — your file stays
//    100% untouched, and it just prints which ones didn't match so you can
//    tell me instead of risking broken code.

const fs = require("fs");
const path = require("path");

const TARGET = path.join(
  "src", "app", "[locale]", "(student)", "student", "courses", "[courseId]", "page.tsx"
);

if (!fs.existsSync(TARGET)) {
  console.error(`\n❌ Could not find file at: ${TARGET}`);
  console.error("Make sure you're running this command from inside the EduSaas-frontend folder.\n");
  process.exit(1);
}

let content = fs.readFileSync(TARGET, "utf8");
const original = content;

// [ exact search string, exact replacement string ]
const replacements = [
  // ── imports ──────────────────────────────────────────────────────────
  [
    `import { toast } from "sonner";`,
    `import { toast } from "sonner";\nimport { useTranslations } from "next-intl";`
  ],

  // ── CelebrationModal: add t() hook ──────────────────────────────────
  [
    `function CelebrationModal({ courseTitle, onClose }: { courseTitle: string; onClose: () => void }) {\n  return (`,
    `function CelebrationModal({ courseTitle, onClose }: { courseTitle: string; onClose: () => void }) {\n  const t = useTranslations("studentCoursePlayer");\n  return (`
  ],
  [`aria-label="Close"`, `aria-label={t("closeAria")}`],
  [
    `        <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-3">\n          Course Completed! 🎉\n        </h2>`,
    `        <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-3">\n          {t("courseCompletedTitle")}\n        </h2>`
  ],
  [
    `        <p className="text-slate-500 font-medium mb-8 leading-relaxed">\n          You've finished every lesson in <span className="font-black text-slate-700">{courseTitle}</span>.\n          Your certificate is on its way — nice work!\n        </p>`,
    `        <p className="text-slate-500 font-medium mb-8 leading-relaxed">\n          {t("courseCompletedBody", { courseTitle })}\n        </p>`
  ],
  [`<Award size={20} /> View Certificates`, `<Award size={20} /> {t("viewCertificates")}`],
  [
    `          >\n            Keep Browsing\n          </button>`,
    `          >\n            {t("keepBrowsing")}\n          </button>`
  ],

  // ── CourseRatingCard: add t() hook ──────────────────────────────────
  [
    `function CourseRatingCard({ courseId }: { courseId: string }) {\n  const [value, setValue] = useState(0);`,
    `function CourseRatingCard({ courseId }: { courseId: string }) {\n  const t = useTranslations("studentCoursePlayer");\n  const [value, setValue] = useState(0);`
  ],
  [`toast.error("Pick a star rating before submitting");`, `toast.error(t("pickStarRating"));`],
  [`toast.success("Thanks for rating this course! ⭐");`, `toast.success(t("ratingThanks"));`],
  [
    `toast.error(err?.response?.data?.message || "Couldn't submit your rating");`,
    `toast.error(err?.response?.data?.message || t("ratingSubmitFailed"));`
  ],
  [
    `<h3 className="text-lg font-black text-slate-800">Rate this course</h3>`,
    `<h3 className="text-lg font-black text-slate-800">{t("rateThisCourse")}</h3>`
  ],
  [
    `aria-label={\`Rate \${star} star\${star > 1 ? "s" : ""}\`}`,
    `aria-label={t("rateStars", { star })}`
  ],
  [
    `placeholder="Optional: share your thoughts about this course..."`,
    `placeholder={t("ratingPlaceholder")}`
  ],
  [
    `{hasRated ? "Update Rating" : "Submit Rating"}`,
    `{hasRated ? t("updateRating") : t("submitRating")}`
  ],

  // ── CourseContentPage: add t() hook ─────────────────────────────────
  [
    `export default function CourseContentPage() {\n  const params = useParams();`,
    `export default function CourseContentPage() {\n  const t = useTranslations("studentCoursePlayer");\n  const params = useParams();`
  ],
  [`setLoadError("Course data was empty.");`, `setLoadError(t("courseDataEmpty"));`],
  [
    `        err?.response?.status === 404\n          ? "This course could not be found."\n          : "We couldn't load this course right now. Please try again."`,
    `        err?.response?.status === 404\n          ? t("courseNotFoundError")\n          : t("loadCourseError")`
  ],
  [`toast.success("Lesson marked as completed! Keep going 🚀");`, `toast.success(t("lessonCompletedToast"));`],
  [`toast.error("Couldn't save your progress. Please try again.");`, `toast.error(t("saveProgressFailed"));`],
  [
    `<p className="font-bold text-red-500">{loadError || "Course not found."}</p>`,
    `<p className="font-bold text-red-500">{loadError || t("courseNotFound")}</p>`
  ],
  [
    `          Go Back\n        </button>`,
    `          {t("goBack")}\n        </button>`
  ],
  [
    `                  <p className="font-bold text-lg">No video available for this lesson</p>`,
    `                  <p className="font-bold text-lg">{t("noVideoAvailable")}</p>`
  ],
  [
    `(course.instructor as any)?.name || "Unknown instructor";`,
    `(course.instructor as any)?.name || t("unknownInstructor");`
  ],
  [
    `Instructor: <span className="text-blue-600 font-black">{instructorName}</span>`,
    `{t("instructorLabel")}: <span className="text-blue-600 font-black">{instructorName}</span>`
  ],
  [
    `<span className="text-xs font-black text-slate-400">{progress}% Complete</span>`,
    `<span className="text-xs font-black text-slate-400">{t("percentComplete", { progress })}</span>`
  ],
  [`<ChevronLeft size={20} /> Back to Library`, `<ChevronLeft size={20} /> {t("backToLibrary")}`],
  [
    `          <p className="text-slate-400 font-bold">No lessons published for this course yet.</p>`,
    `          <p className="text-slate-400 font-bold">{t("noLessonsYet")}</p>`
  ],
  [`<MessageCircle size={20} /> Discussion`, `<MessageCircle size={20} /> {t("discussion")}`],
  [`<FileText size={20} /> Resources`, `<FileText size={20} /> {t("resources")}`],
  [`<CheckCircle2 size={20} /> Take Quiz`, `<CheckCircle2 size={20} /> {t("takeQuiz")}`],
  [
    `{currentLesson?.isCompleted ? "COMPLETED ✓" : isCompleting ? "SAVING..." : "MARK AS DONE"}`,
    `{currentLesson?.isCompleted ? t("completedBadge") : isCompleting ? t("saving") : t("markAsDone")}`
  ],
  [
    `              Curriculum\n              <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">`,
    `              {t("curriculum")}\n              <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">`
  ],
  [
    `{isActive ? "Currently Playing" : isDone ? "Completed" : "Not started"}`,
    `{isActive ? t("currentlyPlaying") : isDone ? t("completedStatus") : t("notStarted")}`
  ],
];

// "Coming Soon" appears twice (Discussion tooltip + Resources tooltip) —
// handle both occurrences with a global-safe counted replace.
const comingSoonSearch = `                    Coming Soon`;
const comingSoonReplace = `                    {t("comingSoon")}`;
const comingSoonCount = content.split(comingSoonSearch).length - 1;

let report = [];
let allOk = true;

for (const [search, replace] of replacements) {
  const count = content.split(search).length - 1;
  if (count === 1) {
    content = content.replace(search, replace);
    report.push({ ok: true, preview: search.slice(0, 50).replace(/\n/g, " ") });
  } else {
    allOk = false;
    report.push({ ok: false, count, preview: search.slice(0, 50).replace(/\n/g, " ") });
  }
}

if (comingSoonCount === 2) {
  content = content.split(comingSoonSearch).join(comingSoonReplace);
  report.push({ ok: true, preview: `"Coming Soon" (x2)` });
} else {
  allOk = false;
  report.push({ ok: false, count: comingSoonCount, preview: `"Coming Soon" (x2)` });
}

console.log("\n──────────────────────────────────────────");
console.log("Translation codemod report:");
console.log("──────────────────────────────────────────");
for (const r of report) {
  if (r.ok) {
    console.log(`✅ OK   | ${r.preview}...`);
  } else {
    console.log(`⚠️  SKIP | expected 1 match, found ${r.count} | ${r.preview}...`);
  }
}
console.log("──────────────────────────────────────────\n");

if (!allOk) {
  console.log("⚠️  Some strings didn't match exactly (your file may have small differences).");
  console.log("Nothing was written to disk — your file is untouched.");
  console.log("Copy the ⚠️ lines above and send them back so we can fix the script.\n");
  process.exit(1);
}

const backupPath = TARGET + `.bak-${Date.now()}`;
fs.writeFileSync(backupPath, original, "utf8");
fs.writeFileSync(TARGET, content, "utf8");

console.log(`✅ All ${report.length} replacements applied successfully.`);
console.log(`📦 Backup saved at: ${backupPath}`);
console.log(`✏️  File updated: ${TARGET}\n`);
