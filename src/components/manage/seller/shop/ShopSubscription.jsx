import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';

import { useDispatch, useSelector } from '@/providers/store/store';
import { selectShop } from '@/providers/store/features/shop/shopSlice';
import { showNotification } from '@/providers/store/features/notification/notificationSlice';
import { useUpdateSellerShopPayemntStatusMutation } from '@/providers/store/services/shops';
import { useIsApiRequestPending } from '@/hooks/useIsApiRequestPending';

const ShopSubscription = () => {
  const dispatch = useDispatch();

  const shop = useSelector(selectShop);

  const [updatePaymentStatus] = useUpdateSellerShopPayemntStatusMutation();

  const handleUpdatePaymentStatus = async (paymentStatus) => {
    const result = await updatePaymentStatus({ paymentStatus });

    if (!('error' in result)) {
      dispatch(
        showNotification({
          type: 'success',
          message: 'Payment status updated',
        })
      );
    }
  };

  const isLoading = useIsApiRequestPending();

  return (
    <Box
      sx={{ maxWidth: 600, margin: 'auto', padding: 2, textAlign: 'center' }}
    >
      <Typography variant='h5' gutterBottom={true}>
        Payment Status
      </Typography>

      {shop?.paymentStatus !== 'paid' && (
        <Typography variant='body2' gutterBottom={true}>
          Click to pay your monthly subscription tax to activate your shop and
          start posting products
        </Typography>
      )}

      {shop?.paymentStatus === 'paid' ? (
        <Box sx={{ mt: 2 }}>
          <Chip label='Subscribed' color='success' />
          <Button
            sx={{ ml: 2 }}
            variant='outlined'
            color='secondary'
            onClick={() => handleUpdatePaymentStatus('unpaid')}
            disabled={isLoading}
          >
            Unsubscribe
          </Button>
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Chip label='Not subscribed' color='error' />
          <Button
            sx={{ ml: 2 }}
            variant='contained'
            color='primary'
            onClick={() => handleUpdatePaymentStatus('paid')}
            disabled={isLoading}
          >
            Subscribe
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ShopSubscription;
