"use client";

import { usePayments } from "@/hooks/usePayments";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function RecentPayments() {
  const { payments } = usePayments();

  // Get the 5 most recent payments
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {recentPayments.map((payment) => (
        <div key={payment._id} className="flex items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {payment.studentId.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(payment.date), "PPP", { locale: es })}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm font-medium">
              {new Intl.NumberFormat("es-MX", {
                style: "currency",
                currency: "MXN",
              }).format(payment.amount)}
            </p>
            <Badge
              variant={
                payment.status === "Pagado"
                  ? "default"
                  : payment.status === "Pendiente"
                  ? "secondary"
                  : "destructive"
              }
              className="mt-1"
            >
              {payment.status}
            </Badge>
          </div>
        </div>
      ))}
      <Button asChild variant="outline" className="w-full">
        <Link href="/pagos">Ver todos los pagos</Link>
      </Button>
    </div>
  );
}
