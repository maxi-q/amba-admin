import { useState, useEffect } from 'react';
import { Autocomplete, TextField, Chip, Box } from '@mui/material';
import { useDebounce } from 'use-debounce';
import type { AmbassadorAutocompleteProps, AutocompleteOption } from '../../types';
import { mockAmbassadors } from '../../helpers/mockData';

const searchAmbassadors = async (query: string): Promise<AutocompleteOption[]> => {
  await new Promise(resolve => setTimeout(resolve, 150));

  if (!query.trim()) {
    // Когда запрос пустой, возвращаем первые 20 амбассадоров
    return mockAmbassadors
      .slice(0, 20)
      .map(amb => ({ id: amb.id, label: amb.name }));
  }

  const filtered = mockAmbassadors
    .filter(amb =>
      amb.name.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 10)
    .map(amb => ({ id: amb.id, label: amb.name }));

  return filtered;
};

export const AmbassadorAutocomplete = ({ selectedIds, onChange }: AmbassadorAutocompleteProps) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedInput] = useDebounce(inputValue, 200);

  const selectedOptions = mockAmbassadors
    .filter(amb => selectedIds.includes(amb.id))
    .map(amb => ({ id: amb.id, label: amb.name }));

  useEffect(() => {
    if (inputValue !== debouncedInput && inputValue.trim().length > 0) {
      return;
    }

    const currentSelectedOptions = mockAmbassadors
      .filter(amb => selectedIds.includes(amb.id))
      .map(amb => ({ id: amb.id, label: amb.name }));

    setIsLoading(true);
    searchAmbassadors(debouncedInput).then(results => {
      if (inputValue === debouncedInput || inputValue.trim().length === 0) {
        const selectedInResults = results.filter(opt => selectedIds.includes(opt.id));
        const selectedNotInResults = currentSelectedOptions.filter(opt => !selectedInResults.find(sr => sr.id === opt.id));
        setOptions([...selectedNotInResults, ...results]);
      }
      setIsLoading(false);
    });
  }, [debouncedInput, selectedIds, inputValue]);

  useEffect(() => {
    const currentSelectedOptions = mockAmbassadors
      .filter(amb => selectedIds.includes(amb.id))
      .map(amb => ({ id: amb.id, label: amb.name }));

    if (inputValue.trim().length >= 1) {
      const filtered = mockAmbassadors
        .filter(amb => amb.name.toLowerCase().includes(inputValue.toLowerCase()))
        .slice(0, 10)
        .map(amb => ({ id: amb.id, label: amb.name }));

      const selectedInFiltered = filtered.filter(opt => selectedIds.includes(opt.id));
      const selectedNotInFiltered = currentSelectedOptions.filter(opt => !selectedInFiltered.find(sf => sf.id === opt.id));
      setOptions([...selectedNotInFiltered, ...filtered]);
    } else {
      // Когда поле пустое, показываем первые 20 амбассадоров
      const first20Ambassadors = mockAmbassadors
        .slice(0, 20)
        .map(amb => ({ id: amb.id, label: amb.name }));

      const selectedInFirst20 = first20Ambassadors.filter(opt => selectedIds.includes(opt.id));
      const selectedNotInFirst20 = currentSelectedOptions.filter(opt => !selectedInFirst20.find(sf => sf.id === opt.id));
      setOptions([...selectedNotInFirst20, ...first20Ambassadors]);
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
