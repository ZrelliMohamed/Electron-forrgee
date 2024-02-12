import React, { useEffect, useState } from 'react';
import CustomConfirmDialog from '../ClientHelper/CustomConfirmDialog';
import { useNavigate } from 'react-router-dom';

function Fournisseur({ fourn, i, togle }) {
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDeleteButtonVisible, setIsDeleteButtonVisible] = useState(true);
  const handleDelete = async () => {
    setShowConfirmDialog(true); // Show confirmation dialog when attempting to delete
    setIsDeleteButtonVisible(false); // Hide the Delete button
  };
  const handleUpdate = (Frns) => { navigate('/Achat/FournisseurUI/UpdateFourn', { state: { fournData: Frns } }); };

  const handleConfirmation = async () => {
    // Perform delete logic only when confirmed
    window.electron.ipcRenderer.send('Client:delete', fourn.referance)
    window.electron.ipcRenderer.on('DeleteClient:succes', (event, data) => {
      togle();
      setShowConfirmDialog(false); // Close the confirmation dialog
      setIsDeleteButtonVisible(true); // Show the Delete button again
    })
    window.electron.ipcRenderer.on('DeleteClient:ref?', (event, msg) => {
      console.log(msg);
    })
    window.electron.ipcRenderer.on('DeleteClient:err', (event, err) => {
      console.log(err);
    })
  };
     const handleCancel = () => {
      setShowConfirmDialog(false); // Close the confirmation dialog on cancellation
      setIsDeleteButtonVisible(true); // Show the Delete button again
    };
  return (
    <tr key={i}  >
      <td style={{ textAlign: 'center' }}>{String(fourn.referance).slice(0, 3)}&nbsp;{String(fourn.referance).slice(-3)}</td>
      <td style={{ textAlign: 'center' }}>{fourn.clientName}</td>
      <td style={{ textAlign: 'center' }}>{fourn.email}</td>
      <td style={{ textAlign: 'center' }}>
        {fourn.phoneNumber.map((pn, i) => (
          <p key={i}>{pn}<br /></p>
        ))}
      </td>
      <td style={{ textAlign: 'center' }}>{fourn.address}</td>
      <td style={{ textAlign: 'center' }}>{fourn.MF}</td>
      <td style={{ textAlign: 'center' }}>{fourn.fax}</td>
      <td>
        {isDeleteButtonVisible && (
          <button onClick={handleDelete}>Delete</button>
        )}
        {showConfirmDialog && (
          <CustomConfirmDialog
            message="Are you sure you want to delete?"
            onConfirm={handleConfirmation}
            onCancel={handleCancel}
          />
        )}
      </td>
      <td>
        <input type='button' value='Update' onClick={() => handleUpdate(fourn)} />
      </td>
    </tr>
  );
}

export default Fournisseur
