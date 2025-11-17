/**
 * Форматирует диапазон дат события в читаемый формат
 * @param startDate - Дата начала события
 * @param endDate - Дата окончания события
 * @returns Отформатированная строка с диапазоном дат или сообщение об отсутствии ограничений
 */
export const formatDateRange = (startDate: string | null, endDate: string | null): string => {
  if (!startDate || !endDate) return 'Без ограничений по дате';
  
  const start = new Date(startDate);
  const end = new Date(endDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return `${formatDate(start)} - ${formatDate(end)}`;
};

/**
 * Проверяет, является ли событие активным в текущий момент
 * @param startDate - Дата начала события
 * @param endDate - Дата окончания события
 * @returns true, если событие активно, иначе false
 */
export const isEventActive = (startDate: string | null, endDate: string | null): boolean => {
  const now = new Date();
  const start = new Date(startDate || '');
  const end = new Date(endDate || '');

  return now >= start && now <= end;
};

