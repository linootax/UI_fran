import { fetchApi } from "../api-config";

export interface Payment {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    grade: string;
  };
  amount: number;
  date: string;
  concept: string;
  status: "Pagado" | "Pendiente" | "Cancelado";
  paymentMethod: "Efectivo" | "Tarjeta" | "Transferencia";
  receiptNumber?: string;
}

export interface PaymentFilters {
  studentId?: string;
  status?: Payment["status"];
  paymentMethod?: Payment["paymentMethod"];
  startDate?: string;
  endDate?: string;
}

export interface PaymentSummary {
  student: {
    name: string;
    email: string;
    grade: string;
  };
  payments: Array<{
    _id: Payment["status"];
    total: number;
    count: number;
  }>;
}

export interface PaymentRangeSummary {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: Array<{
    _id: {
      status: Payment["status"];
      paymentMethod: Payment["paymentMethod"];
    };
    total: number;
    count: number;
  }>;
  totals: {
    total: number;
    count: number;
  };
}

export const paymentsService = {
  // Get all payments with optional filters
  getAll: async (filters?: PaymentFilters) => {
    const queryParams = new URLSearchParams();
    if (filters?.studentId) queryParams.append("studentId", filters.studentId);
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.paymentMethod)
      queryParams.append("paymentMethod", filters.paymentMethod);
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);

    return fetchApi<Payment[]>(`/payments?${queryParams.toString()}`);
  },

  // Get student payment summary
  getStudentSummary: async (studentId: string) => {
    return fetchApi<PaymentSummary>(`/payments/student/${studentId}/summary`);
  },

  // Get payments summary by date range
  getSummaryByRange: async (startDate: string, endDate: string) => {
    return fetchApi<PaymentRangeSummary>(
      `/payments/summary/range?startDate=${startDate}&endDate=${endDate}`
    );
  },

  // Create a new payment
  create: async (payment: Omit<Payment, "_id" | "receiptNumber">) => {
    return fetchApi<Payment>("/payments", {
      method: "POST",
      body: JSON.stringify(payment),
    });
  },

  // Update a payment
  update: async (id: string, payment: Partial<Payment>) => {
    return fetchApi<Payment>(`/payments/${id}`, {
      method: "PUT",
      body: JSON.stringify(payment),
    });
  },

  // Delete a payment
  delete: async (id: string) => {
    return fetchApi<void>(`/payments/${id}`, {
      method: "DELETE",
    });
  },
};
