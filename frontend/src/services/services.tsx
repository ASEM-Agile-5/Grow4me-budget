"use client";
import axios from "axios";
import { MenuItem, Vendor } from "../models/vendors";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  withCredentials: true,
});

// Helper functions for cookie management
export const setCookie = (name: string, value: string, days?: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
};

export const getCookie = (name: string) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = getCookie("access_token");
    if (token) {
      // Browsers handle "Cookie" headers automatically, but for JWTs, 
      // the Authorization header is more reliable in cross-origin scenarios.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getDashboardStatsAPI = async () => {
  try {
    const response = await api.get("dashboard/stats");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getVendorOrdersAPI = async (vendorId: string) => {
  try {
    const response = await api.post("vendors/orders", { vendor_id: vendorId });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getUserInfoAPI = async () => {
  try {
    const response = await api.get("user/get-user");
    // console.log(response)
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const addDroneAPI = async (
  name: string,
  model: string,
  maxPayload: string,
  droneStatus?: string,
  batteryLevel?: string,
  currentLocation?: string,
) => {
  try {
    const response = await api.post("drones/register", {
      name,
      model,
      max_payload: maxPayload,
      status: droneStatus,
      battery_level: batteryLevel,
      current_location: currentLocation,
    });

    return response;
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 401) {
      return { status: 401, message: "Unauthorized - Invalid credentials" };
    }
    throw error;
  }
};

export const editDroneAPI = async (
  id: string,
  name: string,
  model: string,
  maxPayload: string,
  droneStatus: string,
  batteryLevel: string,
  currentLocation: string,
) => {
  try {
    const response = await api.put(`drones/update/${id}`, {
      name,
      model,
      max_payload: maxPayload,
      status: droneStatus,
      battery_level: batteryLevel,
      current_location: currentLocation,
    });

    return response;
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 401) {
      return { status: 401, message: "Unauthorized - Invalid credentials" };
    }
    throw error;
  }
};
export const getCategoriesAPI = async () => {
  try {
    const response = await api.get("vendors/categories");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
export const getDronesAPI = async () => {
  // const token = localStorage.getItem("token");
  // if (!token) {
  //   throw new Error("Token is not present");
  // }
  try {
    const response = await api.get("drones/list");
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getVendorsAPI = async () => {
  try {
    const response = await api.get("vendors/vendors");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
export const editVendorsAPI = async (id: string, vendor: Vendor) => {
  try {
    const response = await api.put(`vendors/update/${id}`, vendor);
    return response.data;
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 401) {
      return { status: 401, message: "Unauthorized - Invalid credentials" };
    }
    throw error;
  }
};
export const getVendorMenuAPI = async (id: string) => {
  try {
    const response = await api.get(`vendors/menu/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteVendorMenuAPI = async (id: string) => {
  try {
    const response = await api.delete(`vendors/menu/delete/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};
export const editVendorMenuAPI = async (id: string, menu: MenuItem) => {
  try {
    const response = await api.put(`vendors/menu/update/${id}`, menu);
    return response.data;
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 401) {
      return { status: 401, message: "Unauthorized - Invalid credentials" };
    }
    throw error;
  }
};
export const addVendorMenuAPI = async (menu: MenuItem) => {
  try {
    const response = await api.post("vendors/menu/create", menu);
    return response.data;
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 401) {
      return { status: 401, message: "Unauthorized - Invalid credentials" };
    }
    throw error;
  }
};
export const addVendorAPI = async (vendor: Vendor) => {
  try {
    const response = await api.post("vendors/register", vendor);

    return response.data;
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 401) {
      return { status: 401, message: "Unauthorized - Invalid credentials" };
    }
    throw error;
  }
};

export const getOrdersAPI = async () => {
  try {
    const response = await api.get("order/all");
    // console.log(response.data)
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getOrderDetailsAPI = async (orderId: string) => {
  try {
    const response = await api.get("order/details", {
      params: { order_id: orderId },
    });
    return response.data;
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 401) {
      return { status: 401, message: "Unauthorized - Invalid credentials" };
    }
    throw error;
  }
};

export const updateOrderDeliveryAPI = async (order: {
  order_id: string;
  status?: string;
  assigned_drone?: string | null;
}) => {
  try {
    const response = await api.post("order/set-status", order);
    return response.data;
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 401) {
      return { status: 401, message: "Unauthorized - Invalid credentials" };
    }
    throw error;
  }
};

export const getProjectsDetailsAPI = async (id: string) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Token is not present");
  }
  try {
    console.log(id);

    const response = await api.get(`projects/details/${id}`);

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getUserProjectsAPI = async () => {
  try {
    const response = await api.get("projects/user");
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch user projects:", error);
    throw error;
  }
};

export const loginAPI = async (email: string, password: string) => {
  try {
    const response = await api.post("user/login", {
      email: email,
      password: password,
    });

    // Check if there's a token in the response body to store manually
    const token = response.data?.access_token || response.data?.token || response.data?.acces_token;
    if (token) {
      setCookie("access_token", token, 7); // Store for 7 days
    }

    return response;
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 401) {
      return { status: 401, message: "Unauthorized - Invalid credentials" };
    }
    throw error;
  }
};

// --- Budget API ---

export const createBudgetAPI = async (data: {
  name: string;
  project: string;
  year: number;
  description: string;
}) => {
  try {
    const response = await api.post("budget/create", data);
    return response.data;
  } catch (error: any) {
    console.error("Failed to create budget:", error);
    throw error;
  }
};

export const getBudgetsAPI = async () => {
  try {
    const response = await api.get("budget/all");
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch budgets:", error);
    throw error;
  }
};

export const getBudgetDetailsAPI = async (budgetId: string) => {
  try {
    const response = await api.get(`budget/details/${budgetId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch budget details for ${budgetId}:`, error);
    throw error;
  }
};

export const getBudgetCategoriesAPI = async () => {
  try {
    const response = await api.get("budget/categories");
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch budget categories:", error);
    throw error;
  }
};

export const createBudgetCategoryAPI = async (categoryName: string) => {
  try {
    const response = await api.post("budget/categories/create", {
      category_name: categoryName,
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to create category:", error);
    throw error;
  }
};

export const addBudgetItemAPI = async (data: {
  budget: string;
  category: string;
  planned_amount: number;
  inventory?: boolean;
  quantity?: number;
  units?: string;
}) => {
  try {
    const response = await api.post("budget/items/create", data);
    return response.data;
  } catch (error: any) {
    console.error("Failed to add budget item:", error);
    throw error;
  }
};

export const createExpenseAPI = async (data: {
  budget_item: string;
  amount: number;
  date: string;
  notes: string;
  quantity?: number;
}) => {
  try {
    const response = await api.post("budget/expenses/create", data);
    return response.data;
  } catch (error: any) {
    console.error("Failed to create expense:", error);
    throw error;
  }
};

export const getExpensesAPI = async () => {
  try {
    const response = await api.get("budget/expenses");
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch expenses:", error);
    throw error;
  }
};

export const getRecentExpensesAPI = async (budgetId: string) => {
  try {
    const response = await api.get(`budget/${budgetId}/recent-expenses`);
    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch recent expenses for ${budgetId}:`, error);
    throw error;
  }
};

export const getInventoryAPI = async (year?: number, project?: string) => {
  try {
    const response = await api.get("budget/inventory", {
      params: { year, project },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch inventory:", error);
    throw error;
  }
};

export const getInventoryHistoryAPI = async () => {
  try {
    const response = await api.get("budget/inventory/history");
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch inventory history:", error);
    throw error;
  }
};

export const adjustInventoryStockAPI = async (data: {
  budget_item: string;
  action: "add_stock" | "remove_stock";
  quantity: number;
  notes: string;
}) => {
  try {
    const response = await api.post("budget/inventory/edit", data);
    return response.data;
  } catch (error: any) {
    console.error("Failed to adjust inventory stock:", error);
    throw error;
  }
};

export const setInventoryMinimumAPI = async (data: {
  inventory_item: string;
  minimum_stock: number;
}) => {
  try {
    const response = await api.post("budget/inventory/set-minimum", data);
    return response.data;
  } catch (error: any) {
    console.error("Failed to set inventory minimum:", error);
    throw error;
  }
};

export const getDashboardSummaryAPI = async (year: number | string) => {
  try {
    const response = await api.get("budget/dashboard/summary", {
      params: { year },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch dashboard summary:", error);
    throw error;
  }
};

export const getMonthlyExpensesAPI = async (year: number | string) => {
  try {
    const response = await api.get("budget/dashboard/monthly-expenses", {
      params: { year },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch monthly expenses:", error);
    throw error;
  }
};

export const getCategoryExpensesAPI = async (budgetId: string) => {
  try {
    const response = await api.get("budget/dashboard/category-expenses", {
      params: { budget: budgetId },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch category expenses:", error);
    throw error;
  }
};

export const getSalesAPI = async () => {
  try {
    const response = await api.get("budget/sales");
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch sales:", error);
    throw error;
  }
};

export const createSaleAPI = async (data: {
  budget: string;
  product: string;
  quantity: number;
  price_per_unit: number;
  date: string;
  buyer: string;
  payment_status: string;
}) => {
  try {
    const response = await api.post("budget/sales/create", data);
    return response.data;
  } catch (error: any) {
    console.error("Failed to create sale:", error);
    throw error;
  }
};
