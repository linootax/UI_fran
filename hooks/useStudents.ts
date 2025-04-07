import { useState, useEffect } from "react";
import { api, Student } from "@/lib/api";

export function useStudents(initialFilters?: {
  status?: string;
  grade?: string;
}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters || {});

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await api.getAllStudents(filters);
      setStudents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  const updateFilters = (newFilters: typeof filters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const getStudentById = async (id: string) => {
    try {
      return await api.getStudentById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch student");
      throw err;
    }
  };

  const createStudent = async (
    student: Omit<Student, "_id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const newStudent = await api.createStudent(student);
      setStudents((prev) => [...prev, newStudent]);
      return newStudent;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create student");
      throw err;
    }
  };

  const updateStudent = async (id: string, student: Partial<Student>) => {
    try {
      const updatedStudent = await api.updateStudent(id, student);
      setStudents((prev) =>
        prev.map((s) => (s._id === id ? updatedStudent : s))
      );
      return updatedStudent;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update student");
      throw err;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await api.deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete student");
      throw err;
    }
  };

  return {
    students,
    loading,
    error,
    filters,
    updateFilters,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    refresh: fetchStudents,
  };
}
