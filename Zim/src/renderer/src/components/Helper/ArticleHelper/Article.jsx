import React, { useState } from 'react';
import CustomConfirmDialog from '../ClientHelper/CustomConfirmDialog'; // Import your CustomConfirmDialog component here
import { useNavigate } from 'react-router-dom';
function Article({ article, togle }) {
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDeleteButtonVisible, setIsDeleteButtonVisible] = useState(true);

  const handleDelete = async () => {
    setShowConfirmDialog(true); // Show confirmation dialog when attempting to delete
    setIsDeleteButtonVisible(false); // Hide the Delete button
  };
  const handleUpdate = (artcl) => { navigate('/Vente/Articles/Update', { state: { articleData: artcl } }); };



  const handleConfirmation = async () => {
    window.electron.ipcRenderer.send('Article:delete', article.reference)
    window.electron.ipcRenderer.on('Delete:Article:succes', (event, data) => {
      togle();
      setShowConfirmDialog(false); // Close the confirmation dialog
      setIsDeleteButtonVisible(true); // Show the Delete button again
    })
    window.electron.ipcRenderer.on('Delete:Article:err', (event, data) => {
      console.log(data);
    })

  };

  const handleCancel = () => {
    setShowConfirmDialog(false); // Close the confirmation dialog on cancellation
    setIsDeleteButtonVisible(true); // Show the Delete button again
  };

  return (
    <tr>
      <td style={{ textAlign: 'center' }}>{article.reference}</td>
      <td style={{ textAlign: 'center' }}>{article.designation}</td>
      <td style={{ textAlign: 'center' }}>{article.unite}</td>
      <td style={{ textAlign: 'center' }}>{article.prix_unitaire}</td>

      <td style={{ textAlign: 'center' }}>
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
      <td style={{ textAlign: 'center' }}><input type="button" value="Update" onClick={() => handleUpdate(article)} /></td>
    </tr>
  );
}

export default Article;
