import { useState, useEffect } from "react";
import { api, InventoryItem } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface InventoryFilters {
  category?: string;
  status?: string;
  location?: string;
}

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await api.getAllInventory();
      setInventory(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar el inventario"
      );
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar el inventario",
      });
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (item: Omit<InventoryItem, "_id">) => {
    try {
      const newItem = await api.createInventoryItem(item);
      setInventory((prev) => [...prev, newItem]);
      toast({
        title: "Éxito",
        description: "Item creado correctamente",
      });
      return newItem;
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el item",
      });
      throw err;
    }
  };

  const updateItem = async (id: string, item: Partial<InventoryItem>) => {
    try {
      const updatedItem = await api.updateInventoryItem(id, item);
      setInventory((prev) => prev.map((i) => (i._id === id ? updatedItem : i)));
      toast({
        title: "Éxito",
        description: "Item actualizado correctamente",
      });
      return updatedItem;
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el item",
      });
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await api.deleteInventoryItem(id);
      setInventory((prev) => prev.filter((i) => i._id !== id));
      toast({
        title: "Éxito",
        description: "Item eliminado correctamente",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el item",
      });
      throw err;
    }
  };

  const getLowStockItems = () => {
    return inventory.filter((item) => item.quantity <= item.minimumQuantity);
  };

  const getItemsByCategory = (category: string) => {
    return inventory.filter((item) => item.category === category);
  };

  const getItemsByStatus = (status: InventoryItem["status"]) => {
    return inventory.filter((item) => item.status === status);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    inventory,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    getLowStockItems,
    getItemsByCategory,
    getItemsByStatus,
    refreshInventory: fetchInventory,
  };
}
