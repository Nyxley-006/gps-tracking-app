import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAlerts,
  markAsRead,
  markAsReadLocal,
  markAllAsRead,
  deleteAlert,
  deleteAllRead
} from '../store/slices/alertSlice';

const useAlerts = () => {
  const dispatch = useDispatch();

  const {
    list,
    filteredList,
    stats,
    loading,
    error
  } = useSelector((state) => state.alerts);

  useEffect(() => {
    if (list.length === 0) {
      dispatch(fetchAlerts());
    }
  }, [dispatch, list.length]);

  // Marquer comme lue (local seulement, sécurisé)
  const markOneAsRead = (id) => {
    dispatch(markAsReadLocal(id));
    dispatch(markAsRead(id));  // Tentative serveur (ignore si échec)
  };

  const markAll = () => {
    list.forEach(alert => {
      if (!alert.read) {
        dispatch(markAsReadLocal(alert.id));
      }
    });
    dispatch(markAllAsRead());
  };

  const removeAlert = (id) => {
    dispatch(deleteAlert(id));
  };

  const removeAllRead = () => {
    dispatch(deleteAllRead());
  };

  const refresh = () => {
    dispatch(fetchAlerts());
  };

  return {
    alerts: filteredList,
    allAlerts: list,
    stats,
    loading,
    error,
    markOneAsRead,
    markAll,
    removeAlert,
    removeAllRead,
    refresh
  };
};

export default useAlerts;