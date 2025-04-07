import { useState, useEffect } from "react";
import { api, AttendanceRecord } from "@/lib/api";

interface AttendanceFilters {
  studentId?: string;
  date?: string;
  status?: string;
}

export function useAttendance(initialFilters?: AttendanceFilters) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters || {});

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const data = await api.getAllAttendance(filters);
      setAttendance(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch attendance records"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [filters]);

  const updateFilters = (newFilters: AttendanceFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const createAttendance = async (data: {
    studentId: string;
    date: string;
    status: "Presente" | "Ausente" | "Retardo";
    notes?: string;
  }) => {
    try {
      const newAttendance = await api.createAttendance(data);
      setAttendance((prev) => [...prev, newAttendance]);
      return newAttendance;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create attendance record"
      );
      throw err;
    }
  };

  const getAttendanceByDateRange = async (
    startDate: string,
    endDate: string
  ) => {
    try {
      return await api.getAttendanceByDateRange(startDate, endDate);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch attendance range"
      );
      throw err;
    }
  };

  const getStudentStats = async (studentId: string) => {
    try {
      return await api.getStudentAttendanceStats(studentId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch student attendance stats"
      );
      throw err;
    }
  };

  return {
    attendance,
    loading,
    error,
    filters,
    updateFilters,
    createAttendance,
    getAttendanceByDateRange,
    getStudentStats,
    refresh: fetchAttendance,
  };
}
