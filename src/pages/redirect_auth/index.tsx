import { Box, Typography, Paper } from '@mui/material';
import { Loader } from '../../components/Loader';

const RedirectAuthPage = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      p: 2,
    }}
  >
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxWidth: 400, width: '100%', textAlign: 'center' }}>
      <Loader size="large" />
      <Typography variant="h6" mt={3}>
        Загрузка...
      </Typography>
    </Paper>
  </Box>
);

export default RedirectAuthPage;