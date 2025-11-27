import { useState, useEffect } from 'react';
import { Autocomplete, TextField, Chip, Box } from '@mui/material';
import { useDebounce } from 'use-debounce';
import type { SprintAutocompleteProps, AutocompleteOption } from '../../types';
import { useSprints } from '@/hooks/sprints/useSprints';
import type { ISprint } from '@/services/sprints/sprints.types';

export const SprintAutocomplete = ({ selectedIds, onChange, roomId }: SprintAutocompleteProps) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [debouncedInput] = useDebounce(inputValue, 200);
  
  const { sprints, isLoading } = useSprints(
    { page: 1, size: 100 },
    roomId
  );

  // Получаем выбранные элементы
  const selectedOptions = sprints
    .filter((sprint: ISprint) => selectedIds.includes(sprint.id))
    .map((sprint: ISprint) => ({ id: sprint.id, label: sprint.name }));

  // Обновляем опции при изменении debouncedInput (для оптимизации)
  useEffect(() => {
    // Если inputValue изменился после того, как debouncedInput был установлен, не обновляем
    if (inputValue !== debouncedInput && inputValue.trim().length > 0) {
      return;
    }

    const currentSelectedOptions = sprints
      .filter((sprint: ISprint) => selectedIds.includes(sprint.id))
      .map((sprint: ISprint) => ({ id: sprint.id, label: sprint.name }));

    // Если есть текст для поиска, фильтруем
    if (debouncedInput.trim().length >= 1) {
      const filteredSprints = sprints.filter((sprint: ISprint) => 
        sprint.name.toLowerCase().includes(debouncedInput.toLowerCase())
      ).slice(0, 10);

      const filteredOptions = filteredSprints.map((sprint: ISprint) => ({
        id: sprint.id,
        label: sprint.name
      }));

      const selectedInFiltered = filteredOptions.filter(opt => selectedIds.includes(opt.id));
      const selectedNotInFiltered = currentSelectedOptions.filter(opt => !selectedInFiltered.find(sf => sf.id === opt.id));
      setOptions([...selectedNotInFiltered, ...filteredOptions]);
    } else {
      // Когда поле пустое, показываем первые 20 спринтов
      const first20Sprints = sprints.slice(0, 20).map((sprint: ISprint) => ({
        id: sprint.id,
        label: sprint.name
      }));

      const selectedInFirst20 = first20Sprints.filter(opt => selectedIds.includes(opt.id));
      const selectedNotInFirst20 = currentSelectedOptions.filter(opt => !selectedInFirst20.find(sf => sf.id === opt.id));
      setOptions([...selectedNotInFirst20, ...first20Sprints]);
    }
  }, [debouncedInput, selectedIds, inputValue, sprints]);

  // Когда пользователь вводит текст (inputValue изменяется), сразу показываем результаты по полному тексту
  useEffect(() => {
    const currentSelectedOptions = sprints
      .filter((sprint: ISprint) => selectedIds.includes(sprint.id))
      .map((sprint: ISprint) => ({ id: sprint.id, label: sprint.name }));

    if (inputValue.trim().length >= 1) {
      // Используем полный inputValue для поиска (не ждем debounce)
      const filtered = sprints
        .filter((sprint: ISprint) => sprint.name.toLowerCase().includes(inputValue.toLowerCase()))
        .slice(0, 10);
      
      const filteredOptions = filtered.map((sprint: ISprint) => ({
        id: sprint.id,
        label: sprint.name
      }));
      
      const selectedInFiltered = filteredOptions.filter(opt => selectedIds.includes(opt.id));
      const selectedNotInFiltered = currentSelectedOptions.filter(opt => !selectedInFiltered.find(sf => sf.id === opt.id));
      setOptions([...selectedNotInFiltered, ...filteredOptions]);
    } else {
      // Когда поле пустое, показываем первые 20 спринтов
      const first20Sprints = sprints.slice(0, 20).map((sprint: ISprint) => ({
        id: sprint.id,
        label: sprint.name
      }));

      const selectedInFirst20 = first20Sprints.filter(opt => selectedIds.includes(opt.id));
      const selectedNotInFirst20 = currentSelectedOptions.filter(opt => !selectedInFirst20.find(sf => sf.id === opt.id));
      setOptions([...selectedNotInFirst20, ...first20Sprints]);
    }
  }, [inputValue, selectedIds, sprints]);

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
          label="Спринт"
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
