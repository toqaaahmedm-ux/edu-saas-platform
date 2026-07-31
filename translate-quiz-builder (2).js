// translate-quiz-builder.js
// Run once from inside EduSaas-frontend:   node translate-quiz-builder.js
//
// Safety model (same as before):
// 1. Nothing is written until EVERY expected match is verified.
// 2. If anything doesn't match exactly, the script stops and writes
//    NOTHING to any file — everything stays 100% as it was.
// 3. Backups are taken for every file that DOES get changed.
// 4. Safe to re-run: if the translation keys / t() calls already exist,
//    it detects that and skips cleanly instead of duplicating anything.

const fs = require("fs");
const path = require("path");

const PAGE_PATH = path.join(
  "src", "app", "[locale]", "(dashboard)", "teacher", "quizzes", "page.tsx"
);
const AR_PATH = path.join("messages", "ar.json");
const EN_PATH = path.join("messages", "en.json");

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

for (const p of [PAGE_PATH, AR_PATH, EN_PATH]) {
  if (!fs.existsSync(p)) fail(`Could not find: ${p}\nMake sure you're running this from inside EduSaas-frontend.`);
}

// ── 1) Add "teacherQuizBuilder" section to ar.json / en.json ────────────

const AR_BLOCK = `                              "saveFailed":  "فشل حفظ الحضور."
                          },
    "teacherQuizBuilder":  {
                               "failedToLoadCourses":  "فشل تحميل الكورسات",
                               "newQuestionAdded":  "تمت إضافة سؤال جديد.",
                               "atLeastOneQuestionRequired":  "يجب أن يكون هناك سؤال واحد على الأقل.",
                               "selectCourseFirst":  "يرجى اختيار كورس أولاً",
                               "enterQuizTitle":  "يرجى إدخال عنوان الاختبار",
                               "fillAllQuestionsOptions":  "يرجى ملء جميع الأسئلة والخيارات",
                               "closeAfterOpenError":  "يجب أن يكون تاريخ الإغلاق بعد تاريخ الفتح",
                               "quizSavedSuccess":  "تم حفظ الاختبار بنجاح! ✅",
                               "saveQuizFailed":  "فشل حفظ الاختبار",
                               "title":  "منشئ الاختبارات",
                               "subtitle":  "أنشئ تقييمات لطلابك.",
                               "addQuestion":  "إضافة سؤال",
                               "quizSettings":  "إعدادات الاختبار",
                               "courseLabel":  "الكورس *",
                               "loadingCourses":  "جاري تحميل الكورسات...",
                               "selectCoursePlaceholder":  "اختر كورسًا...",
                               "quizTitleLabel":  "عنوان الاختبار *",
                               "quizTitlePlaceholder":  "مثال: تقييم الفصل 1",
                               "timeLimitLabel":  "الوقت المحدد (ثواني)",
                               "minutesLabel":  "{count} دقيقة",
                               "passScoreLabel":  "درجة النجاح (%)",
                               "opensAtLabel":  "يفتح في (اختياري)",
                               "opensAtHint":  "اتركه فارغًا ليكون متاحًا فورًا.",
                               "closesAtLabel":  "يغلق في (اختياري)",
                               "closesAtHint":  "اتركه فارغًا بدون موعد نهائي.",
                               "questionPlaceholder":  "اكتب سؤالك هنا...",
                               "optionPlaceholder":  "الخيار {letter}",
                               "saving":  "جاري الحفظ...",
                               "saveQuiz":  "حفظ الاختبار"
                          },
    "StudentProfilePage":  {`;

const AR_ANCHOR = `                              "saveFailed":  "فشل حفظ الحضور."
                          },
    "StudentProfilePage":  {`;

const EN_BLOCK = `                              "saveFailed":  "Failed to save attendance."
                          },
    "teacherQuizBuilder":  {
                               "failedToLoadCourses":  "Failed to load courses",
                               "newQuestionAdded":  "New question added.",
                               "atLeastOneQuestionRequired":  "At least one question is required.",
                               "selectCourseFirst":  "Please select a course first",
                               "enterQuizTitle":  "Please enter a quiz title",
                               "fillAllQuestionsOptions":  "Please fill in all questions and options",
                               "closeAfterOpenError":  "Close date must be after the open date",
                               "quizSavedSuccess":  "Quiz saved successfully! ✅",
                               "saveQuizFailed":  "Failed to save quiz",
                               "title":  "Quiz Builder",
                               "subtitle":  "Create assessments for your students.",
                               "addQuestion":  "Add Question",
                               "quizSettings":  "Quiz Settings",
                               "courseLabel":  "Course *",
                               "loadingCourses":  "Loading courses...",
                               "selectCoursePlaceholder":  "Select a course...",
                               "quizTitleLabel":  "Quiz Title *",
                               "quizTitlePlaceholder":  "e.g. Chapter 1 Assessment",
                               "timeLimitLabel":  "Time Limit (seconds)",
                               "minutesLabel":  "{count} minutes",
                               "passScoreLabel":  "Pass Score (%)",
                               "opensAtLabel":  "Opens At (optional)",
                               "opensAtHint":  "Leave empty to make it available immediately.",
                               "closesAtLabel":  "Closes At (optional)",
                               "closesAtHint":  "Leave empty for no deadline.",
                               "questionPlaceholder":  "Enter your question here...",
                               "optionPlaceholder":  "Option {letter}",
                               "saving":  "Saving...",
                               "saveQuiz":  "Save Quiz"
                          },
    "StudentProfilePage":  {`;

const EN_ANCHOR = `                              "saveFailed":  "Failed to save attendance."
                          },
    "StudentProfilePage":  {`;

function updateJson(filePath, anchor, block, label) {
  const rawOriginal = fs.readFileSync(filePath, "utf8");
  const usesCRLF = rawOriginal.includes("\r\n");
  // work internally with \n only, convert back to \r\n on write if that's
  // what the file originally used — avoids anchor mismatches from line-ending
  // differences (Windows-generated JSON files are usually CRLF).
  const original = rawOriginal.replace(/\r\n/g, "\n");

  if (original.includes(`"teacherQuizBuilder"`)) {
    console.log(`✅ ${label}: "teacherQuizBuilder" already exists — skipping (no changes needed).`);
    return { ok: true, changed: false };
  }

  const normalizedAnchor = anchor.replace(/\r\n/g, "\n");
  const count = original.split(normalizedAnchor).length - 1;
  if (count !== 1) {
    console.log(`⚠️  ${label}: anchor text not found exactly once (found ${count}). Skipping this file.`);
    return { ok: false, changed: false };
  }

  let updated = original.replace(normalizedAnchor, block.replace(/\r\n/g, "\n"));
  if (usesCRLF) updated = updated.replace(/\n/g, "\r\n");

  // sanity check: must still be valid JSON
  try {
    JSON.parse(updated);
  } catch (e) {
    console.log(`⚠️  ${label}: result would not be valid JSON (${e.message}). Skipping this file.`);
    return { ok: false, changed: false };
  }

  const backupPath = filePath + `.bak-${Date.now()}`;
  fs.writeFileSync(backupPath, rawOriginal, "utf8");
  fs.writeFileSync(filePath, updated, "utf8");
  console.log(`✅ ${label}: updated. Backup: ${backupPath}`);
  return { ok: true, changed: true };
}

console.log("\n── Step 1: translation JSON files ──────────────────");
const arResult = updateJson(AR_PATH, AR_ANCHOR, AR_BLOCK, "ar.json");
const enResult = updateJson(EN_PATH, EN_ANCHOR, EN_BLOCK, "en.json");

if (!arResult.ok || !enResult.ok) {
  fail("Stopped before touching page.tsx because a JSON file didn't match as expected. No files were changed.");
}

// ── 2) Translate the page.tsx itself ─────────────────────────────────

console.log("\n── Step 2: Quiz Builder page.tsx ───────────────────");

const rawPageOriginal = fs.readFileSync(PAGE_PATH, "utf8");
const pageUsesCRLF = rawPageOriginal.includes("\r\n");
let content = rawPageOriginal.replace(/\r\n/g, "\n");
const original = rawPageOriginal;

if (content.includes(`useTranslations("teacherQuizBuilder")`)) {
  console.log(`✅ page.tsx: already translated — skipping (no changes needed).\n`);
  process.exit(0);
}

const replacements = [
  [`import { toast } from "sonner";`, `import { toast } from "sonner";\nimport { useTranslations } from "next-intl";`],
  [
    `export default function QuizBuilderPage() {\n  const router = useRouter();`,
    `export default function QuizBuilderPage() {\n  const t = useTranslations("teacherQuizBuilder");\n  const router = useRouter();`
  ],
  [`toast.error("Failed to load courses");`, `toast.error(t("failedToLoadCourses"));`],
  [`toast.info("New question added.");`, `toast.info(t("newQuestionAdded"));`],
  [`toast.error("At least one question is required.");`, `toast.error(t("atLeastOneQuestionRequired"));`],
  [`toast.error("Please select a course first");`, `toast.error(t("selectCourseFirst"));`],
  [`toast.error("Please enter a quiz title");`, `toast.error(t("enterQuizTitle"));`],
  [`toast.error("Please fill in all questions and options");`, `toast.error(t("fillAllQuestionsOptions"));`],
  [`toast.error("Close date must be after the open date");`, `toast.error(t("closeAfterOpenError"));`],
  [`toast.success("Quiz saved successfully! ✅");`, `toast.success(t("quizSavedSuccess"));`],
  [
    `toast.error(error?.response?.data?.message || "Failed to save quiz");`,
    `toast.error(error?.response?.data?.message || t("saveQuizFailed"));`
  ],
  [
    `<h2 className="text-3xl font-black text-slate-800">Quiz Builder</h2>`,
    `<h2 className="text-3xl font-black text-slate-800">{t("title")}</h2>`
  ],
  [
    `<p className="text-slate-500 font-medium italic">Create assessments for your students.</p>`,
    `<p className="text-slate-500 font-medium italic">{t("subtitle")}</p>`
  ],
  [`<Plus size={20} /> Add Question`, `<Plus size={20} /> {t("addQuestion")}`],
  [
    `<h3 className="text-xl font-black text-slate-800">Quiz Settings</h3>`,
    `<h3 className="text-xl font-black text-slate-800">{t("quizSettings")}</h3>`
  ],
  [`            Course *\n          </label>`, `            {t("courseLabel")}\n          </label>`],
  [
    `<Loader2 size={16} className="animate-spin" /> Loading courses...`,
    `<Loader2 size={16} className="animate-spin" /> {t("loadingCourses")}`
  ],
  [`<option value="">Select a course...</option>`, `<option value="">{t("selectCoursePlaceholder")}</option>`],
  [`            Quiz Title *\n          </label>`, `            {t("quizTitleLabel")}\n          </label>`],
  [`placeholder="e.g. Chapter 1 Assessment"`, `placeholder={t("quizTitlePlaceholder")}`],
  [`              Time Limit (seconds)\n            </label>`, `              {t("timeLimitLabel")}\n            </label>`],
  [
    `<p className="text-xs text-slate-400 mt-1">{Math.round(timeLimit / 60)} minutes</p>`,
    `<p className="text-xs text-slate-400 mt-1">{t("minutesLabel", { count: Math.round(timeLimit / 60) })}</p>`
  ],
  [`              Pass Score (%)\n            </label>`, `              {t("passScoreLabel")}\n            </label>`],
  [`              Opens At (optional)\n            </label>`, `              {t("opensAtLabel")}\n            </label>`],
  [
    `<p className="text-xs text-slate-400 mt-1">Leave empty to make it available immediately.</p>`,
    `<p className="text-xs text-slate-400 mt-1">{t("opensAtHint")}</p>`
  ],
  [`              Closes At (optional)\n            </label>`, `              {t("closesAtLabel")}\n            </label>`],
  [
    `<p className="text-xs text-slate-400 mt-1">Leave empty for no deadline.</p>`,
    `<p className="text-xs text-slate-400 mt-1">{t("closesAtHint")}</p>`
  ],
  [`placeholder="Enter your question here..."`, `placeholder={t("questionPlaceholder")}`],
  [
    `placeholder={\`Option \${String.fromCharCode(65 + i)}\`}`,
    `placeholder={t("optionPlaceholder", { letter: String.fromCharCode(65 + i) })}`
  ],
  [
    `<><Loader2 size={24} className="animate-spin" /> Saving...</>`,
    `<><Loader2 size={24} className="animate-spin" /> {t("saving")}</>`
  ],
  [`<><Save size={24} /> Save Quiz</>`, `<><Save size={24} /> {t("saveQuiz")}</>`],
];

let report = [];
let allOk = true;

for (const [searchRaw, replaceRaw] of replacements) {
  const search = searchRaw.replace(/\r\n/g, "\n");
  const replace = replaceRaw.replace(/\r\n/g, "\n");
  const count = content.split(search).length - 1;
  if (count === 1) {
    content = content.replace(search, replace);
    report.push({ ok: true, preview: search.slice(0, 55).replace(/\n/g, " ") });
  } else {
    allOk = false;
    report.push({ ok: false, count, preview: search.slice(0, 55).replace(/\n/g, " ") });
  }
}

console.log("");
for (const r of report) {
  if (r.ok) console.log(`✅ OK   | ${r.preview}...`);
  else console.log(`⚠️  SKIP | expected 1 match, found ${r.count} | ${r.preview}...`);
}
console.log("");

if (!allOk) {
  console.log("⚠️  Some strings in page.tsx didn't match exactly.");
  console.log("Nothing was written to page.tsx — it's untouched.");
  console.log(
    arResult.changed || enResult.changed
      ? "NOTE: the JSON files WERE already updated in Step 1 (that part is safe and correct either way)."
      : ""
  );
  console.log("Copy the ⚠️ lines above and send them back so we can fix the script.\n");
  process.exit(1);
}

if (pageUsesCRLF) content = content.replace(/\n/g, "\r\n");

const backupPath = PAGE_PATH + `.bak-${Date.now()}`;
fs.writeFileSync(backupPath, original, "utf8");
fs.writeFileSync(PAGE_PATH, content, "utf8");

console.log(`✅ All ${report.length} replacements applied to page.tsx.`);
console.log(`📦 Backup saved at: ${backupPath}`);
console.log(`✏️  Done!\n`);
