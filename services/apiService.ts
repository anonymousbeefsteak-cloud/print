import type { MenuCategory, Addon, OrderData, Order, OrderSummary, OptionsData, OrderStatus, SalesStatistics } from '../types';
import { MENU_DATA, ADDONS, SAUCE_CHOICES, DESSERT_CHOICES_A, DESSERT_CHOICES_B, PASTA_CHOICES_A, PASTA_CHOICES_B, COLD_NOODLE_CHOICES, SIMPLE_MEAL_CHOICES } from '../constants';

const API_URL = 'https://script.google.com/macros/s/AKfycbysg8PL7L7w9cnhkHwHhZVBwgZo70bVIA6C84KnkBc_g1wHQmUTfZnj46pr3YEol6QT/exec'; 

const generateFallbackOptions = (): OptionsData => ({
    sauces: SAUCE_CHOICES.map(s => ({ name: s, isAvailable: true })),
    dessertsA: DESSERT_CHOICES_A.map(s => ({ name: s, isAvailable: true })),
    dessertsB: DESSERT_CHOICES_B.map(s => ({ name: s, isAvailable: true })),
    pastasA: PASTA_CHOICES_A.map(s => ({ name: s, isAvailable: true })),
    pastasB: PASTA_CHOICES_B.map(s => ({ name: s, isAvailable: true })),
    coldNoodles: COLD_NOODLE_CHOICES.map(s => ({ name: s, isAvailable: true })),
    simpleMeals: SIMPLE_MEAL_CHOICES.map(s => ({ name: s, isAvailable: true })),
});


const apiService = {
  async getMenuAndAddons(): Promise<{ menu: MenuCategory[], addons: Addon[], options: OptionsData, from: 'api' | 'fallback', isQuietHours: boolean }> {
    try {
      const response = await fetch(`${API_URL}?action=getMenu`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      if (!data.menu || !data.addons || !data.options) throw new Error('Invalid data structure from API');
      
      const fallbackOptions = generateFallbackOptions();
      const finalOptions = {
          sauces: data.options.sauces?.length > 0 ? data.options.sauces : fallbackOptions.sauces,
          dessertsA: data.options.dessertsA?.length > 0 ? data.options.dessertsA : fallbackOptions.dessertsA,
          dessertsB: data.options.dessertsB?.length > 0 ? data.options.dessertsB : fallbackOptions.dessertsB,
          pastasA: data.options.pastasA?.length > 0 ? data.options.pastasA : fallbackOptions.pastasA,
          pastasB: data.options.pastasB?.length > 0 ? data.options.pastasB : fallbackOptions.pastasB,
          coldNoodles: data.options.coldNoodles?.length > 0 ? data.options.coldNoodles : fallbackOptions.coldNoodles,
          simpleMeals: data.options.simpleMeals?.length > 0 ? data.options.simpleMeals : fallbackOptions.simpleMeals,
      };

      return { ...data, options: finalOptions, from: 'api', isQuietHours: data.isQuietHours || false };
    } catch (error) {
      console.warn("API fetch failed, using fallback.", error);
      return { menu: MENU_DATA, addons: ADDONS, options: generateFallbackOptions(), from: 'fallback', isQuietHours: false };
    }
  },

  async submitOrder(orderData: OrderData): Promise<{ success: boolean; orderId?: string; message?: string; }> {
    try {
      const payload = {
        action: 'createOrder',
        orderData: {
            ...orderData,
            items: JSON.stringify(orderData.items)
        },
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error("Failed to submit order:", error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred during order submission.';
      throw new Error(message);
    }
  },

  async getOrder(orderId: string): Promise<{ success: boolean; order?: Order, message?: string }> {
    try {
      const response = await fetch(`${API_URL}?action=getOrder&orderId=${orderId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error(`Failed to get order ${orderId}:`, error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      return { success: false, message };
    }
  },
  
  async searchOrders(params: { name?: string; phone?: string; startDate?: string; endDate?: string; }): Promise<{ success: boolean; orders?: OrderSummary[]; message?: string; }> {
    try {
        const query = new URLSearchParams({ action: 'searchOrders' });
        if (params.name) query.append('name', params.name);
        if (params.phone) query.append('phone', params.phone);
        if (params.startDate) query.append('startDate', params.startDate);
        if (params.endDate) query.append('endDate', params.endDate);
        
        const response = await fetch(`${API_URL}?${query.toString()}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error("Failed to search orders:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, message };
    }
  },

  // FIX: Implement getAllOrders for the admin dashboard.
  async getAllOrders(): Promise<{ success: boolean; orders?: Order[]; message?: string; }> {
    try {
      const response = await fetch(`${API_URL}?action=getAllOrders`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error("Failed to get all orders:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      return { success: false, message };
    }
  },

  // FIX: Implement getSalesStatistics for the admin dashboard.
  async getSalesStatistics(startDate: string, endDate: string): Promise<{ success: boolean; stats?: SalesStatistics; message?: string; }> {
    try {
      const query = new URLSearchParams({ action: 'getSalesStatistics', startDate, endDate });
      const response = await fetch(`${API_URL}?${query.toString()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error("Failed to get sales statistics:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      return { success: false, message };
    }
  },

  // FIX: Implement updateOrderStatus for the admin dashboard.
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ success: boolean; message?: string; }> {
    try {
      const payload = {
        action: 'updateOrderStatus',
        orderId,
        status,
      };
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error("Failed to update order status:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      return { success: false, message };
    }
  },

  // FIX: Implement updateAvailability for the store management panel.
  async updateAvailability(availability: any): Promise<{ success: boolean; message?: string; }> {
    try {
      const payload = {
        action: 'updateAvailability',
        // Stringify the inner object, as the outer payload will be stringified again.
        availability: JSON.stringify(availability),
      };
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error("Failed to update availability:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      return { success: false, message };
    }
  },

  // FIX: Implement updateQuietHoursStatus for the store management panel.
  async updateQuietHoursStatus(isQuietHours: boolean): Promise<{ success: boolean; message?: string; }> {
    try {
      const payload = {
        action: 'updateQuietHoursStatus',
        isQuietHours,
      };
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error("Failed to update quiet hours status:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      return { success: false, message };
    }
  },
};

export { apiService };
