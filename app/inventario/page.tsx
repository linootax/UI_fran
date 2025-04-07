import { DashboardLayout } from "@/components/dashboard-layout"
import { InventoryTable } from "@/components/inventory/inventory-table"

export default function InventoryPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
        </div>
        <InventoryTable />
      </div>
    </DashboardLayout>
  )
}

