import React, { useState } from 'react';
export default function AddArticle() {
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
    const payload = {
    ...articleData,
    reference: Number(articleData.reference),
    prix_unitaire: Number(articleData.prix_unitaire)
  };
  console.log('Submitting article:', payload);
  
    window.electron.ipcRenderer.send('Article:add', payload)
    window.electron.ipcRenderer.on('Article:add:ref?', (event, data) => {
      setErrorMessage('Reference already exists');
      setShowSuccessMessage(false);
    })
    window.electron.ipcRenderer.on('Article:add:succes', (event, data) => {
      console.log('Article added successfully:', data);
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
      console.error('Error adding article:', data);
      setErrorMessage(error.response.data.message);
      setShowSuccessMessage(false);
    })
  };
return (
<div className="max-w-md mx-auto p-6 bg-white shadow-soft rounded-2xl">
  {showSuccessMessage && (
    <div className="bg-brand-200 text-brand-700 p-3 rounded mb-4">
      Article added successfully!
    </div>
  )}
  {errorMessage && (
    <div className="bg-red-200 text-red-800 p-3 rounded mb-4">
      {errorMessage}
    </div>
  )}

  <h2 className="text-2xl font-semibold mb-6 text-brand-600">Ajouter Article</h2>

  <form onSubmit={handleSubmit} className="space-y-4">
    <div>
      <label className="block mb-1 font-medium text-brand-800">Reference:</label>
      <input
        type="number"
        name="reference"
        value={articleData.reference}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
    </div>

    <div>
      <label className="block mb-1 font-medium text-brand-800">Designation:</label>
      <input
        type="text"
        name="designation"
        value={articleData.designation}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
    </div>

    <div>
      <label className="block mb-1 font-medium text-brand-800">Unite:</label>
      <input
        type="text"
        name="unite"
        value={articleData.unite}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
    </div>

    <div>
      <label className="block mb-1 font-medium text-brand-800">Prix Unitaire:</label>
      <input
        type="number"
        name="prix_unitaire"
        value={articleData.prix_unitaire}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
    </div>

    <button
      type="submit"
      className="w-full bg-brand-500 text-white font-semibold py-2 px-4 rounded-2xl hover:bg-brand-600 transition"
    >
      Ajouter
    </button>
  </form>
</div>

)
}