import React, { useState } from "react";
import Button from "@/Components/UI/Button";
import { mockSubjects } from "@/Data/subjectData";
import { mockClasses } from "@/Data/relationalData";

export default function Subjects() {
  const [selectedClassId, setSelectedClassId] = useState(mockClasses[0].id);

  const filteredSubjects = mockSubjects.filter(
    (s) => s.classId === parseInt(selectedClassId)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <label className="text-sm font-bold text-gray-600 uppercase">
            Class Filter:
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="border rounded p-2 text-sm focus:ring-2 focus:ring-green-500"
          >
            {mockClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <Button className="bg-green-600 w-full md:w-auto">
          + Add Subject
        </Button>
      </div>

      <div className="p-6">
        {filteredSubjects.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl">
            <span className="material-icons text-gray-300 text-5xl mb-2">
              folder_off
            </span>
            <p className="text-gray-400">
              No subjects found for this class.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject) => (
              <div
                key={subject.id}
                className="border-2 border-gray-100 rounded-xl p-5 hover:border-green-500 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-gray-800 leading-tight">
                    {subject.title}
                  </h3>
                  <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-1 rounded font-black uppercase">
                    {subject.questionCount} Qs
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 text-xs py-1"
                    variant="outline"
                  >
                    Manage Questions
                  </Button>

                  <Button
                    className="bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <span className="material-icons text-sm">delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
