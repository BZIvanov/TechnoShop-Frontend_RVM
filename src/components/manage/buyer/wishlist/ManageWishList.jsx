import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';

import {
  useGetWishlistProductsQuery,
  useRemoveFromWishlistMutation,
} from '@/providers/store/services/wishlists';
import { useConfirmDialog } from '@/contexts/useConfirmDialogContext';
import { currencyFormatter } from '@/utils/formatting';
import { DeleteIcon } from '@/components/mui/Icons';

const ManageWishList = () => {
  const { data } = useGetWishlistProductsQuery();
  const products = data?.products || [];

  const [removeFromWishlist, { isLoading }] = useRemoveFromWishlistMutation();

  const { openDialog, closeDialog } = useConfirmDialog();

  const handleProductDelete = (productId) => () => {
    closeDialog();

    removeFromWishlist(productId);
  };

  return (
    <Box sx={{ padding: (theme) => theme.spacing(1) }}>
      <Typography variant='h5'>Wishlist Products</Typography>

      <Divider sx={{ marginBlock: 2 }} />

      <Box>
        <Paper sx={{ margin: 1 }}>
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell align='center'>Title</TableCell>
                  <TableCell align='center'>Price</TableCell>
                  <TableCell align='center'>Brand</TableCell>
                  <TableCell align='center'>Color</TableCell>
                  <TableCell align='center'>Quantity</TableCell>
                  <TableCell align='center'>Remove</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length > 0 ? (
                  products.map(
                    ({ _id, title, brand, color, price, quantity }) => {
                      return (
                        <TableRow key={_id}>
                          <TableCell align='center'>
                            <Link to={`/product/${_id}`}>{title}</Link>
                          </TableCell>
                          <TableCell align='center'>
                            {currencyFormatter(price)}
                          </TableCell>
                          <TableCell align='center'>{brand}</TableCell>
                          <TableCell align='center'>{color}</TableCell>
                          <TableCell align='center'>{quantity}</TableCell>
                          <TableCell align='center'>
                            <IconButton
                              size='small'
                              onClick={() =>
                                openDialog({
                                  text: 'Are you sure you want to delete this product?',
                                  onConfirm: handleProductDelete(_id),
                                })
                              }
                              disabled={isLoading}
                            >
                              <DeleteIcon fontSize='inherit' />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align='center'>
                      <Typography variant='body2'>
                        <strong>No wishlist products found</strong>
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default ManageWishList;
