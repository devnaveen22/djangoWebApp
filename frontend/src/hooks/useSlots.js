import { useState, useCallback, useEffect } from 'react';
import AxiosInstance from '../components/AxiosInstance';

export const useSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSlots = useCallback((showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);

    return AxiosInstance.get('slot/')
      .then((res) => {
        setSlots(res.data || []);
        return { success: true, message: '✅ Slots refreshed successfully!' };
      })
      .catch(() => {
        return { success: false, message: '❌ Failed to fetch slots. Please try again.' };
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const stats = {
    available: slots.filter(s => s.status === 'available').length,
    pending: slots.filter(s => s.status === 'pending').length,
    booked: slots.filter(s => s.status === 'booked').length,
  };

  return { slots, loading, refreshing, fetchSlots, stats };
};
