import { useState, useEffect, useMemo } from 'react';
import { Autocomplete, TextField, Chip, Box } from '@mui/material';
import { useDebounce } from 'use-debounce';
import type { AmbassadorAutocompleteProps, AutocompleteOption } from '../../types';
import { useAmbassadors } from '@/hooks/ambassador/useAmbassadors';

export const AmbassadorAutocomplete = ({ selectedIds, onChange }: AmbassadorAutocompleteProps) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [debouncedInput] = useDebounce(inputValue, 200);

  // Запрос амбассадоров с фильтрацией по имени, если есть поисковый запрос
  const { ambassadors, isLoading } = useAmbassadors({
    page: 1,
    size: debouncedInput.trim() ? 10 : 20,
    nameContains: debouncedInput.trim() || undefined,
  });

  // Преобразование данных амбассадоров в формат для Autocomplete
  const ambassadorOptions = useMemo<AutocompleteOption[]>(() => {
    return ambassadors.map(amb => ({
      id: amb.id,
      label: (amb as any).name || amb.promoCode || amb.id,
    }));
  }, [ambassadors]);

  // Выбранные опции
  const selectedOptions = useMemo(() => {
    return ambassadorOptions.filter(opt => selectedIds.includes(opt.id));
  }, [ambassadorOptions, selectedIds]);

  useEffect(() => {
    if (debouncedInput.trim().length >= 1) {
      // Фильтруем локально по введенному тексту
      const filtered = ambassadorOptions
        .filter(opt => opt.label.toLowerCase().includes(debouncedInput.toLowerCase()))
        .slice(0, 10);

      const selectedInFiltered = filtered.filter(opt => selectedIds.includes(opt.id));
      const selectedNotInFiltered = selectedOptions.filter(opt => !selectedInFiltered.find(sf => sf.id === opt.id));
      setOptions([...selectedNotInFiltered, ...filtered]);
    } else {
      // Когда поле пустое, показываем первые 20 амбассадоров
      const first20Ambassadors = ambassadorOptions.slice(0, 20);
      const selectedInFirst20 = first20Ambassadors.filter(opt => selectedIds.includes(opt.id));
      const selectedNotInFirst20 = selectedOptions.filter(opt => !selectedInFirst20.find(sf => sf.id === opt.id));
      setOptions([...selectedNotInFirst20, ...first20Ambassadors]);
    }
  }, [debouncedInput, selectedIds, ambassadorOptions, selectedOptions]);

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
        if (reason === 'input' || reason === 'clear') {
          setInputValue(newInputValue);
        }
      }}
      onChange={(_, newValue) => {
        handleChange(_, newValue);
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
