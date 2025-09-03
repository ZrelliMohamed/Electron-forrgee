import React, { useEffect, useState } from 'react';
import CustomConfirmDialog from '../../../components/CustomConfirmDialog.jsx';


function OneClient({ client, i, togle }) {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDeleteButtonVisible, setIsDeleteButtonVisible] = useState(true);

const handleDelete = async () => {
    setShowConfirmDialog(true); // Show confirmation dialog when attempting to delete
    setIsDeleteButtonVisible(false); // Hide the Delete button
  };

  const handleUpdate = (cl) => { navigate('/Vente/Clients/Update', { state: { clientData: cl } }); };

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
    <tr key={i} className="hover:bg-brand-50 transition">
      <td className="px-4 py-2 text-center font-mono text-gray-700">
        {String(client.referance).slice(0, 3)}&nbsp;
        {String(client.referance).slice(-3)}
      </td>
      <td className="px-4 py-2 text-center">{client.clientName}</td>
      <td className="px-4 py-2 text-center">{client.email}</td>
      <td className="px-4 py-2 text-center">
        {client.phoneNumber.map((pn, i) => (
          <p key={i} className="font-mono text-sm">
            {pn}
          </p>
        ))}
      </td>
      <td className="px-4 py-2 text-center">{client.address}</td>
      <td className="px-4 py-2 text-center">{client.MF}</td>
      <td className="px-4 py-2 text-center">{client.fax}</td>

      {/* Actions */}
      <td className="px-4 py-2 flex gap-2 justify-center">
        {isDeleteButtonVisible && (
          <button
            onClick={handleDelete}
            className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs 
                       hover:bg-red-600 shadow-sm transition"
          >
            Supprimer
          </button>
        )}
        <button
          onClick={() => handleUpdate(client)}
          className="px-3 py-1 rounded-lg bg-brand-500 text-white text-xs 
                     hover:bg-brand-600 shadow-sm transition"
        >
          Modifier
        </button>

        {showConfirmDialog && (
          <CustomConfirmDialog
            message="Êtes-vous sûr de vouloir supprimer ce client ?"
            onConfirm={handleConfirmation}
            onCancel={handleCancel}
          />
        )}
      </td>
    </tr>
  );



}
export default OneClient;
