"use client";

import { useState } from "react";
import { Plus, Save, Trash2, HelpCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function QuizBuilderPage() {
  const [questions, setQuestions] = useState([
    { id: 1, text: "", options: ["", "", "", ""], correct: 0 }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { 
      id: Date.now(), 
      text: "", 
      options: ["", "", "", ""], 
      correct: 0 
    }]);
    toast.info("New question added to the bank.");
  };

  const removeQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    } else {
      toast.error("At least one question is required.");
    }
  };

  const updateQuestion = (id: number, field: string, value: any, optionIndex?: number) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === id) {
        if (field === 'options' && typeof optionIndex === 'number') {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return { ...q, [field]: value };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 text-left pb-20">
      
      {/* Header - SaaS Standards */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-orange-500 text-white rounded-2xl shadow-lg">
            <HelpCircle size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800">Question Bank Builder</h2>
            <p className="text-slate-500 font-medium italic">Create high-quality assessments for your students.</p>
          </div>
        </div>
        <button 
          type="button" // حل مشكلة الـ Type
          aria-label="Add a new question" // حل مشكلة الـ Accessibility
          onClick={addQuestion}
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-orange-600 transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} /> Add Question
        </button>
      </div>

      <div className="space-y-10">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative group animate-in slide-in-from-bottom-4">
            
            <button 
              type="button" // مهم جداً
              aria-label="Remove this question"
              onClick={() => removeQuestion(q.id)}
              className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl"
            >
              <Trash2 size={22} />
            </button>

            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black text-xl">
                  {index + 1}
                </span>
                <input 
                  type="text"
                  aria-label={`Question text for question ${index + 1}`}
                  value={q.text}
                  onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                  placeholder="What is the main concept of this question?"
                  className="flex-1 bg-slate-50 border-none p-5 rounded-2xl text-lg font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {q.options.map((option, i) => (
                  <div key={i} className="relative group">
                    <input 
                      type="text"
                      aria-label={`Option ${String.fromCharCode(65 + i)}`}
                      value={option}
                      onChange={(e) => updateQuestion(q.id, 'options', e.target.value, i)}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      className={`w-full p-5 pl-14 rounded-2xl border transition-all text-sm font-bold outline-none ${
                        i === q.correct 
                        ? "border-green-500 bg-green-50/30 ring-1 ring-green-500" 
                        : "border-slate-100 bg-slate-50/50 focus:border-orange-400"
                      }`}
                    />
                    
                    <button 
                      type="button" // حل الخطأ اللي كان في الصورة
                      aria-label={`Mark option ${String.fromCharCode(65 + i)} as correct`}
                      onClick={() => updateQuestion(q.id, 'correct', i)}
                      className={`absolute left-5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                        i === q.correct 
                        ? "bg-green-500 border-green-500 text-white rotate-0" 
                        : "border-slate-200 text-transparent hover:border-green-300 rotate-45"
                      }`}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-10 border-t">
        <button 
          type="button"
          aria-label="Save the entire question bank"
          onClick={() => {
            console.log("Saving quiz:", questions);
            toast.success("Question Bank saved successfully!");
          }}
          className="flex items-center gap-3 bg-green-600 text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl shadow-green-200 hover:bg-green-700 transition-all active:scale-95"
        >
          <Save size={24} /> Save Question Bank
        </button>
      </div>
    </div>
  );
}
