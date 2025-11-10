import React from 'react';
import type { MenuCategory, MenuItem } from '../types';
import { PlusIcon } from './icons';

interface MenuProps {
  menuData: MenuCategory[];
  onSelectItem: (item: MenuItem, category: MenuCategory) => void;
}

const Menu: React.FC<MenuProps> = ({ menuData, onSelectItem }) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {menuData.map((category) => (
        <div key={category.title} id={category.title} className="break-inside-avoid">
          <div className="mb-6 pb-2 border-b-2 border-green-700">
            <h2 className="text-3xl font-bold text-slate-800">{category.title}</h2>
          </div>
          <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-3 min-w-[250px]">品名</th>
                  <th scope="col" className="px-6 py-3">重量</th>
                  <th scope="col" className="px-6 py-3">價格</th>
                  <th scope="col" className="px-6 py-3 min-w-[200px]">選項</th>
                  <th scope="col" className="px-6 py-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {category.items.map((item) => {
                  const hasOtherOptions = item.customizations.dessertChoice || item.customizations.multiChoice || item.customizations.singleChoiceAddon;
                  return (
                    <tr key={item.id} className={`border-b hover:bg-slate-50 ${!item.isAvailable ? 'opacity-60 bg-slate-50 cursor-not-allowed' : 'bg-white'}`}>
                      <th scope="row" className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                        {item.name.replace(/半全餐|半套餐/g, '套餐')}
                        {item.description && <p className="text-xs text-slate-500 font-normal mt-1">{item.description}</p>}
                      </th>
                      <td className="px-6 py-4">{item.weight || '-'}</td>
                      <td className="px-6 py-4 font-semibold text-green-700 text-base">${item.price}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {item.customizations.doneness && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">可選熟度</span>}
                          {item.customizations.sauceChoice && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">可選醬料</span>}
                          {item.customizations.drinkChoice && <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">可選附餐</span>}
                           {hasOtherOptions && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">更多選項</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => onSelectItem(item, category)}
                          disabled={!item.isAvailable}
                          className="w-full max-w-[120px] flex items-center justify-center bg-green-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          <span>{item.isAvailable ? '加入' : '售罄'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Menu;
