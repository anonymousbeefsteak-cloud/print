export interface MenuItem {
    id: string;
    name: string;
    price: number;
    description: string;
    isAvailable: boolean;
    customizations: {
        doneness?: string[];
        sauces?: string[];
        drinks?: string[];
        addons?: Addon[];
        singleChoiceAddon?: {
            options: string[];
            price: number;
        };
    };
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
}

export interface CartItem {
    cartId: string;
    cartKey: string;
    item: MenuItem;
    quantity: number;
    categoryTitle: string;
    selectedDonenesses: Record<string, number>;
    selectedDrinks: Record<string, number>;
    selectedSideChoices: Record<string, number>;
    selectedAddons: any[];
    selectedSauces: Record<string, number>;
    selectedDesserts: Record<string, number>;
    selectedPastas: Record<string, number>;
    selectedComponent: Record<string, number>;
    selectedNotes: string;
    selectedSingleChoiceAddon: string | null;
    selectedMultiChoice: Record<string, number>;
    totalPrice: number;
}

export interface OrderData {
    items: CartItem[];
    total: number;
    orderType: 'dineIn' | 'takeout';
    customerInfo?: {
        name: string;
        phone: string;
    };
}

export interface OptionsData {
    sauces: string[];
    dessertsA: string[];
    dessertsB: string[];
    pastasA: string[];
    pastasB: string[];
    coldNoodles: string[];
}
