import { CircularProgress, Box } from '@mui/material';

interface LoaderProps {
  classNameDiv?: string;
  size?: 'small' | 'medium' | 'large';
  animation?: boolean;
  color?: string;
  [key: string]: any;
}

export const Loader = ({
  classNameDiv = '',
  size = 'medium',
  animation = true,
  color = '#fff',
  ...props
}: LoaderProps) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 20;
      case 'large': return 40;
      default: return 30;
    }
  };

  return (
    <Box
      className={classNameDiv}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
      }}
    >
      <CircularProgress
        size={getSize()}
        sx={{
          color: color,
          animation: animation ? undefined : 'none'
        }}
        {...props}
      />
    </Box>
  );
};
