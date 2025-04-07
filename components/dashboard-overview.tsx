"use client";

import { useEffect, useState } from "react";
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
import { InventoryItem } from "@/lib/api";

export function DashboardOverview() {
  // States for storing monthly comparisons
  const [studentGrowth, setStudentGrowth] = useState<number>(0);
  const [attendanceGrowth, setAttendanceGrowth] = useState<number>(0);
  const [revenueGrowth, setRevenueGrowth] = useState<number>(0);
  const [revenueChange, setRevenueChange] = useState<number>(0);
  const [inventoryGrowth, setInventoryGrowth] = useState<number>(0);
  const [availableInventory, setAvailableInventory] = useState<number>(0);

  // Get current date and last month's date
  const currentDate = new Date();
  const lastMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  );
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  // Hooks
  const {
    students,
    loading: studentsLoading,
    error: studentsError,
  } = useStudents();
  const { getAttendanceByDateRange } = useAttendance();
  const { getPaymentsSummaryByDateRange } = usePayments();
  const { inventory } = useInventory();

  // Calculate statistics
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
        const lastAttendanceRate = lastMonthAttendance.length
          ? (lastMonthAttendance.filter((a) => a.status === "Presente").length /
              lastMonthAttendance.length) *
            100
          : 0;
        setAttendanceGrowth(currentAttendanceRate);

        // Calculate revenue growth
        const currentMonthPayments = await getPaymentsSummaryByDateRange(
          startOfMonth.toISOString().split("T")[0],
          currentDate.toISOString().split("T")[0]
        );
        const lastMonthPayments = await getPaymentsSummaryByDateRange(
          lastMonth.toISOString().split("T")[0],
          startOfMonth.toISOString().split("T")[0]
        );
        const revenueChangeValue =
          lastMonthPayments.totalAmount > 0
            ? ((currentMonthPayments.totalAmount -
                lastMonthPayments.totalAmount) /
                lastMonthPayments.totalAmount) *
              100
            : 100;
        setRevenueGrowth(currentMonthPayments.totalAmount);
        setRevenueChange(revenueChangeValue);

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
  }, [getAttendanceByDateRange, getPaymentsSummaryByDateRange, inventory]);

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
          Bienvenido al sistema de gestión escolar
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
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
                  }).format(revenueGrowth)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {revenueChange > 0 ? "+" : ""}
                  {revenueChange.toFixed(1)}% respecto al mes anterior
                </p>
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
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Datos</CardTitle>
              <CardDescription>
                Visualización de métricas y tendencias
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center">
              <p className="text-muted-foreground">
                Aquí se mostrarán gráficos y análisis detallados
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
