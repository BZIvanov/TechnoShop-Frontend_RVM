import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { PDFDownloadLink } from '@react-pdf/renderer';

import { useDispatch } from '@/providers/store/store';
import { useUpdateOrderDeliveryStatusMutation } from '@/providers/store/services/orders';
import { showNotification } from '@/providers/store/features/notification/notificationSlice';
import {
  KeyboardArrowDownIcon,
  KeyboardArrowUpIcon,
  DownloadIcon,
  DownloadingIcon,
} from '@/components/mui/Icons';
import { currencyFormatter, dateFormatter } from '@/utils/formatting';
import PdfCell from './PdfCell';
import { orderDeliveryStatuses } from './constants';

const SellerOrderTableRow = ({ order }) => {
  const dispatch = useDispatch();

  const [isRowExpanded, setIsRowExpanded] = useState(false);

  const {
    _id,
    createdAt,
    totalPrice,
    deliveryAddress,
    deliveryStatus,
    coupon,
    products,
  } = order;
  const { name: couponName } = coupon || {};

  const [updateOrderDeliveryStatus, { isLoading, isSuccess }] =
    useUpdateOrderDeliveryStatusMutation();

  useEffect(() => {
    if (isSuccess) {
      dispatch(
        showNotification({
          type: 'success',
          message: 'Order status updated successfully',
        })
      );
    }
  }, [dispatch, isSuccess]);

  return (
    <>
      <TableRow>
        <TableCell align='center'>
          <IconButton
            size='small'
            onClick={() => setIsRowExpanded((prevValue) => !prevValue)}
          >
            {isRowExpanded ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        </TableCell>
        <TableCell align='center'>{_id}</TableCell>
        <TableCell align='center'>
          {dateFormatter(createdAt, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </TableCell>
        <TableCell align='center'>{currencyFormatter(totalPrice)}</TableCell>
        <TableCell align='center'>{deliveryAddress}</TableCell>
        <TableCell align='center'>{couponName || '-'}</TableCell>
        <TableCell align='center'>
          <FormControl
            sx={{
              width: '100%',
            }}
          >
            <Select
              variant='standard'
              value={deliveryStatus}
              onChange={(event) => {
                updateOrderDeliveryStatus({
                  id: _id,
                  deliveryStatus: event.target.value,
                });
              }}
              disabled={isLoading}
            >
              {Object.keys(orderDeliveryStatuses).map(
                (orderDeliveryStatusKey) => {
                  return (
                    <MenuItem
                      key={orderDeliveryStatusKey}
                      value={orderDeliveryStatuses[orderDeliveryStatusKey]}
                    >
                      {orderDeliveryStatuses[orderDeliveryStatusKey]}
                    </MenuItem>
                  );
                }
              )}
            </Select>
          </FormControl>
        </TableCell>
        <TableCell align='center'>
          <PDFDownloadLink
            document={<PdfCell order={order} />}
            fileName='Orders.pdf'
          >
            {({ loading }) => {
              return (
                <IconButton disabled={loading}>
                  {loading ? <DownloadingIcon /> : <DownloadIcon />}
                </IconButton>
              );
            }}
          </PDFDownloadLink>
        </TableCell>
      </TableRow>

      <TableRow sx={{ '& > *': { borderBottom: 'unset', borderTop: 'unset' } }}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={isRowExpanded} timeout='auto' unmountOnExit={true}>
            <Box sx={{ margin: 1 }}>
              <Typography variant='body1' gutterBottom={true}>
                Products
              </Typography>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'>Product Name</TableCell>
                    <TableCell align='center'>Price</TableCell>
                    <TableCell align='center'>Quantity</TableCell>
                    <TableCell align='center'>Total Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody
                  sx={{
                    // remove the broders from the last row
                    '& > tr:last-child td': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  {products.map((orderProduct) => {
                    const { product, count } = orderProduct;

                    if (!product) {
                      return (
                        <TableRow key={orderProduct._id}>
                          <TableCell colSpan={4} align='center'>
                            <em>No longer available product</em>
                          </TableCell>
                        </TableRow>
                      );
                    }

                    return (
                      <TableRow key={product._id}>
                        <TableCell align='center'>{product.title}</TableCell>
                        <TableCell align='center'>
                          {currencyFormatter(product.price)}
                        </TableCell>
                        <TableCell align='center'>{count}</TableCell>
                        <TableCell align='center'>
                          {currencyFormatter(product.price * count)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

SellerOrderTableRow.propTypes = {
  order: PropTypes.object,
};

export default SellerOrderTableRow;
