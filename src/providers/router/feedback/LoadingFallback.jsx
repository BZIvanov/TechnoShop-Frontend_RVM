import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingFallback = () => {
  return (
    <Box
      display='flex'
      justifyContent='center'
      alignItems='center'
      minHeight='100vh'
    >
      <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
        <CircularProgress size={64} thickness={4} color='primary' />
        <Typography variant='h6' color='primary' fontWeight='bold'>
          Loading...
        </Typography>
      </Box>
    </Box>
  );
};

export default LoadingFallback;
