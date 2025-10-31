import { useState, useEffect } from 'react';
import { Autocomplete, TextField, Chip, Box } from '@mui/material';
import { useDebounce } from 'use-debounce';
import type { EventAutocompleteProps, AutocompleteOption } from '../../types';
import { useEvents } from '@/hooks/events/useEvents';
import type { IEvent } from '@/services/events/events.types';

export const EventAutocomplete = ({ selectedIds, onChange, roomId }: EventAutocompleteProps) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [debouncedInput] = useDebounce(inputValue, 200);
  
  const { events, isLoading } = useEvents(
    { page: 1, size: 100 },
    roomId
  );

  // Получаем выбранные элементы
  const selectedOptions = events
    .filter((event: IEvent) => selectedIds.includes(event.id))
    .map((event: IEvent) => ({ id: event.id, label: event.name }));

  // Обновляем опции при изменении debouncedInput (для оптимизации)
  useEffect(() => {
    // Если inputValue изменился после того, как debouncedInput был установлен, не обновляем
    if (inputValue !== debouncedInput && inputValue.trim().length > 0) {
      return;
    }

    const currentSelectedOptions = events
      .filter((event: IEvent) => selectedIds.includes(event.id))
      .map((event: IEvent) => ({ id: event.id, label: event.name }));

    // Если есть текст для поиска, фильтруем
    if (debouncedInput.trim().length >= 1) {
      const filteredEvents = events.filter((event: IEvent) => 
        event.name.toLowerCase().includes(debouncedInput.toLowerCase())
      ).slice(0, 10);

      const filteredOptions = filteredEvents.map((event: IEvent) => ({
        id: event.id,
        label: event.name
      }));

      const selectedInFiltered = filteredOptions.filter(opt => selectedIds.includes(opt.id));
      const selectedNotInFiltered = currentSelectedOptions.filter(opt => !selectedInFiltered.find(sf => sf.id === opt.id));
      setOptions([...selectedNotInFiltered, ...filteredOptions]);
    } else {
      // Когда поле пустое, показываем только выбранные элементы (если есть) или пустой список
      setOptions(currentSelectedOptions);
    }
  }, [debouncedInput, selectedIds, inputValue, events]);

  // Когда пользователь вводит текст (inputValue изменяется), сразу показываем результаты по полному тексту
  useEffect(() => {
    if (inputValue.trim().length >= 1) {
      // Используем полный inputValue для поиска (не ждем debounce)
      const filtered = events
        .filter((event: IEvent) => event.name.toLowerCase().includes(inputValue.toLowerCase()))
        .slice(0, 10);
      
      const filteredOptions = filtered.map((event: IEvent) => ({
        id: event.id,
        label: event.name
      }));
      
      const currentSelectedOptions = events
        .filter((event: IEvent) => selectedIds.includes(event.id))
        .map((event: IEvent) => ({ id: event.id, label: event.name }));
      
      const selectedInFiltered = filteredOptions.filter(opt => selectedIds.includes(opt.id));
      const selectedNotInFiltered = currentSelectedOptions.filter(opt => !selectedInFiltered.find(sf => sf.id === opt.id));
      setOptions([...selectedNotInFiltered, ...filteredOptions]);
    }
  }, [inputValue, selectedIds, events]);

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
          label="Событие"
          placeholder="Начните вводить название..."
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
