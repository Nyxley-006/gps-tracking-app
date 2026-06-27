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

  // ✅ Charger les devices UNE SEULE FOIS au démarrage
  useEffect(() => {
    if (list.length === 0) {
      dispatch(fetchDevices());
    }
  }, [dispatch, list.length]);

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