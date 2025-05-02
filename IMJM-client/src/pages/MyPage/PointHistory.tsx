import React, { useEffect } from 'react';
import { Box, Typography, Divider, Collapse } from '@mui/material';
import { useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const PointHistory = () => {
  const [pointHistory, setPointHistory] = useState([]);
  const [point, setPoint] = useState();

  useEffect(() => {
    axios.get('/api/user/my-point').then((response) => {
      setPoint(response.data);
    });

    axios.get('/api/user/my-point-history').then((response) => {
      setPointHistory(response.data);
    });
  }, [])

  return (
    <Box p={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography fontWeight="bold">
          Point
        </Typography>
        {(point ?? 0).toLocaleString()} P
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          Point usage history
        </Typography>
      </Box>

      {pointHistory.map((item) => (
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>{item.content}</Typography>
            <Typography color="#888">
              {item.usageType === 'SAVE' ? '+ ' : '- '}
              {item.price.toLocaleString()} P
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {dayjs(item.useDate).format('YYYY-MM-DD HH:mm')}
          </Typography>
          <Divider sx={{ mt: 1 }} />
        </Box>
      ))}
    </Box>
  );
};

export default PointHistory;