import React, { useState } from 'react';
import axios from 'axios';
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
  const handleUpdate =  (artcl) => { navigate('/Articles/Update', { state: { articleData: artcl } }); };



  const handleConfirmation = async () => {
    try {
      // Perform delete logic only when confirmed
      await axios.delete(`http://localhost:443/article/del/${article.referance}`);
      console.log(`Deleted article with reference: ${article.referance}`);
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
    <tr>
      <td style={{ textAlign: 'center' }}>{article.referance}</td>
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
      <td style={{ textAlign: 'center' }}><input type="button" value="Update" onClick={() =>handleUpdate(article)} /></td>
    </tr>
  );
}

export default Article;
