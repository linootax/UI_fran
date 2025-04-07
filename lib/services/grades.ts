import { fetchApi } from "../api-config";

export interface Grade {
  _id?: string;
  studentId: string;
  subject: string;
  score: number;
  term: string;
  academicYear: string;
  assessmentType: "quiz" | "exam" | "assignment" | "project";
  assessmentDate: string;
  comments?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GradeFilters {
  studentId?: string;
  subject?: string;
  term?: string;
  academicYear?: string;
  assessmentType?: string;
  startDate?: string;
  endDate?: string;
}

export interface StudentPerformance {
  averageScore: number;
  totalAssessments: number;
  subjectBreakdown: {
    [subject: string]: {
      average: number;
      assessments: number;
    };
  };
}

export const gradesService = {
  async getAll(filters?: GradeFilters) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }

    const endpoint = `/grades${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return fetchApi<Grade[]>(endpoint);
  },

  async getStudentPerformance(studentId: string, academicYear?: string) {
    const queryParams = new URLSearchParams({ studentId });
    if (academicYear) queryParams.append("academicYear", academicYear);

    return fetchApi<StudentPerformance>(
      `/grades/performance?${queryParams.toString()}`
    );
  },

  async create(grade: Omit<Grade, "_id" | "createdAt" | "updatedAt">) {
    return fetchApi<Grade>("/grades", {
      method: "POST",
      body: JSON.stringify(grade),
    });
  },

  async update(id: string, grade: Partial<Grade>) {
    return fetchApi<Grade>(`/grades/${id}`, {
      method: "PUT",
      body: JSON.stringify(grade),
    });
  },

  async delete(id: string) {
    return fetchApi<void>(`/grades/${id}`, {
      method: "DELETE",
    });
  },
};
