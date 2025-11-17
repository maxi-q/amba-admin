export const rewardUnits = [
  { value: "points", label: "Баллы" },
  { value: "rub", label: "Рубли" },
  { value: "usd", label: "Доллары" },
  { value: "eur", label: "Евро" },
  { value: "items", label: "Штуки" },
] as const;

export const getRewardUnitShortName = (unit: string): string => {
  switch (unit) {
    case 'rub': return 'руб';
    case 'usd': return 'долл';
    case 'eur': return 'евро';
    case 'points': return 'баллов';
    case 'items': return 'штук';
    default: return 'ед';
  }
};

