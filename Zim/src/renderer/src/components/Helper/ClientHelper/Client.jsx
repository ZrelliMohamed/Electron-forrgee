import React, { useState } from 'react';
import axios from 'axios';
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
    try {
      // Perform delete logic only when confirmed
      await axios.delete(`http://localhost:443/clients/del/${client.referance}`);
      console.log(`Deleted client with reference: ${client.referance}`);
      togle();
    } catch (error) {
      console.log(error);
    } finally {
      setShowConfirmDialog(false); // Close the confirmation dialog
      setIsDeleteButtonVisible(true); // Show the Delete button again
    }
  };

  const handleCancel = () => {
    setShowConfirmDialog(false); // Close the confirmation dialog on cancellation
    setIsDeleteButtonVisible(true); // Show the Delete button again
  };

  return (
    <tr key={i}  >
      <td style={{ textAlign: 'center' }}>{String(client.referance).slice(0,3)}&nbsp;{String(client.referance).slice(-3)}</td>
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
