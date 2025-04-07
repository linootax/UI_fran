"use client";

import { useStudents } from "@/hooks/useStudents";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function RecentStudents() {
  const { students } = useStudents();

  // Get the 5 most recent students
  const recentStudents = [...students]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {recentStudents.map((student) => (
        <div key={student._id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{student.name}</p>
            <p className="text-sm text-muted-foreground">
              {student.grade} -{" "}
              {format(new Date(student.enrollmentDate), "PPP", { locale: es })}
            </p>
          </div>
          <div className="ml-auto font-medium">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                student.status === "Activo"
                  ? "bg-green-100 text-green-800"
                  : student.status === "Inactivo"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {student.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
