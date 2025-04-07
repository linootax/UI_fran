import { DashboardLayout } from "@/components/dashboard-layout"
import { StudentsTable } from "@/components/students/students-table"

export default function StudentsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Alumnos</h1>
        </div>
        <StudentsTable />
      </div>
    </DashboardLayout>
  )
}

