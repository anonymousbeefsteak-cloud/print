import React, { useState, useEffect, useMemo } from 'react';
import type {
  MenuItem,
  MenuCategory,
  Addon,
  SelectedAddon,
  DonenessLevel,
  SelectedSauce,
  SelectedDessert,
  SelectedPasta,
  CartItem,
  OptionsData
} from '../types';
import { DONENESS_LEVELS, DRINK_CHOICES } from '../constants';
import { PlusIcon, MinusIcon, CloseIcon } from './icons';

interface ItemModalProps {
  selectedItem: { item: MenuItem; category: MenuCategory };
  editingItem: CartItem | null;
  addons: Addon[];
  options: OptionsData;
  onClose: () => void;
  onConfirmSelection: (item: MenuItem, quantity: number, options: any, category: MenuCategory) => void;
}

const ItemModal: React.FC<ItemModalProps> = ({ selectedItem, editingItem, addons: allAddons, options, onClose, onConfirmSelection }) => {
  const { item, category } = selectedItem;
  const custom = item.customizations;

  const [quantity, setQuantity] = useState(1);
  const [selectedDonenesses, setSelectedDonenesses] = useState<Partial<Record<DonenessLevel, number>>>({});
  const [selectedSauces, setSelectedSauces] = useState<SelectedSauce[]>([]);
  const [selectedDrinks, setSelectedDrinks] = useState<{ [key: string]: number }>({});
  const [selectedDesserts, setSelectedDesserts] = useState<SelectedDessert[]>([]);
  const [selectedPastas, setSelectedPastas] = useState<SelectedPasta[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<{ [key: string]: number }>({});
  const [selectedSideChoices, setSelectedSideChoices] = useState<{ [key: string]: number }>({});
  const [selectedMultiChoice, setSelectedMultiChoice] = useState<{ [key: string]: number }>({});
  const [selectedSingleChoiceAddon, setSelectedSingleChoiceAddon] = useState<string | undefined>(undefined);
  const [selectedNotes, setSelectedNotes] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize state from editingItem or reset for new item
  useEffect(() => {
    if (editingItem) {
      setQuantity(editingItem.quantity);
      setSelectedDonenesses(editingItem.selectedDonenesses || {});
      setSelectedSauces(editingItem.selectedSauces || []);
      setSelectedDrinks(editingItem.selectedDrinks || {});
      setSelectedDesserts(editingItem.selectedDesserts || []);
      setSelectedPastas(editingItem.selectedPastas || []);
      setSelectedComponent(editingItem.selectedComponent || {});
      setSelectedSideChoices(editingItem.selectedSideChoices || {});
      setSelectedMultiChoice(editingItem.selectedMultiChoice || {});
      setSelectedSingleChoiceAddon(editingItem.selectedSingleChoiceAddon);
      setSelectedNotes(editingItem.selectedNotes || '');
      setSelectedAddons(editingItem.selectedAddons || []);
    } else {
      setQuantity(1);
      setSelectedDonenesses({});
      setSelectedSauces([]);
      setSelectedDrinks({});
      setSelectedDesserts([]);
      setSelectedPastas([]);
      setSelectedComponent({});
      setSelectedSideChoices({});
      setSelectedMultiChoice({});
      setSelectedSingleChoiceAddon(undefined);
      setSelectedNotes('');
      setSelectedAddons([]);
    }
  }, [editingItem]);

  // Generic handler for simple key-value pair options
  const handleOptionChange = (
    setter: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>,
    name: string,
    change: number,
    limit: number
  ) => {
    setValidationError(null);
    setter(prev => {
      const currentCount = prev[name] || 0;
      const newCount = Math.max(0, currentCount + change);
      // FIX: Add explicit types to reduce function to resolve 'unknown' type errors.
      const totalCount = Object.values({ ...prev, [name]: newCount }).reduce((a: number, b: number) => a + b, 0);
      if (totalCount > limit) return prev;
      const newObject = { ...prev, [name]: newCount };
      if (newCount === 0) delete newObject[name];
      return newObject;
    });
  };

  // Generic handler for options stored as an array of objects
  const handleArrayOfObjectsChange = <T extends { name: string; quantity: number; }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    name: string,
    change: number,
    limit: number,
    group?: string[]
  ) => {
    setValidationError(null);
    setter(prev => {
      const itemsToConsider = group ? prev.filter(item => group.includes(item.name)) : prev;
      const totalCount = itemsToConsider.reduce((sum, item) => sum + item.quantity, 0);
      const existingItem = prev.find(item => item.name === name);
      const newQuantity = (existingItem?.quantity || 0) + change;

      if (newQuantity > (existingItem?.quantity || 0) && totalCount >= limit) {
        return prev;
      }

      if (newQuantity <= 0) {
        return prev.filter(item => item.name !== name);
      }
      if (existingItem) {
        return prev.map(item => item.name === name ? { ...item, quantity: newQuantity } : item) as T[];
      }
      return [...prev, { name, quantity: newQuantity } as T];
    });
  };

  const handleAddonChange = (addon: Addon, change: number) => {
    setSelectedAddons(prev => {
      const existingAddon = prev.find(a => a.id === addon.id);
      const newQuantity = (existingAddon?.quantity || 0) + change;
      if (newQuantity <= 0) return prev.filter(a => a.id !== addon.id);
      if (existingAddon) return prev.map(a => a.id === addon.id ? { ...a, quantity: newQuantity } : a);
      return [...prev, { ...addon, quantity: newQuantity }];
    });
  };
  
  const totalPrice = useMemo(() => {
    const singleChoicePrice = selectedSingleChoiceAddon && custom.singleChoiceAddon ? custom.singleChoiceAddon.price : 0;
    const addonsPrice = selectedAddons.reduce((sum, addon) => sum + addon.price * addon.quantity, 0);
    return (item.price + singleChoicePrice) * quantity + addonsPrice;
  }, [item.price, quantity, selectedAddons, selectedSingleChoiceAddon, custom.singleChoiceAddon]);

  // Counts for UI display
  // FIX: Add explicit types to reduce function to resolve 'unknown' type errors.
  const donenessCount = useMemo(() => Object.values(selectedDonenesses).reduce((a: number, b: number | undefined) => a + (b || 0), 0), [selectedDonenesses]);
  const sauceLimit = useMemo(() => (custom.saucesPerItem ? custom.saucesPerItem * quantity : quantity), [custom.saucesPerItem, quantity]);
  const sauceCount = useMemo(() => selectedSauces.reduce((sum, s) => sum + s.quantity, 0), [selectedSauces]);
  // FIX: Add explicit types to reduce function to resolve 'unknown' type errors.
  const drinkCount = useMemo(() => Object.values(selectedDrinks).reduce((a: number, b: number) => a + (b || 0), 0), [selectedDrinks]);
  // FIX: Add explicit types to reduce function to resolve 'unknown' type errors.
  const componentCount = useMemo(() => Object.values(selectedComponent).reduce((a: number, b: number) => a + (b || 0), 0), [selectedComponent]);
  const sideChoiceLimit = useMemo(() => (custom.sideChoice ? custom.sideChoice.choices * quantity : 0), [custom.sideChoice, quantity]);
  // FIX: Add explicit types to reduce function to resolve 'unknown' type errors.
  const sideChoiceCount = useMemo(() => Object.values(selectedSideChoices).reduce((a: number, b: number) => a + (b || 0), 0), [selectedSideChoices]);
  // FIX: Add explicit types to reduce function to resolve 'unknown' type errors.
  const multiChoiceCount = useMemo(() => Object.values(selectedMultiChoice).reduce((a: number, b: number) => a + (b || 0), 0), [selectedMultiChoice]);

  const dessertACount = useMemo(() => {
      if (!custom.dessertChoice) return 0;
      const dessertGroupA = options.dessertsA.map(d => d.name);
      return selectedDesserts.filter(d => dessertGroupA.includes(d.name)).reduce((s, d) => s + d.quantity, 0);
  }, [selectedDesserts, options.dessertsA, custom.dessertChoice]);
  const dessertBCount = useMemo(() => {
      if (!custom.dessertChoice) return 0;
      const dessertGroupB = options.dessertsB.map(d => d.name);
      return selectedDesserts.filter(d => dessertGroupB.includes(d.name)).reduce((s, d) => s + d.quantity, 0);
  }, [selectedDesserts, options.dessertsB, custom.dessertChoice]);

  const pastaACount = useMemo(() => {
      if (!custom.pastaChoice) return 0;
      const pastaGroupA = options.pastasA.map(p => p.name);
      return selectedPastas.filter(p => pastaGroupA.includes(p.name)).reduce((s, p) => s + p.quantity, 0);
  }, [selectedPastas, options.pastasA, custom.pastaChoice]);
  const pastaBCount = useMemo(() => {
      if (!custom.pastaChoice) return 0;
      const pastaGroupB = options.pastasB.map(p => p.name);
      return selectedPastas.filter(p => pastaGroupB.includes(p.name)).reduce((s, p) => s + p.quantity, 0);
  }, [selectedPastas, options.pastasB, custom.pastaChoice]);


  const handleConfirm = () => {
    setValidationError(null);

    // Validations
    if (custom.doneness && donenessCount !== quantity) {
      setValidationError(`請選擇 ${quantity} 份熟度`); return;
    }
    if (custom.sauceChoice) {
      const limit = custom.saucesPerItem ? custom.saucesPerItem * quantity : quantity;
      if (sauceCount !== limit) {
        setValidationError(`請選擇 ${limit} 份醬料`); return;
      }
    }
    if (custom.drinkChoice && drinkCount !== quantity) {
      setValidationError(`請選擇 ${quantity} 份飲料`); return;
    }
    if (custom.dessertChoice) {
        if (dessertACount !== quantity || dessertBCount !== quantity) {
            setValidationError(`A區和B區甜品各需選擇 ${quantity} 份`); return;
        }
    }
    if (custom.pastaChoice) {
        if (pastaACount !== quantity || pastaBCount !== quantity) {
            setValidationError(`主食和醬料各需選擇 ${quantity} 份`); return;
        }
    }
    if (custom.componentChoice && componentCount !== quantity) {
      setValidationError(`${custom.componentChoice.title} 需選擇 ${quantity} 份`); return;
    }
    if (custom.sideChoice) {
      const limit = custom.sideChoice.choices * quantity;
      if (sideChoiceCount !== limit) {
        setValidationError(`${custom.sideChoice.title} 需選擇 ${limit} 份`); return;
      }
    }
    if (custom.multiChoice && multiChoiceCount !== quantity) {
      setValidationError(`${custom.multiChoice.title} 需選擇 ${quantity} 份`); return;
    }

    onConfirmSelection(item, quantity, {
      donenesses: selectedDonenesses,
      sauces: selectedSauces,
      drinks: selectedDrinks,
      desserts: selectedDesserts,
      pastas: selectedPastas,
      componentChoices: selectedComponent,
      sideChoices: selectedSideChoices,
      multiChoice: selectedMultiChoice,
      singleChoiceAddon: selectedSingleChoiceAddon,
      notes: selectedNotes,
      addons: selectedAddons,
    }, category);
    onClose();
  };
  
  const renderChoiceCounter = (
    choice: { name: string; isAvailable: boolean; },
    currentCount: number,
    onIncrement: () => void,
    onDecrement: () => void
  ) => {
    const { name, isAvailable } = choice;

    return (
      <div key={name} className={`flex justify-between items-center bg-white p-3 rounded-md ${!isAvailable && currentCount === 0 ? 'opacity-50' : ''}`}>
        <div className="flex flex-col">
            <span className={`text-sm font-medium text-slate-800 ${!isAvailable ? 'line-through' : ''}`}>
                {name}
            </span>
            {!isAvailable && <span className="text-xxs font-bold text-red-600">售完</span>}
        </div>
        <div className="flex items-center gap-2">
            <button onClick={onDecrement} className="p-1 rounded-full bg-slate-200 hover:bg-slate-300 disabled:opacity-50" disabled={currentCount === 0}>
                <MinusIcon className="h-4 w-4" />
            </button>
            <span className="font-semibold w-6 text-center">{currentCount}</span>
            <button onClick={onIncrement} className="p-1 rounded-full bg-slate-200 hover:bg-slate-300 disabled:opacity-50" disabled={!isAvailable}>
                <PlusIcon className="h-4 w-4" />
            </button>
        </div>
      </div>
    );
  };

  const renderSimpleCounter = (
    label: string,
    count: number,
    onIncrement: () => void,
    onDecrement: () => void
  ) => (
    <div key={label} className="flex justify-between items-center bg-white p-3 rounded-md">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <div className="flex items-center gap-2">
        <button onClick={onDecrement} className="p-1 rounded-full bg-slate-200 hover:bg-slate-300"><MinusIcon className="h-4 w-4" /></button>
        <span className="font-semibold w-6 text-center">{count}</span>
        <button onClick={onIncrement} className="p-1 rounded-full bg-slate-200 hover:bg-slate-300"><PlusIcon className="h-4 w-4" /></button>
      </div>
    </div>
  );
  
  const responsiveGridClasses = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white w-full h-full flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-5 relative border-b">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"><CloseIcon className="h-8 w-8" /></button>
          <h2 className="text-3xl font-bold text-slate-800">{item.name.replace(/半全餐|半套餐/g, '套餐')}</h2>
          <p className="text-slate-500 mt-1">{item.description}</p>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6">
          {custom.doneness && <div className="p-4 bg-slate-100 rounded-lg"><h3 className="font-semibold text-slate-700 mb-3">選擇熟度 <span className="text-sm font-normal text-slate-500">(已選 {donenessCount} / 共需選 {quantity} 份)</span></h3><div className={responsiveGridClasses}>{DONENESS_LEVELS.map(level => renderSimpleCounter(level, selectedDonenesses[level] || 0, () => handleOptionChange(setSelectedDonenesses as any, level, 1, quantity), () => handleOptionChange(setSelectedDonenesses as any, level, -1, quantity)))}</div></div>}
          
          {custom.sauceChoice && <div className="p-4 bg-slate-100 rounded-lg"><h3 className="font-semibold text-slate-700 mb-3">選擇醬料 <span className="text-sm font-normal text-slate-500">(已選 {sauceCount} / 共需選 {sauceLimit} 份)</span></h3><div className={responsiveGridClasses}>{options.sauces.map(sauce => renderChoiceCounter(sauce, selectedSauces.find(s => s.name === sauce.name)?.quantity || 0, () => { if(sauce.isAvailable) handleArrayOfObjectsChange(setSelectedSauces, sauce.name, 1, sauceLimit) }, () => handleArrayOfObjectsChange(setSelectedSauces, sauce.name, -1, sauceLimit)))}</div></div>}

          {custom.drinkChoice && <div className="p-4 bg-slate-100 rounded-lg"><h3 className="font-semibold text-slate-700 mb-3">選擇飲料 <span className="text-sm font-normal text-slate-500">(已選 {drinkCount} / 共需選 {quantity} 份)</span></h3><div className={responsiveGridClasses}>{DRINK_CHOICES.map(drink => renderSimpleCounter(drink, selectedDrinks[drink] || 0, () => handleOptionChange(setSelectedDrinks, drink, 1, quantity), () => handleOptionChange(setSelectedDrinks, drink, -1, quantity)))}</div></div>}
          
          {custom.componentChoice && <div className="p-4 bg-slate-100 rounded-lg"><h3 className="font-semibold text-slate-700 mb-3">{custom.componentChoice.title} <span className="text-sm font-normal text-slate-500">(已選 {componentCount} / 共需選 {quantity} 份)</span></h3><div className={responsiveGridClasses}>{custom.componentChoice.options.map(c => renderSimpleCounter(c, selectedComponent[c] || 0, () => handleOptionChange(setSelectedComponent, c, 1, quantity), () => handleOptionChange(setSelectedComponent, c, -1, quantity)))}</div></div>}

          {custom.sideChoice && <div className="p-4 bg-slate-100 rounded-lg"><h3 className="font-semibold text-slate-700 mb-3">{custom.sideChoice.title} <span className="text-sm font-normal text-slate-500">(已選 {sideChoiceCount} / 共需選 {sideChoiceLimit} 份)</span></h3><div className={responsiveGridClasses}>{custom.sideChoice.options.map(s => renderSimpleCounter(s, selectedSideChoices[s] || 0, () => handleOptionChange(setSelectedSideChoices, s, 1, sideChoiceLimit), () => handleOptionChange(setSelectedSideChoices, s, -1, sideChoiceLimit)))}</div></div>}
          
          {custom.multiChoice && <div className="p-4 bg-slate-100 rounded-lg"><h3 className="font-semibold text-slate-700 mb-3">{custom.multiChoice.title} <span className="text-sm font-normal text-slate-500">(已選 {multiChoiceCount} / 共需選 {quantity} 份)</span></h3><div className={responsiveGridClasses}>{options.coldNoodles.map(choice => renderChoiceCounter( choice, selectedMultiChoice[choice.name] || 0, () => { if (choice.isAvailable) handleOptionChange(setSelectedMultiChoice, choice.name, 1, quantity); }, () => handleOptionChange(setSelectedMultiChoice, choice.name, -1, quantity) ))}</div></div>}

          {custom.dessertChoice && <>
            <div className="p-4 bg-slate-100 rounded-lg"><h3 className="font-semibold text-slate-700 mb-3">選擇甜品 (A區) <span className="text-sm font-normal text-slate-500">(已選 {dessertACount} / 共需選 {quantity} 份)</span></h3><div className={responsiveGridClasses}>{options.dessertsA.map(dessert => renderChoiceCounter(dessert, selectedDesserts.find(s => s.name === dessert.name)?.quantity || 0, () => { if (dessert.isAvailable) handleArrayOfObjectsChange(setSelectedDesserts, dessert.name, 1, quantity, options.dessertsA.map(d=>d.name)) }, () => handleArrayOfObjectsChange(setSelectedDesserts, dessert.name, -1, quantity, options.dessertsA.map(d=>d.name)) ))}</div></div>
            <div className="p-4 bg-slate-100 rounded-lg"><h3 className="font-semibold text-slate-700 mb-3">選擇甜品 (B區) <span className="text-sm font-normal text-slate-500">(已選 {dessertBCount} / 共需選 {quantity} 份)</span></h3><div className={responsiveGridClasses}>{options.dessertsB.map(dessert => renderChoiceCounter(dessert, selectedDesserts.find(s => s.name === dessert.name)?.quantity || 0, () => { if (dessert.isAvailable) handleArrayOfObjectsChange(setSelectedDesserts, dessert.name, 1, quantity, options.dessertsB.map(d=>d.name)) }, () => handleArrayOfObjectsChange(setSelectedDesserts, dessert.name, -1, quantity, options.dessertsB.map(d=>d.name)) ))}</div></div>
          </>}

          {custom.pastaChoice && <>
            <div className="p-4 bg-slate-100 rounded-lg"><h3 className="font-semibold text-slate-700 mb-3">選擇義大利麵主食 (A區) <span className="text-sm font-normal text-slate-500">(已選 {pastaACount} / 共需選 {quantity} 份)</span></h3><div className={responsiveGridClasses}>{options.pastasA.map(pasta => renderChoiceCounter(pasta, selectedPastas.find(s => s.name === pasta.name)?.quantity || 0, () => { if (pasta.isAvailable) handleArrayOfObjectsChange(setSelectedPastas, pasta.name, 1, quantity, options.pastasA.map(p=>p.name)) }, () => handleArrayOfObjectsChange(setSelectedPastas, pasta.name, -1, quantity, options.pastasA.map(p=>p.name)) ))}</div></div>
            <div className="p-4 bg-slate-100 rounded-lg"><h3 className="font-semibold text-slate-700 mb-3">選擇義大利麵醬料 (B區) <span className="text-sm font-normal text-slate-500">(已選 {pastaBCount} / 共需選 {quantity} 份)</span></h3><div className={responsiveGridClasses}>{options.pastasB.map(pasta => renderChoiceCounter(pasta, selectedPastas.find(s => s.name === pasta.name)?.quantity || 0, () => { if (pasta.isAvailable) handleArrayOfObjectsChange(setSelectedPastas, pasta.name, 1, quantity, options.pastasB.map(p=>p.name)) }, () => handleArrayOfObjectsChange(setSelectedPastas, pasta.name, -1, quantity, options.pastasB.map(p=>p.name)) ))}</div></div>
          </>}

          {allAddons.filter(a => a.isAvailable).length > 0 && <div className="p-4 bg-slate-100 rounded-lg">
            <h3 className="font-semibold text-slate-700 mb-3">其他加購</h3>
            <div className={responsiveGridClasses}>{allAddons.filter(a => a.isAvailable).map(addon => renderSimpleCounter(`${addon.name} (+$${addon.price})`, selectedAddons.find(a => a.id === addon.id)?.quantity || 0, () => handleAddonChange(addon, 1), () => handleAddonChange(addon, -1)))}</div>
          </div>}

          {custom.notes && <div className="p-4 bg-slate-100 rounded-lg">
            <h3 className="font-semibold text-slate-700 mb-2">備註</h3>
            <textarea value={selectedNotes} onChange={e => setSelectedNotes(e.target.value)} placeholder="有什麼特殊需求嗎？" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" rows={3}></textarea>
          </div>}
        </main>

        <footer className="p-5 border-t bg-slate-50">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 rounded-full bg-slate-200 hover:bg-slate-300"><MinusIcon /></button>
              <span className="font-bold text-xl w-10 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-2 rounded-full bg-slate-200 hover:bg-slate-300"><PlusIcon /></button>
            </div>
            {validationError && <p className="text-red-500 text-sm font-semibold flex-1 text-center">{validationError}</p>}
            <button onClick={handleConfirm} className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
              {editingItem ? `更新餐點 - $${totalPrice}` : `加入購物車 - $${totalPrice}`}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ItemModal;
