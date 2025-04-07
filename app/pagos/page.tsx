import { DashboardLayout } from "@/components/dashboard-layout"
import { PaymentsTable } from "@/components/payments/payments-table"

export default function PaymentsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Pagos</h1>
        </div>
        <PaymentsTable />
      </div>
    </DashboardLayout>
  )
}

