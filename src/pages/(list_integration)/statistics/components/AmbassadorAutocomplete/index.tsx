import { useState, useEffect } from 'react';
import { Autocomplete, TextField, Chip, Box } from '@mui/material';
import { useDebounce } from 'use-debounce';
import type { AmbassadorAutocompleteProps, AutocompleteOption } from '../../types';
import { mockAmbassadors } from '../../helpers/mockData';

// Mock функция поиска (в будущем будет заменена на API)
const searchAmbassadors = async (query: string): Promise<AutocompleteOption[]> => {
  // Имитация задержки API
  await new Promise(resolve => setTimeout(resolve, 150));
  
  if (!query.trim()) {
    return [];
  }
  
  const filtered = mockAmbassadors
    .filter(amb => 
      amb.name.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 10) // Максимум 10 результатов
    .map(amb => ({ id: amb.id, label: amb.name }));
  
  return filtered;
};

export const AmbassadorAutocomplete = ({ selectedIds, onChange }: AmbassadorAutocompleteProps) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedInput] = useDebounce(inputValue, 200);

  // Получаем выбранные элементы из mock данных
  const selectedOptions = mockAmbassadors
    .filter(amb => selectedIds.includes(amb.id))
    .map(amb => ({ id: amb.id, label: amb.name }));

  // Обновляем опции при изменении debouncedInput (для поиска через API)
  // Этот эффект срабатывает только когда debounce закончился и inputValue совпадает с debouncedInput
  useEffect(() => {
    // Если inputValue изменился после того, как debouncedInput был установлен, не обновляем
    if (inputValue !== debouncedInput && inputValue.trim().length > 0) {
      return;
    }

    const currentSelectedOptions = mockAmbassadors
      .filter(amb => selectedIds.includes(amb.id))
      .map(amb => ({ id: amb.id, label: amb.name }));

    // Если есть текст для поиска, ищем
    if (debouncedInput.trim().length >= 1) {
      setIsLoading(true);
      searchAmbassadors(debouncedInput).then(results => {
        // Проверяем, что inputValue не изменился за время поиска
        if (inputValue === debouncedInput || inputValue.trim().length === 0) {
          // Добавляем выбранные элементы в опции, если их там еще нет
          const selectedInResults = results.filter(opt => selectedIds.includes(opt.id));
          const selectedNotInResults = currentSelectedOptions.filter(opt => !selectedInResults.find(sr => sr.id === opt.id));
          setOptions([...selectedNotInResults, ...results]);
        }
        setIsLoading(false);
      });
    } else {
      // Когда поле пустое, показываем только выбранные элементы (если есть) или пустой список
      setOptions(currentSelectedOptions);
      setIsLoading(false);
    }
  }, [debouncedInput, selectedIds, inputValue]);

  // Когда пользователь вводит текст (inputValue изменяется), сразу показываем результаты по полному тексту
  useEffect(() => {
    if (inputValue.trim().length >= 1) {
      // Используем полный inputValue для поиска (не ждем debounce)
      const filtered = mockAmbassadors
        .filter(amb => amb.name.toLowerCase().includes(inputValue.toLowerCase()))
        .slice(0, 10)
        .map(amb => ({ id: amb.id, label: amb.name }));
      
      const currentSelectedOptions = mockAmbassadors
        .filter(amb => selectedIds.includes(amb.id))
        .map(amb => ({ id: amb.id, label: amb.name }));
      
      const selectedInFiltered = filtered.filter(opt => selectedIds.includes(opt.id));
      const selectedNotInFiltered = currentSelectedOptions.filter(opt => !selectedInFiltered.find(sf => sf.id === opt.id));
      setOptions([...selectedNotInFiltered, ...filtered]);
    }
  }, [inputValue, selectedIds]);

  const handleChange = (_: any, newValue: AutocompleteOption[]) => {
    const newIds = newValue.map(option => option.id);
    onChange(newIds);
  };

  return (
    <Autocomplete
      multiple
      options={options}
      value={selectedOptions}
      inputValue={inputValue}
      onInputChange={(_, newInputValue, reason) => {
        // Обновляем inputValue при вводе текста или очистке
        if (reason === 'input' || reason === 'clear') {
          setInputValue(newInputValue);
        }
      }}
      onChange={(_, newValue) => {
        // При выборе опции очищаем поле ввода только после обработки
        handleChange(_, newValue);
        // Очищаем поле только если действительно выбрали значение
        if (newValue.length > selectedOptions.length) {
          setInputValue('');
        }
      }}
      loading={isLoading}
      getOptionLabel={(option) => option.label || ''}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      freeSolo={false}
      openOnFocus={inputValue.length > 0 || options.length > 0}
      handleHomeEndKeys
      renderInput={(params) => (
        <TextField
          {...params}
          label="Амбассадор"
          placeholder="Начните вводить имя..."
          variant="outlined"
          size="small"
          inputProps={{
            ...params.inputProps,
            autoComplete: 'off',
          }}
        />
      )}
      renderTags={(value, getTagProps) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {value.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.id}
              label={option.label}
              size="small"
            />
          ))}
        </Box>
      )}
      sx={{ width: '100%', minWidth: 300 }}
    />
  );
};
