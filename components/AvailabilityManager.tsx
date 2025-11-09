import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '../services/apiService';
import type { MenuCategory, Addon, OptionsData } from '../types';

const ToggleSwitch: React.FC<{
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
}> = ({ enabled, onChange, label }) => (
  <label htmlFor={label} className="flex items-center cursor-pointer">
    <div className="relative">
      <input
        id={label}
        type="checkbox"
        className="sr-only"
        checked={enabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className={`block w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-green-500' : 'bg-slate-300'}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${enabled ? 'translate-x-6' : ''}`}></div>
    </div>
    <div className="ml-3 text-sm font-medium text-slate-700">{enabled ? '供應中' : '售完'}</div>
  </label>
);

interface AvailabilityManagerProps {
    isOpen: boolean;
    onAvailabilityUpdate: () => void;
}

const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({ isOpen, onAvailabilityUpdate }) => {
  const [initialMenu, setInitialMenu] = useState<MenuCategory[]>([]);
  const [initialAddons, setInitialAddons] = useState<Addon[]>([]);
  const [initialOptions, setInitialOptions] = useState<OptionsData | null>(null);

  const [availability, setAvailability] = useState<{
    menu: Record<string, boolean>;
    addons: Record<string, boolean>;
    options: Partial<Record<keyof OptionsData, Record<string, boolean>>>;
  }>({ menu: {}, addons: {}, options: {} });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { menu, addons, options } = await apiService.getMenuAndAddons();
      setInitialMenu(menu);
      setInitialAddons(addons);
      setInitialOptions(options);

      const menuAvail = Object.fromEntries(menu.flatMap(cat => cat.items.map(item => [item.id, item.isAvailable])));
      const addonAvail = Object.fromEntries(addons.map(addon => [addon.id, addon.isAvailable]));
      const optionsAvail = Object.fromEntries(
          Object.entries(options).map(([key, val]) => [
              key,
              // FIX: Cast `val` to any[] to resolve 'unknown' type error on .map()
              Object.fromEntries((val as any[]).map(opt => [opt.name, opt.isAvailable]))
          ])
      );
      
      setAvailability({ menu: menuAvail, addons: addonAvail, options: optionsAvail });
    } catch (err) {
      setError('無法載入菜單資料，請稍後再試。');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);
  
  const initialAvailability = useMemo(() => {
      const menuAvail = Object.fromEntries(initialMenu.flatMap(cat => cat.items.map(item => [item.id, item.isAvailable])));
      const addonAvail = Object.fromEntries(initialAddons.map(addon => [addon.id, addon.isAvailable]));
      const optionsAvail = initialOptions ? Object.fromEntries(
          Object.entries(initialOptions).map(([key, val]) => [
              key,
              Object.fromEntries((val as any[]).map(opt => [opt.name, opt.isAvailable]))
          ])
      ) : {};
      return { menu: menuAvail, addons: addonAvail, options: optionsAvail };
  }, [initialMenu, initialAddons, initialOptions]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(availability) !== JSON.stringify(initialAvailability);
  }, [availability, initialAvailability]);

  const handleToggle = (type: 'menu' | 'addons' | 'options', id: string, newStatus: boolean, optionType?: keyof OptionsData) => {
    setSuccessMessage(null);
    if (type === 'options' && optionType) {
        setAvailability(prev => ({
            ...prev,
            options: {
                ...prev.options,
                [optionType]: {
                    ...prev.options[optionType],
                    [id]: newStatus,
                }
            }
        }));
    } else if (type !== 'options') {
        setAvailability(prev => ({
          ...prev,
          [type]: {
            ...prev[type],
            [id]: newStatus,
          },
        }));
    }
  };
  
  const handleSaveChanges = async () => {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      const result = await apiService.updateAvailability(availability);
      if(result.success) {
          setSuccessMessage('供應狀態已成功儲存！');
          onAvailabilityUpdate(); // Signal parent to refetch
          await fetchData(); // Also refetch local state to update the "initial" state for hasChanges logic
      } else {
          setError(result.message || '儲存失敗，請重試。');
      }
      setIsSaving(false);
  }

  const addonGroups = useMemo(() => {
    return initialAddons.reduce((acc, addon) => {
      (acc[addon.category] = acc[addon.category] || []).push(addon);
      return acc;
    }, {} as { [key: string]: Addon[] });
  }, [initialAddons]);

  const optionSections: { key: keyof OptionsData, title: string }[] = [
    { key: 'sauces', title: '主菜沾醬' },
    { key: 'coldNoodles', title: '涼麵口味' },
    { key: 'pastasA', title: '義大利麵主食 (A區)' },
    { key: 'pastasB', title: '義大利麵醬料 (B區)' },
    { key: 'dessertsA', title: '甜品 (A區)' },
    { key: 'dessertsB', title: '甜品 (B區)' },
  ];

  if (isLoading) return <p className="text-center p-8">正在載入供應項目...</p>;
  if (error) return <p className="text-red-500 bg-red-100 p-3 rounded-md text-center">{error}</p>;

  return (
    <div className="space-y-8">
      {initialMenu.map(category => (
        <div key={category.title} className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-slate-700 border-b pb-2 mb-4">{category.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.items.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-md">
                <span className="text-sm font-medium text-slate-800">{item.name}</span>
                <ToggleSwitch
                  enabled={availability.menu[item.id] ?? false}
                  onChange={newStatus => handleToggle('menu', item.id, newStatus)}
                  label={`menu-${item.id}`}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {Object.entries(addonGroups).map(([category, addons]) => (
        <div key={category} className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-slate-700 border-b pb-2 mb-4">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addons.map(addon => (
              <div key={addon.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-md">
                <span className="text-sm font-medium text-slate-800">{addon.name}</span>
                <ToggleSwitch
                  enabled={availability.addons[addon.id] ?? false}
                  onChange={newStatus => handleToggle('addons', addon.id, newStatus)}
                  label={`addon-${addon.id}`}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {initialOptions && optionSections.map(section => (
        (initialOptions[section.key] && (initialOptions[section.key] as any[]).length > 0) && (
            <div key={section.key} className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-slate-700 border-b pb-2 mb-4">{section.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* FIX: Cast to any[] to resolve 'unknown' type error on .map() */}
                    {(initialOptions[section.key] as any[]).map(option => (
                        <div key={option.name} className="flex justify-between items-center bg-slate-50 p-3 rounded-md">
                            <span className="text-sm font-medium text-slate-800">{option.name}</span>
                            <ToggleSwitch
                                enabled={availability.options[section.key]?.[option.name] ?? false}
                                onChange={newStatus => handleToggle('options', option.name, newStatus, section.key)}
                                label={`option-${section.key}-${option.name}`}
                            />
                        </div>
                    ))}
                </div>
            </div>
        )
      ))}

      <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 rounded-t-lg shadow-lg -mx-6 -mb-6 mt-8">
        {successMessage && <div className="text-green-600 bg-green-100 p-3 rounded-md text-center mb-3">{successMessage}</div>}
        <button 
          onClick={handleSaveChanges} 
          disabled={!hasChanges || isSaving}
          className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isSaving ? '儲存中...' : '儲存變更'}
        </button>
      </div>
    </div>
  );
};

export default AvailabilityManager;
