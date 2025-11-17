// FIX: Define DonenessLevel to resolve circular dependency.
export type DonenessLevel = '3分熟' | '5分熟' | '7分熟' | '全熟';

export interface SingleChoiceAddon {
  price: number;
  options: string[];
}

export interface MultiChoice {
  title: string;
  options: string[];
}

export interface ComponentChoice {
  title: string;
  options: string[];
}

export interface SideChoice {
  title: string;
  options: string[];
  choices: number;
}

export interface MenuItemCustomizations {
  doneness?: boolean;
  sauceChoice?: boolean;
  saucesPerItem?: number;
  drinkChoice?: boolean;
  dessertChoice?: boolean;
  pastaChoice?: boolean;
  componentChoice?: ComponentChoice; 
  notes?: boolean;
  singleChoiceAddon?: SingleChoiceAddon;
  multiChoice?: MultiChoice;
  sideChoice?: SideChoice;
}

export interface MenuItem {
  id: string;
  name: string;
  shortName?: string;
  weight?: string;
  price: number;
  description?: string;
  customizations: MenuItemCustomizations;
  isAvailable: boolean;
}

export interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

export interface Option {
    name: string;
    isAvailable: boolean;
}

export interface OptionsData {
    sauces: Option[];
    dessertsA: Option[];
    dessertsB: Option[];
    pastasA: Option[];
    pastasB: Option[];
    coldNoodles: Option[];
    simpleMeals?: Option[];
}


export interface SelectedAddon extends Addon {
    quantity: number;
}

export interface SelectedSauce {
    name:string;
    quantity: number;
}

export interface SelectedDessert {
    name: string;
    quantity: number;
}

export interface SelectedPasta {
    name: string;
    quantity: number;
}

export interface CartItem {
  cartId: string;
  cartKey: string;
  item: MenuItem;
  quantity: number;
  categoryTitle: string;
  selectedDonenesses?: Partial<Record<DonenessLevel, number>>;
  selectedDrinks?: { [key: string]: number };
  selectedAddons?: SelectedAddon[];
  selectedSauces?: SelectedSauce[];
  selectedDesserts?: SelectedDessert[];
  selectedPastas?: SelectedPasta[];
  selectedComponent?: { [key: string]: number }; 
  selectedNotes?: string;
  selectedSingleChoiceAddon?: string;
  selectedMultiChoice?: { [key: string]: number };
  selectedSideChoices?: { [key: string]: number };
  totalPrice: number;
}

export interface CustomerInfo {
    name: string;
    phone: string;
    tableNumber: string;
}

export type OrderType = '內用' | '外帶';
export type OrderStatus = '待店長確認' | '待處理' | '製作中' | '可以取餐' | '已完成' | '錯誤';


export interface OrderData {
    items: CartItem[];
    totalPrice: number;
    customerInfo: CustomerInfo;
    orderType: OrderType;
}

export interface Order {
    id: string;
    status: OrderStatus;
    orderType: OrderType;
    items: CartItem[];
    customerInfo: CustomerInfo;
    totalPrice: number;
    createdAt: string;
}

export interface OrderSummary {
    id: string;
    customerName: string;
    totalAmount: number;
    timestamp: string;
}

export interface PopularItem {
    name: string;
    quantity: number;
    revenue: number;
}

export interface SalesTrendData {
    date: string; 
    revenue: number;
}

export interface SalesStatistics {
    totalRevenue: number;
    orderCount: number;
    popularItems: PopularItem[];
    salesTrend: SalesTrendData[];
}