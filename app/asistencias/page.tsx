import { DashboardLayout } from "@/components/dashboard-layout"
import { AttendanceTable } from "@/components/attendance/attendance-table"

export default function AttendancePage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Asistencias</h1>
        </div>
        <AttendanceTable />
      </div>
    </DashboardLayout>
  )
}

