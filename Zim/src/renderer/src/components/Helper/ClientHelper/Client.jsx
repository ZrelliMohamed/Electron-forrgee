import React, { useEffect, useState } from 'react';
import CustomConfirmDialog from './CustomConfirmDialog';
import { useNavigate } from 'react-router-dom';

function Client({ client, i, togle }) {
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDeleteButtonVisible, setIsDeleteButtonVisible] = useState(true);

  const handleDelete = async () => {
    setShowConfirmDialog(true); // Show confirmation dialog when attempting to delete
    setIsDeleteButtonVisible(false); // Hide the Delete button
  };

  const handleUpdate = (cl) => { navigate('/Clients/Update', { state: { clientData: cl } }); };

  const handleConfirmation = async () => {
    // Perform delete logic only when confirmed
    window.electron.ipcRenderer.send('Client:delete', client.referance)
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
      <td style={{ textAlign: 'center' }}>{String(client.referance).slice(0, 3)}&nbsp;{String(client.referance).slice(-3)}</td>
      <td style={{ textAlign: 'center' }}>{client.clientName}</td>
      <td style={{ textAlign: 'center' }}>{client.email}</td>
      <td style={{ textAlign: 'center' }}>
        {client.phoneNumber.map((pn, i) => (
          <p key={i}>{pn}<br /></p>
        ))}
      </td>
      <td style={{ textAlign: 'center' }}>{client.address}</td>
      <td style={{ textAlign: 'center' }}>{client.MF}</td>
      <td style={{ textAlign: 'center' }}>{client.fax}</td>
      <td style={{ textAlign: 'center' }}>
        <input type="checkbox" disabled={true} checked={client.exonere ? true : false} />
      </td>


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
        <input type='button' value='Update' onClick={() => handleUpdate(client)} />
      </td>
    </tr>
  );
}

export default Client;
