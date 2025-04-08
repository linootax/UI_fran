"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarCheck, CreditCard, Package, User } from "lucide-react";
import { RecentStudents } from "@/components/students/recent-students";
import { RecentPayments } from "@/components/payments/recent-payments";
import { useStudents } from "@/hooks/useStudents";
import { useAttendance } from "@/hooks/useAttendance";
import { usePayments } from "@/hooks/usePayments";
import { useInventory } from "@/hooks/useInventory";
import { Loading } from "@/components/ui/loading";
import { Error } from "@/components/ui/error";
import { InventoryItem, Student, Payment } from "@/lib/api";

interface PaymentStats {
  total: number;
  paid: number;
  pending: number;
  cancelled: number;
}

export function DashboardOverview() {
  // States for storing monthly comparisons
  const [studentGrowth, setStudentGrowth] = useState<number>(0);
  const [attendanceGrowth, setAttendanceGrowth] = useState<number>(0);
  const [revenueGrowth, setRevenueGrowth] = useState<number>(0);
  const [revenueChange, setRevenueChange] = useState<number>(0);
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    total: 0,
    paid: 0,
    pending: 0,
    cancelled: 0,
  });
  const [inventoryGrowth, setInventoryGrowth] = useState<number>(0);
  const [availableInventory, setAvailableInventory] = useState<number>(0);

  // Get current date and last month's date
  const currentDate = useMemo(() => new Date(), []);
  const lastMonth = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    [currentDate]
  );
  const startOfMonth = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    [currentDate]
  );

  // Hooks
  const {
    students,
    loading: studentsLoading,
    error: studentsError,
  } = useStudents();
  const { getAttendanceByDateRange } = useAttendance();
  const { payments } = usePayments();
  const { inventory } = useInventory();

  // Calculate payment statistics
  useEffect(() => {
    if (!payments.length) return;

    // Filter payments for current month
    const currentMonthPayments = payments.filter((payment: Payment) => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= startOfMonth && paymentDate <= currentDate;
    });

    // Calculate current month stats
    const stats = currentMonthPayments.reduce(
      (acc: PaymentStats, payment: Payment) => {
        acc.total += payment.amount;
        if (payment.status === "Pagado") acc.paid += payment.amount;
        if (payment.status === "Pendiente") acc.pending += payment.amount;
        if (payment.status === "Cancelado") acc.cancelled += payment.amount;
        return acc;
      },
      {
        total: 0,
        paid: 0,
        pending: 0,
        cancelled: 0,
      }
    );

    // Filter payments for last month
    const lastMonthPayments = payments.filter((payment: Payment) => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= lastMonth && paymentDate < startOfMonth;
    });

    // Calculate last month stats
    const lastMonthStats = lastMonthPayments.reduce(
      (acc: PaymentStats, payment: Payment) => {
        if (payment.status === "Pagado") acc.paid += payment.amount;
        return acc;
      },
      { total: 0, paid: 0, pending: 0, cancelled: 0 }
    );

    // Calculate change
    const changeValue =
      lastMonthStats.paid > 0
        ? ((stats.paid - lastMonthStats.paid) / lastMonthStats.paid) * 100
        : 100;

    // Update all payment-related states at once
    setPaymentStats(stats);
    setRevenueGrowth(stats.paid);
    setRevenueChange(changeValue);
  }, [payments, startOfMonth, currentDate, lastMonth]);

  // Calculate attendance and inventory statistics
  useEffect(() => {
    const calculateStats = async () => {
      try {
        // Calculate attendance percentage
        const currentMonthAttendance = await getAttendanceByDateRange(
          startOfMonth.toISOString().split("T")[0],
          currentDate.toISOString().split("T")[0]
        );
        const lastMonthAttendance = await getAttendanceByDateRange(
          lastMonth.toISOString().split("T")[0],
          startOfMonth.toISOString().split("T")[0]
        );

        const currentAttendanceRate = currentMonthAttendance.length
          ? (currentMonthAttendance.filter((a) => a.status === "Presente")
              .length /
              currentMonthAttendance.length) *
            100
          : 0;

        setAttendanceGrowth(currentAttendanceRate);

        // Calculate inventory statistics
        const availableItems = inventory.filter(
          (item: InventoryItem) => item.status === "Disponible"
        );
        const newAvailableItems = availableItems.filter(
          (item: InventoryItem) => new Date(item.lastUpdated) >= startOfMonth
        ).length;
        setInventoryGrowth(newAvailableItems);
        setAvailableInventory(availableItems.length);
      } catch (error) {
        console.error("Error calculating dashboard statistics:", error);
      }
    };

    calculateStats();
  }, [
    getAttendanceByDateRange,
    inventory,
    startOfMonth,
    currentDate,
    lastMonth,
  ]);

  if (studentsLoading) {
    return <Loading />;
  }

  if (studentsError) {
    return (
      <Error title="Error al cargar el dashboard" message={studentsError} />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido al sistema de gestión administrativa
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Alumnos
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
                <p className="text-xs text-muted-foreground">
                  {studentGrowth > 0 ? "+" : ""}
                  {studentGrowth.toFixed(1)}% respecto al mes anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Asistencia Promedio
                </CardTitle>
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {attendanceGrowth.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {attendanceGrowth > 0 ? "+" : ""}
                  {attendanceGrowth.toFixed(1)}% respecto al mes anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ingresos Mensuales
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                    maximumFractionDigits: 0,
                  }).format(paymentStats.paid)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {revenueChange > 0 ? "+" : ""}
                  {revenueChange.toFixed(1)}% respecto al mes anterior
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground flex justify-between">
                    <span>Pagos pendientes:</span>
                    <span>
                      {new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: "MXN",
                        maximumFractionDigits: 0,
                      }).format(paymentStats.pending)}
                    </span>
                  </p>
                  <p className="text-xs text-emerald-600 flex justify-between">
                    <span>Total cobrado:</span>
                    <span>
                      {new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: "MXN",
                        maximumFractionDigits: 0,
                      }).format(paymentStats.paid)}
                    </span>
                  </p>
                  <p className="text-xs text-red-600 flex justify-between">
                    <span>Pagos cancelados:</span>
                    <span>
                      {new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: "MXN",
                        maximumFractionDigits: 0,
                      }).format(paymentStats.cancelled)}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Inventario Disponible
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {availableInventory} items disponibles
                </div>
                <p className="text-xs text-muted-foreground">
                  +{inventoryGrowth} items disponibles nuevos este mes
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Alumnos Recientes</CardTitle>
                <CardDescription>
                  Últimos alumnos registrados en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentStudents />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Pagos Recientes</CardTitle>
                <CardDescription>
                  Últimos pagos registrados en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentPayments />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
