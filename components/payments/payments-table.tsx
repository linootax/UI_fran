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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  XCircle,
} from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { usePayments } from "@/hooks/usePayments";
import { useStudents } from "@/hooks/useStudents";
import { Loading } from "@/components/ui/loading";
import { Error } from "@/components/ui/error";
import { useToast } from "@/components/ui/use-toast";
import { Payment } from "@/lib/api";

export function PaymentsTable() {
  const { toast } = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newPayment, setNewPayment] = useState({
    studentId: "",
    amount: "",
    concept: "",
    status: "Pendiente" as "Pagado" | "Pendiente" | "Cancelado",
    paymentMethod: "Efectivo" as "Efectivo" | "Transferencia",
    receiptNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { students } = useStudents();
  const {
    payments,
    loading,
    error,
    filters,
    updateFilters,
    createPayment,
    updatePayment,
  } = usePayments();

  // Move columns definition here
  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "studentId",
      header: "Alumno",
      cell: ({ row }) => {
        const student = row.original.studentId;
        if (!student || !student.name) {
          return (
            <div className="text-muted-foreground">Sin estudiante asignado</div>
          );
        }
        return (
          <div className="flex flex-col">
            <span className="font-medium">{student.name}</span>
            <span className="text-xs text-muted-foreground">
              {student.grade}
            </span>
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
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => {
        return new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        }).format(row.original.amount);
      },
    },
    {
      accessorKey: "concept",
      header: "Concepto",
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === "Pagado"
                ? "default"
                : status === "Pendiente"
                ? "secondary"
                : "destructive"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "paymentMethod",
      header: "Método de Pago",
    },
    {
      accessorKey: "receiptNumber",
      header: "Referencia",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const payment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPayment(payment);
                  setIsEditDialogOpen(true);
                }}
              >
                Editar pago
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!newPayment.studentId || !newPayment.amount || !newPayment.concept) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Por favor, completa todos los campos requeridos.",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate amount is a positive number
      if (parseFloat(newPayment.amount) <= 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "El monto debe ser mayor a 0.",
        });
        setIsSubmitting(false);
        return;
      }

      const student = students.find((s) => s._id === newPayment.studentId);
      if (!student) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Estudiante no encontrado. Por favor, selecciona un estudiante válido.",
        });
        setIsSubmitting(false);
        return;
      }

      await createPayment({
        ...newPayment,
        studentId: {
          _id: student._id,
          name: student.name,
          grade: student.grade,
        },
        amount: parseFloat(newPayment.amount),
        date: selectedDate.toISOString().split("T")[0],
      });

      setIsAddDialogOpen(false);
      setNewPayment({
        studentId: "",
        amount: "",
        concept: "",
        status: "Pendiente",
        paymentMethod: "Efectivo",
        receiptNumber: "",
      });
      setSelectedDate(new Date());
      toast({
        title: "Éxito",
        description: "El pago ha sido registrado correctamente.",
      });
    } catch (err) {
      console.error("Failed to create payment:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "No se pudo registrar el pago. Por favor, intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment?._id) return;

    try {
      setIsSubmitting(true);

      // Validate required fields
      if (
        !selectedPayment.studentId._id ||
        !selectedPayment.amount ||
        !selectedPayment.concept
      ) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Por favor, completa todos los campos requeridos.",
        });
        return;
      }

      // Validate amount is a positive number
      if (selectedPayment.amount <= 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "El monto debe ser mayor a 0.",
        });
        return;
      }

      const student = students.find(
        (s) => s._id === selectedPayment.studentId._id
      );
      if (!student) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Estudiante no encontrado. Por favor, selecciona un estudiante válido.",
        });
        return;
      }

      await updatePayment(selectedPayment._id, {
        ...selectedPayment,
        studentId: {
          _id: student._id,
          name: student.name,
          grade: student.grade,
        },
        date: new Date(selectedPayment.date).toISOString().split("T")[0],
      });

      setIsEditDialogOpen(false);
      setSelectedPayment(null);
      toast({
        title: "Éxito",
        description: "El pago ha sido actualizado correctamente.",
      });
    } catch (err) {
      console.error("Failed to update payment:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "No se pudo actualizar el pago. Por favor, intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const table = useReactTable({
    data: payments,
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
    return <Error title="Error al cargar pagos" message={error} />;
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
              <SelectItem value="Pagado">Pagado</SelectItem>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
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
              Nuevo Pago
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Pago</DialogTitle>
              <DialogDescription>Ingresa los datos del pago.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePayment}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="student" className="text-right">
                    Alumno
                  </Label>
                  <Select
                    value={newPayment.studentId}
                    onValueChange={(value) =>
                      setNewPayment((prev) => ({ ...prev, studentId: value }))
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
                  <Label htmlFor="amount" className="text-right">
                    Monto
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newPayment.amount}
                    onChange={(e) =>
                      setNewPayment((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="concept" className="text-right">
                    Concepto
                  </Label>
                  <Input
                    id="concept"
                    value={newPayment.concept}
                    onChange={(e) =>
                      setNewPayment((prev) => ({
                        ...prev,
                        concept: e.target.value,
                      }))
                    }
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Estado
                  </Label>
                  <Select
                    value={newPayment.status}
                    onValueChange={(
                      value: "Pagado" | "Pendiente" | "Cancelado"
                    ) => setNewPayment((prev) => ({ ...prev, status: value }))}
                    required
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pagado">Pagado</SelectItem>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="paymentMethod" className="text-right">
                    Método de Pago
                  </Label>
                  <Select
                    value={newPayment.paymentMethod}
                    onValueChange={(value: "Efectivo" | "Transferencia") =>
                      setNewPayment((prev) => ({
                        ...prev,
                        paymentMethod: value,
                      }))
                    }
                    required
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Efectivo">Efectivo</SelectItem>

                      <SelectItem value="Transferencia">
                        Transferencia
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="receiptNumber" className="text-right">
                    Referencia
                  </Label>
                  <Input
                    id="receiptNumber"
                    value={newPayment.receiptNumber}
                    onChange={(e) =>
                      setNewPayment((prev) => ({
                        ...prev,
                        receiptNumber: e.target.value,
                      }))
                    }
                    className="col-span-3"
                    required
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

      {/* Add Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pago</DialogTitle>
            <DialogDescription>Modifica los datos del pago.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditPayment}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-student" className="text-right">
                  Alumno
                </Label>
                <Select
                  value={selectedPayment?.studentId._id || ""}
                  onValueChange={(value) =>
                    setSelectedPayment((prev) =>
                      prev
                        ? {
                            ...prev,
                            studentId: {
                              ...prev.studentId,
                              _id: value,
                            },
                          }
                        : null
                    )
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
                        !selectedPayment?.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedPayment?.date ? (
                        format(new Date(selectedPayment.date), "PPP", {
                          locale: es,
                        })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        selectedPayment?.date
                          ? new Date(selectedPayment.date)
                          : undefined
                      }
                      onSelect={(date) =>
                        setSelectedPayment((prev) =>
                          prev
                            ? {
                                ...prev,
                                date:
                                  date?.toISOString() ||
                                  new Date().toISOString(),
                              }
                            : null
                        )
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-amount" className="text-right">
                  Monto
                </Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  value={selectedPayment?.amount || ""}
                  onChange={(e) =>
                    setSelectedPayment((prev) =>
                      prev
                        ? { ...prev, amount: parseFloat(e.target.value) }
                        : null
                    )
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-concept" className="text-right">
                  Concepto
                </Label>
                <Input
                  id="edit-concept"
                  value={selectedPayment?.concept || ""}
                  onChange={(e) =>
                    setSelectedPayment((prev) =>
                      prev ? { ...prev, concept: e.target.value } : null
                    )
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Estado
                </Label>
                <Select
                  value={selectedPayment?.status || ""}
                  onValueChange={(value: Payment["status"]) =>
                    setSelectedPayment((prev) =>
                      prev ? { ...prev, status: value } : null
                    )
                  }
                  required
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pagado">Pagado</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-paymentMethod" className="text-right">
                  Método de Pago
                </Label>
                <Select
                  value={selectedPayment?.paymentMethod || ""}
                  onValueChange={(value: Payment["paymentMethod"]) =>
                    setSelectedPayment((prev) =>
                      prev ? { ...prev, paymentMethod: value } : null
                    )
                  }
                  required
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>

                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-receiptNumber" className="text-right">
                  Referencia
                </Label>
                <Input
                  id="edit-receiptNumber"
                  value={selectedPayment?.receiptNumber || ""}
                  onChange={(e) =>
                    setSelectedPayment((prev) =>
                      prev ? { ...prev, receiptNumber: e.target.value } : null
                    )
                  }
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedPayment(null);
                }}
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
  );
}
