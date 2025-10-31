import { Stack, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { DateRangeSelectorProps } from '../../types';

export const DateRangeSelector = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}: DateRangeSelectorProps) => {
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
      <Typography variant="body2" color="text.secondary">
        с
      </Typography>
      <DatePicker
        value={startDate}
        onChange={onStartDateChange}
        slotProps={{
          textField: {
            size: 'small',
            sx: { 
              width: 150,
              '& .MuiInput-underline:before': { borderBottomColor: '#4caf50' },
              '& .MuiInput-underline:after': { borderBottomColor: '#4caf50' },
            }
          }
        }}
      />
      <Typography variant="body2" color="text.secondary">
        по
      </Typography>
      <DatePicker
        value={endDate}
        onChange={onEndDateChange}
        slotProps={{
          textField: {
            size: 'small',
            sx: { 
              width: 150,
              '& .MuiInput-underline:before': { borderBottomColor: '#4caf50' },
              '& .MuiInput-underline:after': { borderBottomColor: '#4caf50' },
            }
          }
        }}
      />
    </Stack>
  );
};
