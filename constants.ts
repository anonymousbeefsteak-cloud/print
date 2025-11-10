import type { MenuCategory, Addon } from './types';

export const MENU_DATA: MenuCategory[] = [
  {
    title: "套餐",
    items: [
      { id: 'set-1', name: '板腱牛排+脆皮炸雞或炸魚套餐', weight: '7oz', price: 299, description: "附:①日湯②麵包③主餐④脆薯⑤飲料 3oz牛排 4oz雞塊", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true, saucesPerItem: 2, componentChoice: { title: '炸物選擇', options: ['脆皮炸雞', '炸魚'] } }, isAvailable: true },
      { id: 'set-2', name: '板腱牛排+脆皮炸雞或炸魚套餐', weight: '10oz', price: 399, description: "附:①日湯②麵包③主餐④脆薯⑤飲料 6oz牛排 4oz雞塊", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true, saucesPerItem: 2, componentChoice: { title: '炸物選擇', options: ['脆皮炸雞', '炸魚'] } }, isAvailable: true },
      { id: 'set-3', name: '板腱牛排+脆皮炸雞或炸魚套餐', weight: '14oz', price: 499, description: "附:①日湯②麵包③主餐④脆薯⑤飲料 10oz牛排 4oz雞塊", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true, saucesPerItem: 2, componentChoice: { title: '炸物選擇', options: ['脆皮炸雞', '炸魚'] } }, isAvailable: true },
      { id: 'set-4', name: '上蓋牛排+脆皮炸雞或炸魚套餐', weight: '7oz', price: 299, description: "附:①日湯②麵包③主餐④脆薯⑤飲料 3oz牛排 4oz雞塊", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true, saucesPerItem: 2, componentChoice: { title: '炸物選擇', options: ['脆皮炸雞', '炸魚'] } }, isAvailable: true },
      { id: 'set-5', name: '上蓋牛排+脆皮炸雞或炸魚套餐', weight: '10oz', price: 399, description: "附:①日湯②麵包③主餐④脆薯⑤飲料 6oz牛排 4oz雞塊", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true, saucesPerItem: 2, componentChoice: { title: '炸物選擇', options: ['脆皮炸雞', '炸魚'] } }, isAvailable: true },
      { id: 'set-6', name: '板腱牛排套餐', weight: '12oz', price: 499, description: "附:①日湯②麵包③主餐④脆薯⑤是日甜品⑥飲料", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true, saucesPerItem: 2 }, isAvailable: true },
      { id: 'set-7', name: '上蓋牛排套餐', weight: '12oz', price: 499, description: "附:①日湯②麵包③主餐④脆薯⑤是日甜品⑥飲料", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true, saucesPerItem: 2 }, isAvailable: true },
      { id: 'set-8', name: '香煎櫻桃鴨胸套餐', weight: '10oz', price: 399, description: "附:①日湯②麵包③主餐④脆薯⑤是日甜品⑥飲料", customizations: { doneness: false, sauceChoice: true, drinkChoice: true, notes: true, saucesPerItem: 2 }, isAvailable: true },
      { id: 'set-9', name: '香煎鮮嫩魚套餐', weight: '10oz', price: 399, description: "附:①日湯②麵包③主餐④脆薯⑤是日甜品⑥飲料", customizations: { doneness: false, sauceChoice: true, drinkChoice: true, notes: true, saucesPerItem: 2 }, isAvailable: true },
      { id: 'set-10', name: '香煎鮮嫩雞腿套餐', weight: '10oz', price: 250, description: "附:①日湯②麵包③主餐④脆薯⑤飲料", customizations: { doneness: false, sauceChoice: true, drinkChoice: true, notes: true, saucesPerItem: 2 }, isAvailable: true },
      { id: 'set-11', name: '香煎美味豬排套餐', weight: '10oz', price: 299, description: "附:①日湯②麵包③主餐④脆薯⑤飲料", customizations: { doneness: false, sauceChoice: true, drinkChoice: true, notes: true, saucesPerItem: 2 }, isAvailable: true },
      { id: 'set-12', name: '英式炸魚套餐', weight: '10oz', price: 250, description: "附:①日湯②麵包③主餐④脆薯⑤飲料", customizations: { doneness: false, sauceChoice: true, drinkChoice: true, notes: true, saucesPerItem: 2 }, isAvailable: true },
      { id: 'set-13', name: '日式豬排套餐', weight: '10oz', price: 250, description: "附:①日湯②麵包③主餐④脆薯⑤飲料", customizations: { doneness: false, sauceChoice: true, drinkChoice: true, notes: true, saucesPerItem: 2 }, isAvailable: true },
    ]
  },
  {
    title: "組合餐",
    items: [
      { id: 'combo-1', name: '日豬+雞腿+上蓋組合餐', weight: '15oz', price: 529, description: "附:①日湯②麵包③主餐④脆薯⑤飲料", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true, saucesPerItem: 2 }, isAvailable: true },
      { id: 'combo-2', name: '炸魚+雞腿+板腱組合餐', weight: '15oz', price: 529, description: "附:①日湯②麵包③主餐④脆薯⑤飲料", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true, saucesPerItem: 2 }, isAvailable: true },
      { id: 'combo-3', name: '煎魚+鴨胸+豬排組合餐', weight: '15oz', price: 529, description: "附:①日湯②麵包③主餐④脆薯⑤飲料", customizations: { doneness: false, sauceChoice: true, drinkChoice: true, notes: true, saucesPerItem: 2 }, isAvailable: true },
      { id: 'combo-4', name: '鴨胸+煎魚+上蓋組合餐', weight: '15oz', price: 599, description: "附:①日湯②麵包③主餐④脆薯⑤飲料", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true, saucesPerItem: 2 }, isAvailable: true },
    ]
  },
  {
    title: "單點品項",
    items: [
      { id: 'ac-1', name: '單點板腱 5oz', weight: '5oz', price: 200, description: "單點主餐", customizations: { doneness: true, notes: true }, isAvailable: true },
      { id: 'ac-2', name: '單點上蓋 5oz', weight: '5oz', price: 200, description: "單點主餐", customizations: { doneness: true, notes: true }, isAvailable: true },
      { id: 'ac-3', name: '單點雞腿 5oz', weight: '5oz', price: 120, description: "單點主餐", customizations: { notes: true }, isAvailable: true },
      { id: 'ac-4', name: '單點煎魚 5oz', weight: '5oz', price: 120, description: "單點主餐", customizations: { notes: true }, isAvailable: true },
      { id: 'ac-5', name: '單點鴨胸 5oz', weight: '5oz', price: 120, description: "單點主餐", customizations: { notes: true }, isAvailable: true },
      { id: 'ac-6', name: '單點炸魚 5oz', weight: '5oz', price: 120, description: "單點主餐", customizations: { notes: true }, isAvailable: true },
      { id: 'ac-7', name: '單點豬排 5oz', weight: '5oz', price: 120, description: "單點主餐", customizations: { notes: true }, isAvailable: true },
      { id: 'ac-8', name: '單點日豬 5oz', weight: '5oz', price: 120, description: "單點主餐", customizations: { notes: true }, isAvailable: true },
      { id: 'ac-9', name: '單點義大利麵', price: 150, description: "任選主食與醬料", customizations: { pastaChoice: true, notes: true }, isAvailable: true },
      { id: 'ac-10', name: '單點湯品', price: 30, description: "是日例湯", customizations: { notes: true }, isAvailable: true },
      { id: 'ac-11', name: '單點粥品', price: 60, description: "單點", customizations: { notes: true }, isAvailable: true },
      { id: 'ac-12', name: '單點脆薯', price: 60, description: "單點", customizations: { notes: true }, isAvailable: true },
      { id: 'ac-13', name: '單點是日甜品', price: 60, description: "單點", customizations: { notes: true }, isAvailable: true },
      { id: 'ac-14', name: '單點飲料', price: 20, description: "任選一款", customizations: { drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'ac-15', name: '單點蒜法', price: 60, description: "單點", customizations: { notes: true }, isAvailable: true },
    ]
  },
  {
    title: "漢堡套餐",
    items: [
      { id: 'fried-chicken-set-golden', name: '黃金脆皮炸雞塊套餐', price: 175, description: "附:①日湯②主餐③脆薯④甜品⑤飲料", customizations: { drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'fried-chicken-set-kimchi', name: '黃金泡菜脆皮雞塊吃到堡套餐', price: 175, description: "附:①日湯②主餐③脆薯④甜品⑤飲料", customizations: { drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'fried-chicken-set-waffle-apple', name: '華夫蘋果沙拉雞塊吃到堡套餐', price: 175, description: "附:①日湯②主餐③脆薯④甜品⑤飲料", customizations: { drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'fried-chicken-set-egg-salad', name: '蛋沙拉脆皮雞塊吃到堡套餐', price: 175, description: "附:①日湯②主餐③脆薯④甜品⑤飲料", customizations: { drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'fried-chicken-set-boston-peanut', name: '波士頓花生冰淇淋吃到堡套餐', price: 175, description: "附:①日湯②主餐③脆薯④雞塊⑤飲料", customizations: { drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'fried-chicken-set-lava-choco', name: '溶岩巧克佐冰淇淋吃到堡套餐', price: 175, description: "附:①日湯②主餐③脆薯④雞塊⑤飲料", customizations: { drinkChoice: true, notes: true }, isAvailable: true },
    ]
  },
  {
    title: "脆皮炸雞塊",
    items: [
      { id: 'fried-chicken-single', name: '黃金脆皮炸雞塊', price: 75, description: "單點", customizations: { notes: true }, isAvailable: true },
    ]
  },
  {
    title: "涼麵",
    items: [
        { id: 'cold-noodle-single', name: '涼麵', price: 75, description: "單點。請選擇口味", customizations: { multiChoice: { title: '涼麵口味', options: ["日式涼麵", "泰式涼麵", "沙茶涼麵", "蒜香涼麵", "金瓜涼麵", "巴薩米醋涼麵", "香葱涼麵", "凱撒涼麵", "橙汁涼麵", "黑胡椒涼麵", "台式涼麵", "BBQ涼麵"] }, notes: true }, isAvailable: true },
        { id: 'cold-noodle-set', name: '涼麵套餐', price: 175, description: "附:①日湯②主餐③炸雞④甜品⑤飲料", customizations: { multiChoice: { title: '涼麵口味', options: ["日式涼麵", "泰式涼麵", "沙茶涼麵", "蒜香涼麵", "金瓜涼麵", "巴薩米醋涼麵", "香葱涼麵", "凱撒涼麵", "橙汁涼麵", "黑胡椒涼麵", "台式涼麵", "BBQ涼麵"] }, drinkChoice: true, notes: true }, isAvailable: true },
    ]
  },
   {
    title: "義大利麵",
    items: [
        { id: 'pasta-choice-single', name: '任選義麵 (簡餐)', price: 160, description: "簡餐附(選二)→①日湯 ②脆薯 ③甜品 ④飲料", customizations: { pastaChoice: true, notes: true, sideChoice: { title: '簡餐附餐 (請選二)', options: ['日湯', '脆薯', '甜品', '飲料'], choices: 2 } }, isAvailable: true },
        { id: 'pasta-choice-set', name: '任選義麵 (套餐)', price: 220, description: "套餐附:①日湯 ②主餐 ③甜品 ④麵包 ⑤飲料", customizations: { pastaChoice: true, drinkChoice: true, notes: true }, isAvailable: true },
    ]
  },
  {
    title: "甜品",
    items: [
        { id: 'dessert-choice-single', name: '任選甜品', price: 99, description: "A區、B區各任選一種。", customizations: { dessertChoice: true, notes: true }, isAvailable: true },
        { id: 'dessert-choice-set', name: '任選甜品套餐', price: 200, description: "附:①日湯②主餐③脆薯④雞塊⑤飲料", customizations: { dessertChoice: true, drinkChoice: true, notes: true }, isAvailable: true },
    ]
  },
];

export const ADDONS: Addon[] = [
    { id: 'addon-top-blade-5oz', name: '板腱加購 5oz', price: 200, category: '主餐加購', isAvailable: true },
    { id: 'addon-ribeye-cap-5oz', name: '上蓋加購 5oz', price: 200, category: '主餐加購', isAvailable: true },
    { id: 'addon-chicken-leg-5oz', name: '雞腿加購 5oz', price: 120, category: '主餐加購', isAvailable: true },
    { id: 'addon-sea-bass-5oz', name: '煎魚加購 5oz', price: 120, category: '主餐加購', isAvailable: true },
    { id: 'addon-duck-breast-5oz', name: '鴨胸加購 5oz', price: 120, category: '主餐加購', isAvailable: true },
    { id: 'addon-fried-fish-5oz', name: '炸魚加購 5oz', price: 120, category: '主餐加購', isAvailable: true },
    { id: 'addon-pork-chop-5oz', name: '豬排加購 5oz', price: 120, category: '主餐加購', isAvailable: true },
    { id: 'addon-jp-pork-cutlet-5oz', name: '日豬加購 5oz', price: 120, category: '主餐加購', isAvailable: true },
    { id: 'addon-pasta', name: '義麵加購', price: 150, category: '主餐加購', isAvailable: true },
    { id: 'addon-soup', name: '湯品 加購', price: 30, category: '單點加購', isAvailable: true },
    { id: 'addon-congee', name: '粥品 加購', price: 60, category: '單點加購', isAvailable: true },
    { id: 'addon-fries', name: '脆薯 加購', price: 60, category: '單點加購', isAvailable: true },
    { id: 'addon-daily-dessert', name: '是日甜品 加購', price: 60, category: '單點加購', isAvailable: true },
    { id: 'addon-drink-side', name: '飲料 加購', price: 20, category: '單點加購', isAvailable: true },
    { id: 'addon-nuggets-side', name: '雞塊 加購', price: 75, category: '單點加購', isAvailable: true },
    { id: 'addon-garlic-bread', name: '蒜法 加購', price: 60, category: '單點加購', isAvailable: true },
    { id: 'addon-dessert-choice', name: '任選甜品 加購', price: 99, category: '單點加購', isAvailable: true },
];

export const DONENESS_LEVELS = ['3分熟', '5分熟', '7分熟', '全熟'] as const;
export const SAUCE_CHOICES = ["生蒜片", "黑胡椒", "金泡菜", "哇沙米", "蒜味醬", "橙汁醬", "巴醋醬", "椒鹽粉", "芥末醬", "BBQ醬", "蕃茄醬", "泰式醬", "凱撒醬", "塔塔醬"];
export const DRINK_CHOICES = ["無糖紅茶", "冰涼可樂"];

// Dessert choices from the new menu
export const DESSERT_CHOICES_A = ["法式烤布蕾佐冰淇淋", "宇治紫米紅豆冰淇淋", "融岩巧克力佐冰淇淋", "阿薩斯蘋果佐冰淇淋", "烤焦糖布丁佐冰淇淋", "波士頓花生冰淇淋"];
export const DESSERT_CHOICES_B = ["蜜糖潛堡", "格子鬆餅", "美式鬆餅", "蜜糖吐司", "法式薄餅", "焦糖鍋巴", "蜜糖長棍", "香餅牛軋", "脆皮甜筒"];

// New Pasta choices
export const PASTA_CHOICES_A = ['日豬或煎豬排天使義麵', '炸魚或煎魚天使義麵', '炸雞或雞肉天使義麵', '炒牛肉片天使義大利麵'];
export const PASTA_CHOICES_B = ['蕃茄索士', '青醬索士', '蒜油索士', '奶油索士', '海鮮索士', '黑椒索士', '肉醬索士', '沙茶索士'];

export const COLD_NOODLE_CHOICES = ["日式涼麵", "泰式涼麵", "沙茶涼麵", "蒜香涼麵", "金瓜涼麵", "巴薩米醋涼麵", "香葱涼麵", "凱撒涼麵", "橙汁涼麵", "黑胡椒涼麵", "台式涼麵", "BBQ涼麵"];
