import { fetchApi } from "../api-config";

export interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  grade: string;
  status: "Activo" | "Inactivo" | "Suspendido";
  avatarUrl?: string;
  enrollmentDate: string;
}

export interface StudentFilters {
  status?: Student["status"];
  grade?: string;
}

export const studentsService = {
  getAll: async (filters?: StudentFilters) => {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.grade) queryParams.append("grade", filters.grade);

    return fetchApi<Student[]>(
      `/students${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );
  },

  getById: async (id: string) => {
    return fetchApi<Student>(`/students/${id}`);
  },

  create: async (student: Omit<Student, "_id" | "avatarUrl">) => {
    return fetchApi<Student>("/students", {
      method: "POST",
      body: JSON.stringify(student),
    });
  },

  update: async (id: string, student: Partial<Student>) => {
    return fetchApi<Student>(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(student),
    });
  },

  delete: async (id: string) => {
    return fetchApi<void>(`/students/${id}`, {
      method: "DELETE",
    });
  },
};
