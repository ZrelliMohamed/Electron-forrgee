import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
function UpdateArtcl() {
  const location = useLocation();
  const initialArticleData = location.state.articleData;
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updatedArticle, setUpdatedArticle] = useState({
    designation: '',
    unite: '',
    prix_unitaire: ''
  });

  useEffect(() => {
    if (initialArticleData) {
      setUpdatedArticle(initialArticleData);
    }
  }, [initialArticleData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedArticle((prevArticle) => ({
      ...prevArticle,
      [name]: value,
    }));
  };

  const handleUpdateArticle = async () => {
    window.electron.ipcRenderer.send('Article:Update', updatedArticle)
    window.electron.ipcRenderer.on('Update:Article:succes', (event, data) => {
      setUpdateSuccess(true); // Set success message state to true
      setTimeout(() => {
        setUpdateSuccess(false); // Reset success message after some time
      }, 3000);
    })
    window.electron.ipcRenderer.on('Update:Article:ref?'|| "Update:Article:err", (event, msg) => {
      console.log(msg);
    })


  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    handleUpdateArticle();
  };

  return (
    <div>
      {updateSuccess && (
        <div style={{ background: 'lightgreen', padding: '10px', marginBottom: '10px' }}>
          Article successfully updated.
        </div>
      )}
      <div>
        <form onSubmit={handleButtonClick}>
          <h1>Update Article</h1>
          <table>
            <tbody>
              {/* Designation */}
              <tr>
                <td><label htmlFor="designation">Designation:</label></td>
                <td>
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    value={updatedArticle.designation}
                    onChange={handleInputChange}
                    required
                  />
                </td>
              </tr>

              {/* Unite */}
              <tr>
                <td><label htmlFor="unite">Unite:</label></td>
                <td>
                  <input
                    type="text"
                    id="unite"
                    name="unite"
                    value={updatedArticle.unite}
                    onChange={handleInputChange}
                    required
                  />
                </td>
              </tr>

              {/* Prix Unitaire */}
              <tr>
                <td><label htmlFor="prix_unitaire">Prix Unitaire:</label></td>
                <td>
                  <input
                    type="text"
                    id="prix_unitaire"
                    name="prix_unitaire"
                    value={updatedArticle.prix_unitaire}
                    onChange={handleInputChange}
                    required
                  />
                </td>
              </tr>

              {/* Submit Button */}
              <tr>
                <td colSpan="2">
                  <center>
                    <button type="submit">Update Article</button>
                  </center>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    </div>
  );
}

export default UpdateArtcl;
