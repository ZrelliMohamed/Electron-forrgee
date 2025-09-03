import React, { useState } from 'react';
import CustomConfirmDialog from '../../../components/CustomConfirmDialog'; // Import your CustomConfirmDialog component here
import { useNavigate } from 'react-router-dom';
function Article({ article, togle }) {
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDeleteButtonVisible, setIsDeleteButtonVisible] = useState(true);

  // const handleDelete = async () => {
  //   setShowConfirmDialog(true); // Show confirmation dialog when attempting to delete
  //   setIsDeleteButtonVisible(false); // Hide the Delete button
  // };
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
   <>
      <td className="px-4 py-2 text-center">{article.reference}</td>
      <td className="px-4 py-2 text-center">{article.designation}</td>
      <td className="px-4 py-2 text-center">{article.unite}</td>
      <td className="px-4 py-2 text-center">{article.prix_unitaire}</td>

      <td className="px-4 py-2 text-center">
        {/* Bouton supprimer */}
         {isDeleteButtonVisible && ( <button
          onClick={(e) => {
                  window.electron.ipcRenderer.send('AskForDelete:openOnglet', article)
                 }}
          className="bg-red-500 text-white px-3 py-1 rounded-2xl shadow-soft hover:bg-red-600 transition"
        >
          Delete
        </button>
      )}
{showConfirmDialog && (
          <CustomConfirmDialog
            message="Are you sure you want to delete?"
            onConfirm={handleConfirmation}
            onCancel={handleCancel}
          />
        )}
        </td>
      <td className="px-4 py-2 text-center">
        {/* Bouton update */}
        <button
          onClick={() => handleUpdate(article)}
          className="bg-brand-500 text-white px-3 py-1 rounded-2xl shadow-soft hover:bg-brand-600 transition"
        >
          Update
        </button>
      </td>
    </>
  );
}

export default Article;
