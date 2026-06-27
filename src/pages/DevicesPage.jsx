import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useDevices from '../hooks/useDevices';
import { addDevice, deleteDevice, updateDevice, fetchDevices } from '../store/slices/deviceSlice';
import { DEVICE_TYPE_OPTIONS, DEFAULT_DEVICE } from '../utils/constants';
import { getDeviceIcon, getStatusColor, getStatusLabel, formatDate } from '../utils/helpers';

const DevicesPage = () => {
  const dispatch = useDispatch();
  const { allDevices, loading } = useDevices();

  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchFromHeader = useSelector((state) => state.devices.filter.search);
  const [formData, setFormData] = useState(DEFAULT_DEVICE);

  // Filter devices by search
  const filteredDevices = allDevices.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.imei.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.driver?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open modal for new device
  const handleAdd = () => {
    setFormData(DEFAULT_DEVICE);
    setEditingDevice(null);
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (device) => {
  // ✅ Cloner profondément pour éviter les références
  setFormData({
    ...device,
    driver: { ...device.driver },
    position: { ...device.position }
  });
  setEditingDevice(device);
  setShowModal(true);
};

  // Delete device
  const handleDelete = async (id) => {
  if (!window.confirm('⚠ Êtes-vous sûr de vouloir supprimer cet appareil ?')) {
    return;
  }

  try {
    await dispatch(deleteDevice(id)).unwrap();

    // ✅ Force refresh
    await dispatch(fetchDevices()).unwrap();
  } catch (error) {
    console.error('Erreur suppression:', error);
  }
};

  // Submit form
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.imei.length !== 15) {
    alert('⚠ L\'IMEI doit contenir exactement 15 chiffres');
    return;
  }

  try {
    if (editingDevice) {
      console.log('📝 Updating device:', editingDevice.id, formData);

      const result = await dispatch(updateDevice({
        id: editingDevice.id,
        data: formData
      })).unwrap();

      console.log('✅ Update result:', result);
    } else {
      console.log('➕ Adding new device');
      await dispatch(addDevice(formData)).unwrap();
    }

    // Refresh la liste
    await dispatch(fetchDevices()).unwrap();

    // Fermer modal
    setShowModal(false);
    setEditingDevice(null);
    setFormData(DEFAULT_DEVICE);

  } catch (error) {
    console.error('❌ Erreur:', error);
    window.alert('Erreur lors de l\'opération: ' + (error.message || 'Inconnue'));
  }
};

  // Update form field
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDriverChange = (field, value) => {
    setFormData({
      ...formData,
      driver: { ...formData.driver, [field]: value }
    });
  };

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            <span style={styles.titleIcon}>◆</span> DEVICES MANAGEMENT
          </h2>
          <span style={styles.subtitle}>
            Total: {allDevices.length} appareils
          </span>
        </div>

        <button style={styles.addBtn} onClick={handleAdd}>
          + AJOUTER APPAREIL
        </button>
      </div>

      {/* SEARCH BAR */}
      <div style={styles.searchSection}>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>⌕</span>
          <input
            type="text"
            placeholder="Rechercher par nom, IMEI, conducteur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button
              style={styles.clearBtn}
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <colgroup>
            <col style={{ width: '50px' }} />
            <col style={{ width: '130px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '110px' }} />
            <col style={{ width: '150px' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '130px' }} />
            <col style={{ width: '110px' }} />
            <col style={{ width: '100px' }} />
          </colgroup>

          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>NAME</th>
              <th style={styles.th}>TYPE</th>
              <th style={styles.th}>STATUS</th>
              <th style={styles.th}>IMEI</th>
              <th style={styles.th}>PLATE</th>
              <th style={styles.th}>DRIVER</th>
              <th style={styles.th}>LAST UPDATE</th>
              <th style={styles.th}>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {filteredDevices.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ ...styles.td, textAlign: 'center', color: '#444', padding: '40px' }}>
                  Aucun appareil trouvé
                </td>
              </tr>
            ) : (
              filteredDevices.map((device) => (
                <tr key={device.id} style={styles.tr}>
                  <td style={{ ...styles.td, fontSize: '18px' }}>
                    {getDeviceIcon(device.type)}
                  </td>
                  <td style={{ ...styles.td, color: '#00ff41', fontWeight: 600 }}>
                    {device.name}
                  </td>
                  <td style={styles.td}>{device.type}</td>
                  <td style={styles.td}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 9px',
                      borderRadius: '3px',
                      fontSize: '9px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      width: '85px',
                      justifyContent: 'center',
                      color: getStatusColor(device.status),
                      background: `${getStatusColor(device.status)}15`,
                      border: `1px solid ${getStatusColor(device.status)}50`
                    }}>
                      ● {device.status}
                    </span>
                  </td>
                  <td style={{ ...styles.td, fontSize: '10px', color: '#888' }}>
                    {device.imei}
                  </td>
                  <td style={styles.td}>{device.plateNumber || '--'}</td>
                  <td style={styles.td}>{device.driver?.name || '--'}</td>
                  <td style={{ ...styles.td, fontSize: '10px', color: '#666' }}>
                    {device.lastUpdate ? formatDate(device.lastUpdate) : '--'}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        style={styles.actionBtn}
                        onClick={() => handleEdit(device)}
                        title="Modifier"
                      >
                        ✎
                      </button>
                      <button
                        style={{ ...styles.actionBtn, color: '#ff003c', borderColor: 'rgba(255,0,60,0.3)' }}
                        onClick={() => handleDelete(device.id)}
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingDevice ? '✎ MODIFIER APPAREIL' : '+ NOUVEL APPAREIL'}
              </h3>
              <button
                style={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>

              <div style={styles.formGrid}>

                <div style={styles.field}>
                  <label style={styles.label}>NOM *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    style={styles.input}
                    placeholder="ex: FOURGON du BOA"
                  />
                </div>

               <div style={styles.field}>
  <label style={styles.label}>
    IMEI * <span style={{ color: '#444', fontSize: '9px' }}>
      ({formData.imei?.length || 0}/15)
    </span>
  </label>
  <input
    type="text"
    required
    maxLength={15}
    pattern="[0-9]{15}"
    value={formData.imei}
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, '').slice(0, 15);
      handleChange('imei', value);
    }}
    style={{
      ...styles.input,
      borderColor: formData.imei?.length === 15
        ? 'rgba(0, 255, 65, 0.5)'
        : formData.imei?.length > 0
          ? 'rgba(255, 102, 0, 0.5)'
          : '#1a1a1a'
    }}
    placeholder="15 chiffres exactement"
    title="L'IMEI doit contenir exactement 15 chiffres"
  />
</div>

                <div style={styles.field}>
                  <label style={styles.label}>TYPE *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    style={styles.input}
                  >
                    {DEVICE_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>PLAQUE/MARQUE/RACE/AUTRE</label>
                  <input
                    type="text"
                    value={formData.plateNumber || ''}
                    onChange={(e) => handleChange('plateNumber', e.target.value)}
                    style={styles.input}
                    placeholder="ex: 1234 TAA/ I-Phone/ Buldog"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>CONDUCTEUR/PROPRIETAIRE</label>
                  <input
                    type="text"
                    value={formData.driver?.name || ''}
                    onChange={(e) => handleDriverChange('name', e.target.value)}
                    style={styles.input}
                    placeholder="Nom complet"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>TÉLÉPHONE</label>
                  <input
                    type="text"
                    value={formData.driver?.phone || ''}
                    onChange={(e) => handleDriverChange('phone', e.target.value)}
                    style={styles.input}
                    placeholder="ex: 0341234567"
                  />
                </div>

              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  ANNULER
                </button>
                <button type="submit" style={styles.submitBtn}>
                  {editingDevice ? 'METTRE À JOUR' : 'AJOUTER'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default DevicesPage;

// ════════════════════════════════════════
//  STYLES
// ════════════════════════════════════════
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    fontFamily: 'monospace'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '5px'
  },

  title: {
    fontSize: '14px',
    color: '#00ff41',
    letterSpacing: '2px',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textShadow: '0 0 6px rgba(0,255,65,0.4)'
  },

  titleIcon: {
    color: '#00ff41',
    fontSize: '12px',
    textShadow: '0 0 6px #00ff41'
  },

  subtitle: {
    fontSize: '11px',
    color: '#666',
    letterSpacing: '1px'
  },

  addBtn: {
    padding: '8px 16px',
    background: 'rgba(0,255,65,0.1)',
    border: '1px solid #00ff41',
    color: '#00ff41',
    fontFamily: 'monospace',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 0 10px rgba(0,255,65,0.2)'
  },

  searchSection: {
    padding: '14px 16px',
    background: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '5px'
  },

  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    background: '#000',
    border: '1px solid #1a1a1a',
    borderRadius: '3px',
    padding: '0 12px',
    height: '36px'
  },

  searchIcon: {
    color: '#444',
    fontSize: '16px',
    marginRight: '8px'
  },

  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#e0e0e0',
    fontSize: '12px',
    fontFamily: 'monospace'
  },

  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'monospace'
  },

  tableWrapper: {
    background: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '5px',
    overflow: 'hidden'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    fontFamily: 'monospace'
  },

  th: {
    padding: '12px 14px',
    textAlign: 'left',
    verticalAlign: 'middle',
    color: '#00ff41',
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    background: 'rgba(0,255,65,0.04)',
    borderBottom: '1px solid rgba(0,255,65,0.2)',
    whiteSpace: 'nowrap'
  },

  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.02)',
    transition: 'background 0.2s'
  },

  td: {
    padding: '12px 14px',
    textAlign: 'left',
    verticalAlign: 'middle',
    color: '#ccc',
    fontSize: '11px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  actionBtn: {
    width: '28px',
    height: '28px',
    background: 'transparent',
    border: '1px solid rgba(0,255,65,0.3)',
    color: '#00ff41',
    cursor: 'pointer',
    borderRadius: '3px',
    fontFamily: 'monospace',
    fontSize: '12px',
    fontWeight: 700,
    transition: 'all 0.2s'
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },

  modal: {
    width: '90%',
    maxWidth: '600px',
    background: '#0d0d0d',
    border: '1px solid rgba(0,255,65,0.4)',
    borderRadius: '6px',
    boxShadow: '0 0 30px rgba(0,255,65,0.2)',
    overflow: 'hidden'
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #1a1a1a',
    background: 'rgba(0,255,65,0.05)'
  },

  modalTitle: {
    fontSize: '13px',
    color: '#00ff41',
    letterSpacing: '2px',
    margin: 0,
    textShadow: '0 0 6px rgba(0,255,65,0.4)'
  },

  modalClose: {
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    fontSize: '16px',
    fontFamily: 'monospace'
  },

  form: {
    padding: '20px'
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px'
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },

  label: {
    fontSize: '10px',
    color: '#666',
    letterSpacing: '1.5px',
    fontWeight: 700
  },

  input: {
    padding: '8px 12px',
    background: '#000',
    border: '1px solid #1a1a1a',
    borderRadius: '3px',
    color: '#e0e0e0',
    fontSize: '12px',
    fontFamily: 'monospace',
    outline: 'none'
  },

  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #1a1a1a'
  },

  cancelBtn: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #1a1a1a',
    color: '#666',
    fontFamily: 'monospace',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
    borderRadius: '3px',
    cursor: 'pointer'
  },

  submitBtn: {
    padding: '8px 20px',
    background: 'rgba(0,255,65,0.1)',
    border: '1px solid #00ff41',
    color: '#00ff41',
    fontFamily: 'monospace',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    borderRadius: '3px',
    cursor: 'pointer',
    boxShadow: '0 0 10px rgba(0,255,65,0.2)'
  }
};