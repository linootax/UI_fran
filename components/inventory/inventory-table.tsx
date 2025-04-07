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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus } from "lucide-react";
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
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { useInventory } from "@/hooks/useInventory";
import { type InventoryItem } from "@/lib/api";
import { Loading } from "@/components/ui/loading";
import { Error } from "@/components/ui/error";
import { toast } from "@/components/ui/use-toast";

export function InventoryTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState<Omit<InventoryItem, "_id">>({
    name: "",
    description: "",
    quantity: 0,
    category: "",
    status: "Disponible",
    lastUpdated: new Date().toISOString(),
    location: "",
    minimumQuantity: 0,
    cost: 0,
  });

  const {
    inventory,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    getItemsByCategory,
  } = useInventory();

  const formatDateToYYYYMMDD = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const handleCreateItem = async () => {
    try {
      // Validate required fields
      if (!newItem.name || !newItem.category || !newItem.location) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Por favor complete todos los campos requeridos",
        });
        return;
      }

      // Validate numeric fields
      if (
        newItem.quantity < 0 ||
        newItem.minimumQuantity < 0 ||
        newItem.cost < 0
      ) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Los valores numéricos deben ser mayores o iguales a 0",
        });
        return;
      }

      console.log("Attempting to create item:", newItem);
      const createdItem = await createItem({
        ...newItem,
        status: "Disponible",
        lastUpdated: formatDateToYYYYMMDD(new Date()),
      });

      if (!createdItem?._id) {
        console.error("Error: No se recibió confirmación del servidor");
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se recibió confirmación del servidor",
        });
        return;
      }

      console.log("Item created successfully:", createdItem);
      toast({
        title: "Éxito",
        description: "Item creado correctamente",
      });

      setIsAddDialogOpen(false);
      setNewItem({
        name: "",
        description: "",
        quantity: 0,
        category: "",
        status: "Disponible",
        lastUpdated: formatDateToYYYYMMDD(new Date()),
        location: "",
        minimumQuantity: 0,
        cost: 0,
      });
    } catch (err: unknown) {
      console.error("Error creating item:", err);
      const errorMessage = "Error al crear el item";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const handleUpdateItem = async () => {
    if (!selectedItem) return;

    try {
      if (
        !selectedItem.name ||
        !selectedItem.category ||
        !selectedItem.location
      ) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Por favor complete todos los campos requeridos",
        });
        return;
      }

      console.log("Attempting to update item:", selectedItem);
      const updatedItem = await updateItem(selectedItem._id, {
        ...selectedItem,
        lastUpdated: formatDateToYYYYMMDD(new Date()),
      });

      console.log("Item updated successfully:", updatedItem);
      toast({
        title: "Éxito",
        description: "Item actualizado correctamente",
      });

      setIsEditDialogOpen(false);
      setSelectedItem(null);
    } catch (err: unknown) {
      console.error("Error updating item:", err);
      const errorMessage = "Error al actualizar el item";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      console.log("Attempting to delete item:", id);
      await deleteItem(id);

      console.log("Item deleted successfully");
      toast({
        title: "Éxito",
        description: "Item eliminado correctamente",
      });
    } catch (err: unknown) {
      console.error("Error deleting item:", err);
      const errorMessage = "Error al eliminar el item";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => {
        return <div className="font-medium">{row.original.name}</div>;
      },
    },
    {
      accessorKey: "category",
      header: "Categoría",
    },
    {
      accessorKey: "quantity",
      header: "Cantidad",
      cell: ({ row }) => {
        const quantity = row.original.quantity;
        const minimumQuantity = row.original.minimumQuantity;
        return (
          <div
            className={
              quantity <= minimumQuantity ? "text-red-500 font-medium" : ""
            }
          >
            {quantity}
          </div>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Ubicación",
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.original.status;

        return (
          <Badge
            variant={
              status === "Disponible"
                ? "default"
                : status === "Mantenimiento"
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
      accessorKey: "lastUpdated",
      header: "Última Actualización",
      cell: ({ row }) => {
        const date = new Date(row.original.lastUpdated);
        return format(date, "dd/MM/yyyy");
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;

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
                  setSelectedItem(item);
                  setIsEditDialogOpen(true);
                }}
              >
                Editar item
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDeleteItem(item._id)}
              >
                Eliminar item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: inventory,
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

  if (loading) return <Loading />;
  if (error) {
    return <Error title="Error" message={error} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) =>
              table
                .getColumn("category")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="Libros">Libros</SelectItem>
              <SelectItem value="Electrónica">Electrónica</SelectItem>
              <SelectItem value="Mobiliario">Mobiliario</SelectItem>
              <SelectItem value="Papelería">Papelería</SelectItem>
              <SelectItem value="Vestimenta">Vestimenta</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Buscar items..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Agregar Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Item</DialogTitle>
              <DialogDescription>
                Complete el formulario para agregar un nuevo item al inventario.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Categoría
                </Label>
                <Select
                  value={newItem.category}
                  onValueChange={(value) =>
                    setNewItem({ ...newItem, category: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Libros">Libros</SelectItem>
                    <SelectItem value="Electrónica">Electrónica</SelectItem>
                    <SelectItem value="Mobiliario">Mobiliario</SelectItem>
                    <SelectItem value="Papelería">Papelería</SelectItem>
                    <SelectItem value="Vestimenta">Vestimenta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Cantidad
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem({ ...newItem, quantity: Number(e.target.value) })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minimumQuantity" className="text-right">
                  Cantidad Mínima
                </Label>
                <Input
                  id="minimumQuantity"
                  type="number"
                  value={newItem.minimumQuantity}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      minimumQuantity: Number(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cost" className="text-right">
                  Costo
                </Label>
                <Input
                  id="cost"
                  type="number"
                  value={newItem.cost}
                  onChange={(e) =>
                    setNewItem({ ...newItem, cost: Number(e.target.value) })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Ubicación
                </Label>
                <Select
                  value={newItem.location}
                  onValueChange={(value) =>
                    setNewItem({ ...newItem, location: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar ubicación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC Diga Center">
                      CC Diga Center
                    </SelectItem>
                    <SelectItem value="Sede La soledad">
                      Sede La Soledad
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateItem}>
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Item</DialogTitle>
              <DialogDescription>
                Modifique los datos del item.
              </DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="edit-name"
                    value={selectedItem.name}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, name: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">
                    Categoría
                  </Label>
                  <Select
                    value={selectedItem.category}
                    onValueChange={(value) =>
                      setSelectedItem({ ...selectedItem, category: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Libros">Libros</SelectItem>
                      <SelectItem value="Electrónica">Electrónica</SelectItem>
                      <SelectItem value="Mobiliario">Mobiliario</SelectItem>
                      <SelectItem value="Papelería">Papelería</SelectItem>
                      <SelectItem value="Vestimenta">Vestimenta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-quantity" className="text-right">
                    Cantidad
                  </Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={selectedItem.quantity}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        quantity: Number(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-minimumQuantity" className="text-right">
                    Cantidad Mínima
                  </Label>
                  <Input
                    id="edit-minimumQuantity"
                    type="number"
                    value={selectedItem.minimumQuantity}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        minimumQuantity: Number(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-cost" className="text-right">
                    Costo
                  </Label>
                  <Input
                    id="edit-cost"
                    type="number"
                    value={selectedItem.cost}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        cost: Number(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-location" className="text-right">
                    Ubicación
                  </Label>
                  <Select
                    value={selectedItem.location}
                    onValueChange={(value) =>
                      setSelectedItem({ ...selectedItem, location: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar ubicación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Almacén A">Almacén A</SelectItem>
                      <SelectItem value="Almacén B">Almacén B</SelectItem>
                      <SelectItem value="Almacén C">Almacén C</SelectItem>
                      <SelectItem value="Almacén D">Almacén D</SelectItem>
                      <SelectItem value="Sala de Cómputo">
                        Sala de Cómputo
                      </SelectItem>
                      <SelectItem value="Sala de Conferencias">
                        Sala de Conferencias
                      </SelectItem>
                      <SelectItem value="Gimnasio">Gimnasio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="edit-description" className="text-right pt-2">
                    Descripción
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={selectedItem.description}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        description: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="submit" onClick={handleUpdateItem}>
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
                  No se encontraron resultados.
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
