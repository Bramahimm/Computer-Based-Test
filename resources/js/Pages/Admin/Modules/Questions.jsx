import React, { useState } from "react";
import Button from "@/Components/UI/Button";
import QuestionForm from "@/Features/Modules/Components/QuestionForm";
import { mockQuestions } from "@/Data/relationalData";
import { mockSubjects } from "@/Data/subjectData";

export default function Questions() {
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    mockSubjects[0].id
  );
  const [isFormOpen, setIsFormOpen] = useState(false);

  const questions = mockQuestions.filter(
    (q) => q.subjectId === parseInt(selectedSubjectId)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Subject Selector */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <h2 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest">
            Select Subject
          </h2>
          <div className="space-y-2">
            {mockSubjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
                  selectedSubjectId === sub.id
                    ? "bg-green-600 text-white shadow-md font-bold"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                {sub.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question List */}
      <div className="lg:col-span-9 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Questions in Subject
          </h2>
          <Button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-blue-600"
          >
            {isFormOpen ? "Close Editor" : "+ Create Question"}
          </Button>
        </div>

        {isFormOpen ? (
          <QuestionForm onCancel={() => setIsFormOpen(false)} />
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div
                key={q.id}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase text-gray-400">
                    ID: {q.id} | {q.type}
                  </span>
                  <div className="flex gap-2 text-gray-300">
                    <span className="cursor-pointer hover:text-blue-500">
                      edit
                    </span>
                    <span className="cursor-pointer hover:text-red-500">
                      delete
                    </span>
                  </div>
                </div>

                <p className="text-gray-800 font-medium mb-4">{q.text}</p>

                {q.options.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`p-2 rounded text-xs border ${
                          opt.isCorrect
                            ? "bg-green-50 border-green-200 text-green-700 font-bold"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        {opt.isCorrect && "✓ "}
                        {opt.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
