import React, { useState } from 'react';
function AddArticle() {
  const [articleData, setArticleData] = useState({
    reference: '',
    designation: '',
    unite: '',
    prix_unitaire: ''
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArticleData({ ...articleData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    window.electron.ipcRenderer.send('Article:add', articleData)
    window.electron.ipcRenderer.on('Article:add:ref?', (event, data) => {
      setErrorMessage('Reference already exists');
      setShowSuccessMessage(false);
    })
    window.electron.ipcRenderer.on('Article:add:succes', (event, data) => {
      setArticleData({
        reference: '',
        designation: '',
        unite: '',
        prix_unitaire: ''
      });
      setShowSuccessMessage(true);
      setErrorMessage('');
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000); // 3 seconds

    })

    window.electron.ipcRenderer.on('Article:add:failer', (event, data) => {
      console.error('Error adding article:', error);
      setErrorMessage(error.response.data.message);
      setShowSuccessMessage(false);
    })
  };

  return (
    <div>
      {showSuccessMessage && (
        <div style={{ background: 'lightgreen', padding: '10px', marginBottom: '10px' }}>
          Article added successfully!
        </div>
      )}
      {errorMessage && (
        <div style={{ background: 'lightcoral', padding: '10px', marginBottom: '10px' }}>
          {errorMessage}
        </div>
      )}
      <h2>Add Article</h2>
      <form onSubmit={handleSubmit}>
        <table>
          <tbody>
            <tr>
              <td>
                <label>Reference:</label>
              </td>
              <td>
                <input
                  type="text"
                  name="reference"
                  value={articleData.reference}
                  onChange={handleChange}
                />
              </td>
            </tr>
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
