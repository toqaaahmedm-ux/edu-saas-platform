"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Loader2, Layers, BookOpen, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  useModules,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
} from "@/services/modules.service";

export default function TeacherModulesPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();

  const { data: modules = [], isLoading, isError } = useModules(courseId);
  const { mutate: createModule, isPending: isCreating } = useCreateModule(courseId);
  const { mutate: updateModule } = useUpdateModule(courseId);
  const { mutate: deleteModule, isPending: isDeleting } = useDeleteModule(courseId);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (module: any) => {
    setEditingId(module.id);
    setTitle(module.title);
    setDescription(module.description || "");
    setShowForm(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (editingId) {
      updateModule(
        { moduleId: editingId, data: { title, description } },
        {
          onSuccess: () => {
            toast.success("Module updated");
            resetForm();
          },
          onError: () => toast.error("Failed to update module"),
        },
      );
    } else {
      createModule(
        { title, description },
        {
          onSuccess: () => {
            toast.success("Module created");
            resetForm();
          },
          onError: () => toast.error("Failed to create module"),
        },
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-red-200 rounded-3xl">
        <p className="text-red-500 font-medium">Failed to load modules. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black">Modules</h1>
          <p className="text-slate-500 text-sm mt-1">
            Group your lessons into chapters students move through in order.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={18} /> New Module
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">{editingId ? "Edit Module" : "New Module"}</h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <input
            className="border border-slate-200 rounded-lg px-3 py-2 w-full mb-3"
            placeholder="Title (e.g. Chapter 1: Getting Started)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="border border-slate-200 rounded-lg px-3 py-2 w-full mb-4"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            disabled={isCreating}
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {editingId ? "Save changes" : isCreating ? "Creating…" : "Create Module"}
          </button>
        </div>
      )}

      {modules.length > 0 ? (
        <div className="space-y-3">
          {modules
            .slice()
            .sort((a: any, b: any) => a.order - b.order)
            .map((module: any) => (
              <div
                key={module.id}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <GripVertical size={16} className="text-slate-300" />
                  <div className="bg-blue-50 text-blue-600 rounded-xl p-2">
                    <Layers size={18} />
                  </div>
                  <div>
                    <p className="font-bold">{module.title}</p>
                    {module.description && (
                      <p className="text-slate-500 text-sm line-clamp-1">{module.description}</p>
                    )}
                    <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                      <BookOpen size={12} />
                      {module._count?.lessons ?? module.lessons?.length ?? 0} lesson
                      {(module._count?.lessons ?? module.lessons?.length ?? 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      router.push(`/teacher/courses/${courseId}/lessons?moduleId=${module.id}`)
                    }
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                    title="Manage lessons in this module"
                  >
                    <BookOpen size={16} />
                  </button>
                  <button
                    onClick={() => startEdit(module)}
                    className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200"
                    title="Edit module"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    disabled={isDeleting}
                    onClick={() =>
                      deleteModule(module.id, {
                        onSuccess: () => toast.success("Module deleted"),
                        onError: () => toast.error("Failed to delete module"),
                      })
                    }
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
                    title="Delete module"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
          <p className="text-slate-500 font-medium">
            No modules yet. Create one to start organizing your lessons.
          </p>
        </div>
      )}
    </div>
  );
}