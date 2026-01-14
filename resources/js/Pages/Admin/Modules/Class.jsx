import React, { useState, useEffect } from "react";
import Button from "@/Components/UI/Button";
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react";

export default function Class({ modules }) {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    setClasses(modules ?? []);
  }, [modules]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="text-green-600" />
            Academic Classes
          </h1>
          <p className="text-sm text-gray-500">
            Manage your school classes
          </p>
        </div>

        <Button className="bg-green-600 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Class
        </Button>
      </div>

      <div className="p-6">
        {classes.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            No classes found
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-3 text-left">Class Name</th>
                <th className="py-3 text-center">Students</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-3 font-medium">{item.name}</td>
                  <td className="py-3 text-center">-</td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="danger" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
