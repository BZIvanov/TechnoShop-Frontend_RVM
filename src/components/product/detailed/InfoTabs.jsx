import PropTypes from 'prop-types';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import ProductReviews from './ProductReviews';

const InfoTabs = ({ productId, description }) => {
  const [tabValue, setTabValue] = useState('0');

  return (
    <TabContext value={tabValue}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList
          onChange={(event, newValue) => {
            setTabValue(newValue);
          }}
        >
          <Tab label='Description' value={'0'} />
          <Tab label='Reviews' value={'1'} />
          <Tab label='Contact us' value={'2'} />
        </TabList>
      </Box>
      <TabPanel value={'0'}>{description}</TabPanel>
      <TabPanel value={'1'}>
        <ProductReviews productId={productId} />
      </TabPanel>
      <TabPanel value={'2'}>
        Contact us on +359899 000 111 or on email: info@test.com
      </TabPanel>
    </TabContext>
  );
};

InfoTabs.propTypes = {
  productId: PropTypes.string,
  description: PropTypes.string,
};

export default InfoTabs;
