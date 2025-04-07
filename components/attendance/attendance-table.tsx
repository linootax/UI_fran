"use client";

import { useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnFiltersState,
  getFilteredRowModel,
  type SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAttendance } from "@/hooks/useAttendance";
import { useStudents } from "@/hooks/useStudents";
import { Loading } from "@/components/ui/loading";
import { Error } from "@/components/ui/error";
import { useToast } from "@/components/ui/use-toast";
import { AttendanceRecord } from "@/lib/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

const columns: ColumnDef<AttendanceRecord>[] = [
  {
    accessorKey: "studentId",
    header: "Alumno",
    cell: ({ row }) => {
      const student = row.original.studentId;
      if (!student) {
        return (
          <div className="text-muted-foreground">Alumno no encontrado</div>
        );
      }
      return (
        <div className="flex flex-col">
          <span className="font-medium">{student.name}</span>
          <span className="text-xs text-muted-foreground">{student.grade}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Fecha",
    cell: ({ row }) => {
      return format(new Date(row.original.date), "PPP", { locale: es });
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={
            status === "Presente"
              ? "default"
              : status === "Ausente"
              ? "destructive"
              : "secondary"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "notes",
    header: "Notas",
  },
];

export function AttendanceTable() {
  const { toast } = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newAttendance, setNewAttendance] = useState({
    studentId: "",
    status: "Presente" as "Presente" | "Ausente" | "Retardo",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { students } = useStudents();
  const {
    attendance,
    loading,
    error,
    filters,
    updateFilters,
    createAttendance,
  } = useAttendance();

  const handleCreateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createAttendance({
        ...newAttendance,
        date: selectedDate.toISOString().split("T")[0],
      });
      setIsAddDialogOpen(false);
      setNewAttendance({
        studentId: "",
        status: "Presente",
        notes: "",
      });
      toast({
        title: "Éxito",
        description: "La asistencia ha sido registrada correctamente.",
      });
    } catch (err) {
      console.error("Failed to create attendance:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "No se pudo registrar la asistencia. Por favor, intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const table = useReactTable({
    data: attendance,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error title="Error al cargar asistencias" message={error} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Select
            value={filters.status}
            onValueChange={(value) => updateFilters({ status: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Presente">Presente</SelectItem>
              <SelectItem value="Ausente">Ausente</SelectItem>
              <SelectItem value="Retardo">Retardo</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.studentId}
            onValueChange={(value) => updateFilters({ studentId: value })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por alumno" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student._id} value={student._id}>
                  {student.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Asistencia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Asistencia</DialogTitle>
              <DialogDescription>
                Ingresa los datos de asistencia.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAttendance}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="student" className="text-right">
                    Alumno
                  </Label>
                  <Select
                    value={newAttendance.studentId}
                    onValueChange={(value) =>
                      setNewAttendance((prev) => ({
                        ...prev,
                        studentId: value,
                      }))
                    }
                    required
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar alumno" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student._id} value={student._id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Fecha</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "col-span-3 justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => setSelectedDate(date || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Estado
                  </Label>
                  <Select
                    value={newAttendance.status}
                    onValueChange={(
                      value: "Presente" | "Ausente" | "Retardo"
                    ) =>
                      setNewAttendance((prev) => ({ ...prev, status: value }))
                    }
                    required
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Presente">Presente</SelectItem>
                      <SelectItem value="Ausente">Ausente</SelectItem>
                      <SelectItem value="Retardo">Retardo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notas
                  </Label>
                  <Input
                    id="notes"
                    value={newAttendance.notes}
                    onChange={(e) =>
                      setNewAttendance((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
