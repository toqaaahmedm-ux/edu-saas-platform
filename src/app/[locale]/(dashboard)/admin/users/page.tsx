"use client";
import { useState, useMemo } from "react";
import { Users, Plus, Trash2, Loader2, X, Mail, Send, BookOpen, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";
import { useUsers, useDeleteUser, useCreateUser } from "@/services/users.service";
import { useAdminCourses } from "@/services/courses.service";
import { useAdminEnroll } from "@/services/enrollments.service";
import { useTranslations } from "next-intl";

const PAGE_SIZE = 10;

export default function ManageUsersPage() {
  const { data: users = [], isLoading } = useUsers();
  const { mutate: deleteUser, isPending: deleting } = useDeleteUser();
  const { mutate: createUser, isPending: creating } = useCreateUser();
  const { data: courses = [] } = useAdminCourses();
  const { mutate: adminEnroll, isPending: enrolling } = useAdminEnroll();
  const t = useTranslations("manageUsersPage");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "STUDENT" as "TEACHER" | "STUDENT",
    password: "",
    sendInvite: true,
  });

  const [assignStudent, setAssignStudent] = useState<{ id: string; name: string } | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "TEACHER" | "STUDENT" | "ADMIN">("ALL");
  const [page, setPage] = useState(1);

  const filteredUsers = useMemo(() => {
    let result = users;
    if (roleFilter !== "ALL") {
      result = result.filter((u: any) => u.role === roleFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u: any) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetForm = () => {
    setForm({ name: "", email: "", role: "STUDENT", password: "", sendInvite: true });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createUser(form, {
      onSuccess: () => {
        toast.success(t("userCreated", { name: form.name }));
        setShowModal(false);
        resetForm();
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || t("createFailed"));
      },
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteUser(deleteTarget.id, {
      onSuccess: () => {
        toast.success(t("userDeleted", { name: deleteTarget.name }));
        setDeleteTarget(null);
      },
      onError: () => {
        toast.error(t("deleteFailed"));
        setDeleteTarget(null);
      },
    });
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignStudent || !selectedCourseId) return;
    adminEnroll(
      { studentId: assignStudent.id, courseId: selectedCourseId },
      {
        onSuccess: () => {
          toast.success(t("studentEnrolled", { name: assignStudent.name }));
          setAssignStudent(null);
          setSelectedCourseId("");
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || t("enrollFailed"));
        },
      },
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Users className="text-blue-600" size={32} />
            {t("title")}
          </h2>
          <p className="text-slate-400 font-medium mt-1">{t("subtitle")}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg"
        >
          <Plus size={18} /> {t("addUser")}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value as any); setPage(1); }}
          className="px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">{t("allRoles")}</option>
          <option value="ADMIN">{t("roleAdmin")}</option>
          <option value="TEACHER">{t("roleTeacher")}</option>
          <option value="STUDENT">{t("roleStudent")}</option>
        </select>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-slate-400 text-center py-16 font-bold italic">
            {search || roleFilter !== "ALL" ? t("noMatch") : t("noUsersYet")}
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedUsers.map((u: any) => (
                <div
                  key={u.id}
                  className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black uppercase">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 leading-none">{u.name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <Mail size={12} /> {u.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                      {u.role}
                    </span>
                    {u.role === "STUDENT" && (
                      <button
                        onClick={() => setAssignStudent({ id: u.id, name: u.name })}
                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <BookOpen size={14} /> {t("assignToCourse")}
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget({ id: u.id, name: u.name })}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                      aria-label={t("deleteUserAria")}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-bold">
                  {t("pageInfo", { page, totalPages, count: filteredUsers.length })}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {t("previous")}
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {t("next")}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-black text-slate-800 mb-6">{t("addNewUser")}</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t("name")}</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("namePlaceholder")}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t("email")}</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("emailPlaceholder")}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t("role")}</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as "TEACHER" | "STUDENT" })}
                  className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="STUDENT">{t("roleStudent")}</option>
                  <option value="TEACHER">{t("roleTeacher")}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t("password")}</label>
                <input
                  required
                  minLength={8}
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("passwordPlaceholder")}
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={form.sendInvite}
                  onChange={(e) => setForm({ ...form, sendInvite: e.target.checked })}
                  className="rounded"
                />
                <Send size={14} /> {t("sendInvite")}
              </label>

              <button
                type="submit"
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 mt-2"
              >
                {creating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                {t("createUser")}
              </button>
            </form>
          </div>
        </div>
      )}

      {assignStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => { setAssignStudent(null); setSelectedCourseId(""); }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-black text-slate-800 mb-2">{t("assignToCourseTitle")}</h3>
            <p className="text-sm text-slate-400 mb-6">
              {t("enrollingLabel")} <span className="font-bold text-slate-700">{assignStudent.name}</span>
            </p>

            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t("courseLabel")}</label>
                <select
                  required
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>{t("selectCourse")}</option>
                  {courses.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={enrolling || !selectedCourseId}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 mt-2"
              >
                {enrolling ? <Loader2 className="animate-spin" size={18} /> : <BookOpen size={18} />}
                {t("enrollStudent")}
              </button>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-500" size={28} />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">{t("deleteUserTitle")}</h3>
            <p className="text-sm text-slate-500 mb-6">
              {t("deleteUserConfirm", { name: deleteTarget.name })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {deleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
