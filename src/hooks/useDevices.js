import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDevices,
  setSelectedDevice,
  clearSelectedDevice
} from '../store/slices/deviceSlice';

const useDevices = () => {
  const dispatch = useDispatch();

  const {
    list,
    filteredList,
    selectedDevice,
    stats,
    loading,
    error
  } = useSelector((state) => state.devices);

  // Charger au démarrage
  useEffect(() => {
    if (list.length === 0) {
      dispatch(fetchDevices());
    }
  }, [dispatch, list.length]);

  // ✅ Refresh quand la fenêtre redevient active (focus)
  useEffect(() => {
    const handleFocus = () => {
      dispatch(fetchDevices());
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dispatch]);

  const selectDevice = (device) => {
    dispatch(setSelectedDevice(device));
  };

  const clearSelection = () => {
    dispatch(clearSelectedDevice());
  };

  return {
    devices: filteredList,
    allDevices: list,
    selectedDevice,
    stats,
    loading,
    error,
    selectDevice,
    clearSelection
  };
};

export default useDevices;