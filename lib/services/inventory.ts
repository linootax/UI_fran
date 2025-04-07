import { fetchApi } from "../api-config";

export interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  location: string;
  status: "Disponible" | "Agotado" | "Bajo stock";
  lastUpdated: string;
  description?: string;
  serialNumber?: string;
}

export interface InventoryFilters {
  category?: string;
  status?: InventoryItem["status"];
  location?: string;
}

export interface InventoryStats {
  statusStats: Array<{
    _id: InventoryItem["status"];
    count: number;
    totalItems: number;
  }>;
  categoryStats: Array<{
    _id: string;
    count: number;
    totalItems: number;
  }>;
}

export const inventoryService = {
  // Get all inventory items with optional filters
  getAll: async (filters?: InventoryFilters) => {
    const queryParams = new URLSearchParams();
    if (filters?.category) queryParams.append("category", filters.category);
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.location) queryParams.append("location", filters.location);

    return fetchApi<InventoryItem[]>(`/inventory?${queryParams.toString()}`);
  },

  // Get low stock items
  getLowStock: async () => {
    return fetchApi<InventoryItem[]>("/inventory/status/low-stock");
  },

  // Get inventory statistics
  getStats: async () => {
    return fetchApi<InventoryStats>("/inventory/stats/summary");
  },

  // Create a new inventory item
  create: async (item: Omit<InventoryItem, "_id">) => {
    return fetchApi<InventoryItem>("/inventory", {
      method: "POST",
      body: JSON.stringify(item),
    });
  },

  // Update an inventory item
  update: async (id: string, item: Partial<InventoryItem>) => {
    return fetchApi<InventoryItem>(`/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(item),
    });
  },

  // Delete an inventory item
  delete: async (id: string) => {
    return fetchApi<void>(`/inventory/${id}`, {
      method: "DELETE",
    });
  },
};
