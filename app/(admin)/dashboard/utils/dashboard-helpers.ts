import { OrderStatus } from "../types/types";

export const formatRevenue = (revenue: number | string | undefined): string => {
  if (!revenue) return '0.00';
  const revenueNumber = typeof revenue === 'string' ? parseFloat(revenue) : revenue;
  if (isNaN(revenueNumber)) return '0.00';
  return revenueNumber.toFixed(2);
};

export const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ef4444',
  };
  return colors[status] || '#6b7280';
};

export const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};