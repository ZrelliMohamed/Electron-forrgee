import React, { useState } from 'react';
import axios from 'axios';

function AddArticle() {
  const [articleData, setArticleData] = useState({
    designation: '',
    unite: '',
    prix_unitaire: ''
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArticleData({ ...articleData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Make a POST request to your API endpoint to add the article
      await axios.post('http://localhost:443/article/add', articleData);
      console.log('Article added successfully!');
      // Clear the form after successful submission
      setArticleData({
        designation: '',
        unite: '',
        prix_unitaire: ''
      });
      // Show success message for a few seconds
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000); // 3 seconds
    } catch (error) {
      console.error('Error adding article:', error);
    }
  };

  return (
    <div>
      {showSuccessMessage && (
        <div style={{ background: 'lightgreen', padding: '10px', marginBottom: '10px' }}>
          Article added successfully!
        </div>
      )}
      <h2>Add Article</h2>
      <form onSubmit={handleSubmit}>
        <table>
          <tbody>
            <tr>
              <td>
                <label>Designation:</label>
              </td>
              <td>
                <input
                  type="text"
                  name="designation"
                  value={articleData.designation}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>Unite:</label>
              </td>
              <td>
                <input
                  type="text"
                  name="unite"
                  value={articleData.unite}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>Prix Unitaire:</label>
              </td>
              <td>
                <input
                  type="text"
                  name="prix_unitaire"
                  value={articleData.prix_unitaire}
                  onChange={handleChange}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <button type="submit">Add Article</button>
      </form>
    </div>
  );
}

export default AddArticle;
