import Box from '@mui/material/Box';

import { useSelector } from '@/providers/store/store';
import { selectUser } from '@/providers/store/features/user/userSlice';
import { useGetSellerShopQuery } from '@/providers/store/services/shops';
import Header from './header/Header';

const ManagementLayout = () => {
  const user = useSelector(selectUser);

  // load seller's shop info needed for the routes shop status check
  useGetSellerShopQuery(undefined, { skip: user?.role !== 'seller' });

  return (
    <Box>
      <Header shouldRenderSidebar={true} />
    </Box>
  );
};

export default ManagementLayout;
