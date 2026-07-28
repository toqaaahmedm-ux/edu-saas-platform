"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { academicYears, semesters, gradeLevels, classSections } from "@/services/academic.service";
import { useTranslations } from "next-intl";

type Tab = "years" | "semesters" | "grades" | "sections";

export default function AcademicStructurePage() {
  const [tab, setTab] = useState<Tab>("years");
  const t = useTranslations("academicStructure");

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-2">{t("pageTitle")}</h1>
      <p className="text-slate-500 text-sm mb-8">{t("pageSubtitle")}</p>

      <div className="flex gap-2 mb-8 border-b border-slate-200">
        {[
          { id: "years", label: t("tabYears") },
          { id: "semesters", label: t("tabSemesters") },
          { id: "grades", label: t("tabGrades") },
          { id: "sections", label: t("tabSections") },
        ].map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id as Tab)}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition ${
              tab === tb.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === "years" && <AcademicYearsTab />}
      {tab === "semesters" && <SemestersTab />}
      {tab === "grades" && <GradeLevelsTab />}
      {tab === "sections" && <ClassSectionsTab />}
    </div>
  );
}

// ─── Academic Years ─────────────────────────────────────────

function AcademicYearsTab() {
  const { data: years = [], isLoading } = academicYears.useList();
  const { mutate: create, isPending } = academicYears.useCreate();
  const { mutate: remove } = academicYears.useRemove();
  const t = useTranslations("academicStructure");

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleCreate = () => {
    if (!name || !startDate || !endDate) {
      toast.error(t("fillAllFields"));
      return;
    }
    create(
      { name, startDate, endDate },
      {
        onSuccess: () => {
          toast.success(t("yearCreated"));
          setName("");
          setStartDate("");
          setEndDate("");
        },
        onError: () => toast.error(t("createFailed")),
      },
    );
  };

  if (isLoading) return <Loader2 className="animate-spin text-blue-600" size={28} />;

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <input
          className="border border-slate-200 rounded-lg px-3 py-2"
          placeholder={t("yearNamePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="date"
          className="border border-slate-200 rounded-lg px-3 py-2"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="border border-slate-200 rounded-lg px-3 py-2"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button
          disabled={isPending}
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus size={16} /> {t("add")}
        </button>
      </div>

      <div className="space-y-2">
        {years.map((y: any) => (
          <div
            key={y.id}
            className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center"
          >
            <div>
              <p className="font-bold">
                {y.name} {y.isActive && <span className="text-emerald-600 text-xs ml-2">{t("active")}</span>}
              </p>
              <p className="text-slate-400 text-xs">
                {new Date(y.startDate).toLocaleDateString()} – {new Date(y.endDate).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => remove(y.id, { onSuccess: () => toast.success(t("deleted")) })}
              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Semesters ─────────────────────────────────────────

function SemestersTab() {
  const { data: sems = [], isLoading } = semesters.useList();
  const { data: years = [] } = academicYears.useList();
  const { mutate: create, isPending } = semesters.useCreate();
  const { mutate: remove } = semesters.useRemove();
  const t = useTranslations("academicStructure");

  const [name, setName] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleCreate = () => {
    if (!name || !academicYearId || !startDate || !endDate) {
      toast.error(t("fillAllFields"));
      return;
    }
    create(
      { name, academicYearId, startDate, endDate },
      {
        onSuccess: () => {
          toast.success(t("semesterCreated"));
          setName("");
          setStartDate("");
          setEndDate("");
        },
        onError: () => toast.error(t("createFailed")),
      },
    );
  };

  if (isLoading) return <Loader2 className="animate-spin text-blue-600" size={28} />;

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        <select
          className="border border-slate-200 rounded-lg px-3 py-2"
          value={academicYearId}
          onChange={(e) => setAcademicYearId(e.target.value)}
        >
          <option value="">{t("selectYear")}</option>
          {years.map((y: any) => (
            <option key={y.id} value={y.id}>{y.name}</option>
          ))}
        </select>
        <input
          className="border border-slate-200 rounded-lg px-3 py-2"
          placeholder={t("semesterNamePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="date"
          className="border border-slate-200 rounded-lg px-3 py-2"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="border border-slate-200 rounded-lg px-3 py-2"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button
          disabled={isPending}
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus size={16} /> {t("add")}
        </button>
      </div>

      <div className="space-y-2">
        {sems.map((s: any) => (
          <div
            key={s.id}
            className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{s.name}</p>
              <p className="text-slate-400 text-xs">{s.academicYear?.name}</p>
            </div>
            <button
              onClick={() => remove(s.id, { onSuccess: () => toast.success(t("deleted")) })}
              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Grade Levels ─────────────────────────────────────────

function GradeLevelsTab() {
  const { data: grades = [], isLoading } = gradeLevels.useList();
  const { mutate: create, isPending } = gradeLevels.useCreate();
  const { mutate: remove } = gradeLevels.useRemove();
  const t = useTranslations("academicStructure");

  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!name) {
      toast.error(t("nameRequired"));
      return;
    }
    create(
      { name },
      {
        onSuccess: () => {
          toast.success(t("gradeLevelCreated"));
          setName("");
        },
        onError: () => toast.error(t("createFailed")),
      },
    );
  };

  if (isLoading) return <Loader2 className="animate-spin text-blue-600" size={28} />;

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <input
          className="border border-slate-200 rounded-lg px-3 py-2"
          placeholder={t("gradeLevelPlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          disabled={isPending}
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus size={16} /> {t("add")}
        </button>
      </div>

      <div className="space-y-2">
        {grades.map((g: any) => (
          <div
            key={g.id}
            className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center"
          >
            <p className="font-bold">{g.name}</p>
            <button
              onClick={() => remove(g.id, { onSuccess: () => toast.success(t("deleted")) })}
              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Class Sections ─────────────────────────────────────────

function ClassSectionsTab() {
  const { data: sections = [], isLoading } = classSections.useList();
  const { data: grades = [] } = gradeLevels.useList();
  const { mutate: create, isPending } = classSections.useCreate();
  const { mutate: remove } = classSections.useRemove();
  const t = useTranslations("academicStructure");

  const [name, setName] = useState("");
  const [gradeLevelId, setGradeLevelId] = useState("");

  const handleCreate = () => {
    if (!name || !gradeLevelId) {
      toast.error(t("fillAllFields"));
      return;
    }
    create(
      { name, gradeLevelId },
      {
        onSuccess: () => {
          toast.success(t("sectionCreated"));
          setName("");
        },
        onError: () => toast.error(t("createFailed")),
      },
    );
  };

  if (isLoading) return <Loader2 className="animate-spin text-blue-600" size={28} />;

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <select
          className="border border-slate-200 rounded-lg px-3 py-2"
          value={gradeLevelId}
          onChange={(e) => setGradeLevelId(e.target.value)}
        >
          <option value="">{t("selectGradeLevel")}</option>
          {grades.map((g: any) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <input
          className="border border-slate-200 rounded-lg px-3 py-2"
          placeholder={t("sectionNamePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          disabled={isPending}
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus size={16} /> {t("add")}
        </button>
      </div>

      <div className="space-y-2">
        {sections.map((s: any) => (
          <div
            key={s.id}
            className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{s.gradeLevel?.name} — {s.name}</p>
              <p className="text-slate-400 text-xs">{t("studentsCount", { count: s._count?.students ?? 0 })}</p>
            </div>
            <button
              onClick={() => remove(s.id, { onSuccess: () => toast.success(t("deleted")) })}
              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
