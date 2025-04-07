import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Payment, PaymentFilters, PaymentSummary } from "@/lib/api";

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PaymentFilters>({});

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPayments(filters);
      setPayments(data);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError("No se pudieron cargar los pagos. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const updateFilters = (newFilters: PaymentFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const createPayment = async (payment: Omit<Payment, "_id">) => {
    try {
      const newPayment = await api.createPayment(payment);
      setPayments((prev) => [...prev, newPayment]);
      return newPayment;
    } catch (err) {
      console.error("Error creating payment:", err);
      throw err;
    }
  };

  const updatePayment = async (id: string, payment: Partial<Payment>) => {
    try {
      const updatedPayment = await api.updatePayment(id, payment);
      setPayments((prev) =>
        prev.map((p) => (p._id === id ? updatedPayment : p))
      );
      return updatedPayment;
    } catch (err) {
      console.error("Error updating payment:", err);
      throw err;
    }
  };

  const deletePayment = async (id: string) => {
    try {
      await api.deletePayment(id);
      setPayments((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Error deleting payment:", err);
      throw err;
    }
  };

  const getStudentPaymentSummary = async (
    studentId: string
  ): Promise<PaymentSummary> => {
    try {
      return await api.getStudentPaymentSummary(studentId);
    } catch (err) {
      console.error("Error fetching student payment summary:", err);
      throw err;
    }
  };

  const getPaymentsSummaryByDateRange = async (
    startDate: string,
    endDate: string
  ): Promise<PaymentSummary> => {
    try {
      return await api.getPaymentsSummaryByDateRange(startDate, endDate);
    } catch (err) {
      console.error("Error fetching payments summary by date range:", err);
      throw err;
    }
  };

  return {
    payments,
    loading,
    error,
    filters,
    updateFilters,
    createPayment,
    updatePayment,
    deletePayment,
    getStudentPaymentSummary,
    getPaymentsSummaryByDateRange,
  };
}
