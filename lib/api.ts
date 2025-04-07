// Types
export interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  grade: string;
  status: "Activo" | "Inactivo" | "Suspendido";
  enrollmentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    grade: string;
  };
  date: string;
  status: "Presente" | "Ausente" | "Retardo";
  notes?: string;
}

export interface InventoryItem {
  _id: string;
  name: string;
  description: string;
  quantity: number;
  category: string;
  status: "Disponible" | "Agotado" | "Mantenimiento";
  lastUpdated: string;
  location: string;
  minimumQuantity: number;
  cost: number;
}

export interface Payment {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    grade: string;
  };
  amount: number;
  date: string;
  concept: string;
  status: "Pagado" | "Pendiente" | "Cancelado";
  paymentMethod: "Efectivo" | "Tarjeta" | "Transferencia";
  receiptNumber: string;
}

export interface PaymentFilters {
  studentId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaymentSummary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentCount: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

// API Service class
class ApiService {
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    console.log(`Making API request to: ${API_BASE_URL}${endpoint}`, {
      method: options.method || "GET",
      headers: options.headers,
      body: options.body ? JSON.parse(options.body as string) : undefined,
    });

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`API Error (${response.status}):`, errorData);
        throw new Error(
          errorData.message || `API Error: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(`API response from ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  private handleError(error: any): never {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data.message || "Error en la solicitud");
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error("No se recibió respuesta del servidor");
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error("Error al procesar la solicitud");
    }
  }

  // Students API
  async getAllStudents(params?: {
    status?: string;
    grade?: string;
  }): Promise<Student[]> {
    const queryParams = new URLSearchParams(params);
    return this.fetchApi<Student[]>(`/students?${queryParams}`);
  }

  async getStudentById(id: string): Promise<Student> {
    return this.fetchApi<Student>(`/students/${id}`);
  }

  async createStudent(
    student: Omit<Student, "_id" | "createdAt" | "updatedAt">
  ): Promise<Student> {
    return this.fetchApi<Student>("/students", {
      method: "POST",
      body: JSON.stringify(student),
    });
  }

  async updateStudent(id: string, student: Partial<Student>): Promise<Student> {
    return this.fetchApi<Student>(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(student),
    });
  }

  async deleteStudent(id: string): Promise<void> {
    return this.fetchApi<void>(`/students/${id}`, {
      method: "DELETE",
    });
  }

  // Attendance API
  async getAllAttendance(params?: {
    studentId?: string;
    date?: string;
    status?: string;
  }): Promise<AttendanceRecord[]> {
    const queryParams = new URLSearchParams(params);
    return this.fetchApi<AttendanceRecord[]>(`/attendance?${queryParams}`);
  }

  async getAttendanceByDateRange(
    startDate: string,
    endDate: string
  ): Promise<AttendanceRecord[]> {
    return this.fetchApi<AttendanceRecord[]>(
      `/attendance/range/${startDate}/${endDate}`
    );
  }

  async getStudentAttendanceStats(
    studentId: string
  ): Promise<{ _id: string; count: number }[]> {
    return this.fetchApi<{ _id: string; count: number }[]>(
      `/attendance/stats/student/${studentId}`
    );
  }

  async createAttendance(attendance: {
    studentId: string;
    date: string;
    status: "Presente" | "Ausente" | "Retardo";
    notes?: string;
  }): Promise<AttendanceRecord> {
    return this.fetchApi<AttendanceRecord>("/attendance", {
      method: "POST",
      body: JSON.stringify(attendance),
    });
  }

  // Inventory API
  async getAllInventory(): Promise<InventoryItem[]> {
    try {
      const response = await this.fetchApi<InventoryItem[]>("/inventory");
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getInventoryItem(id: string): Promise<InventoryItem> {
    try {
      const response = await this.fetchApi<InventoryItem>(`/inventory/${id}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createInventoryItem(
    item: Omit<InventoryItem, "_id">
  ): Promise<InventoryItem> {
    try {
      const response = await this.fetchApi<InventoryItem>("/inventory", {
        method: "POST",
        body: JSON.stringify(item),
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateInventoryItem(
    id: string,
    item: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    try {
      const response = await this.fetchApi<InventoryItem>(`/inventory/${id}`, {
        method: "PUT",
        body: JSON.stringify(item),
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteInventoryItem(id: string): Promise<void> {
    try {
      await this.fetchApi<void>(`/inventory/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Payments API
  async getPayments(filters?: PaymentFilters): Promise<Payment[]> {
    const queryParams = new URLSearchParams();
    if (filters?.studentId) queryParams.append("studentId", filters.studentId);
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);

    return this.fetchApi<Payment[]>(`/payments?${queryParams.toString()}`);
  }

  async createPayment(payment: Omit<Payment, "_id">): Promise<Payment> {
    return this.fetchApi<Payment>("/payments", {
      method: "POST",
      body: JSON.stringify(payment),
    });
  }

  async updatePayment(id: string, payment: Partial<Payment>): Promise<Payment> {
    return this.fetchApi<Payment>(`/payments/${id}`, {
      method: "PUT",
      body: JSON.stringify(payment),
    });
  }

  async deletePayment(id: string): Promise<void> {
    return this.fetchApi<void>(`/payments/${id}`, {
      method: "DELETE",
    });
  }

  async getStudentPaymentSummary(studentId: string): Promise<PaymentSummary> {
    return this.fetchApi<PaymentSummary>(`/payments/summary/${studentId}`);
  }

  async getPaymentsSummaryByDateRange(
    startDate: string,
    endDate: string
  ): Promise<PaymentSummary> {
    return this.fetchApi<PaymentSummary>(
      `/payments/summary?startDate=${startDate}&endDate=${endDate}`
    );
  }
}

export const api = new ApiService();
