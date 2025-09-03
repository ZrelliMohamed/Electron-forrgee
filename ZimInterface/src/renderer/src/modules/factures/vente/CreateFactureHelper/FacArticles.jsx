import React, { useEffect, useState } from 'react';

function FacArticles({ setArtcl, artcl }) {
  const hasArticles = artcl !== undefined;
  const [articles, setArticles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (hasArticles) {
      setArticles(artcl);
      setArtcl(artcl);
    }
  }, [hasArticles]);

  useEffect(() => {
    setArtcl(articles);
  }, [articles]);

  const handleArticleChange = async (event, index) => {
    const { name, value } = event.target;
    
    window.electron.ipcRenderer.removeAllListeners('Article:getOne:succes');
    window.electron.ipcRenderer.removeAllListeners('Article:getOne:ref?');
    window.electron.ipcRenderer.removeAllListeners('Article:getOne:err');
    
    if (name === 'reference') {
      if (value === '') {
        setArticles((prevArticles) => {
          const updatedArticles = [...prevArticles];
          updatedArticles[index] = {
            reference: '',
            designation: '',
            unit: '',
            quantity: 0,
            pricePerUnit: 0,
            totalPrice: 0,
            remuneration: 0,
          };
          return updatedArticles;
        });
      } else {
        if (value === 0 || value === 1 || value) {
          window.electron.ipcRenderer.send('Article:getOne', value);
          window.electron.ipcRenderer.on('Article:getOne:succes', (event, data) => {
            setArticles((prevArticles) => {
              const updatedArticles = [...prevArticles];
              updatedArticles[index] = {
                reference: data.reference,
                designation: data.designation,
                unit: data.unite,
                quantity: 0,
                pricePerUnit: data.prix_unitaire,
                totalPrice: 0,
                remuneration: 0,
              };
              return updatedArticles;
            });
            setErrorMessage('');
          });
          window.electron.ipcRenderer.on("Article:getOne:ref?" || "Article:getOne:err", (event, data) => {
            setErrorMessage(`Error retrieving article data for reference ${value}`);
            setArticles((prevArticles) => {
              const updatedArticles = [...prevArticles];
              updatedArticles[index] = {
                reference: '',
                designation: '',
                unit: 0,
                quantity: 0,
                pricePerUnit: 0,
                totalPrice: 0,
                remuneration: 0,
              };
              return updatedArticles;
            });
          });
        }
      }
    }

    if (name === 'remuneration') {
      setArticles((prevArticles) => {
        const updatedArticles = [...prevArticles];
        updatedArticles[index][name] = value;
        const remuneration = parseFloat(value);
        if (!isNaN(remuneration)) {
          const totalPrice = parseFloat(updatedArticles[index].totalPrice);
          const newDiscountedPrice = (totalPrice / 100 * remuneration).toFixed(2);
          updatedArticles[index].discountedPrice = newDiscountedPrice;
        } else {
          updatedArticles[index].discountedPrice = updatedArticles[index].totalPrice;
        }
        return updatedArticles;
      });
    } else if (name === 'quantity' || name === 'pricePerUnit') {
      setArticles((prevArticles) => {
        const updatedArticles = [...prevArticles];
        updatedArticles[index][name] = value;
        const quantity = parseFloat(updatedArticles[index].quantity);
        const pricePerUnit = parseFloat(updatedArticles[index].pricePerUnit);
        if (!isNaN(quantity) && !isNaN(pricePerUnit)) {
          updatedArticles[index].totalPrice = (quantity * pricePerUnit).toFixed(2);
        } else {
          updatedArticles[index].totalPrice = 0;
        }
        return updatedArticles;
      });
    }
  };

  const addArticle = () => {
    setArticles((prevArticles) => [
      ...prevArticles,
      {
        reference: '',
        designation: '',
        unit: '',
        quantity: 0,
        pricePerUnit: 0,
        totalPrice: 0,
        remuneration: 0,
      },
    ]);
  };

  const deleteArticle = (index) => {
    setArticles((prevArticles) => {
      const updatedArticles = JSON.parse(JSON.stringify(prevArticles));
      updatedArticles.splice(index, 1);
      return updatedArticles;
    });
  };

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {errorMessage}
        </div>
      )}
      <div className="flex justify-end">
        <button
          onClick={addArticle}
          className="bg-brand-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-brand-600 transition-colors"
        >
          Add Article
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-soft border border-gray-200">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-center font-medium">Référence</th>
              <th className="px-4 py-2 text-center font-medium">Désignation</th>
              <th className="px-4 py-2 text-center font-medium">Unité</th>
              <th className="px-4 py-2 text-center font-medium">Quantité Commandée</th>
              <th className="px-4 py-2 text-center font-medium">Prix Unité HT</th>
              <th className="px-4 py-2 text-center font-medium">Prix HT</th>
              <th className="px-4 py-2 text-center font-medium">Remise</th>
              <th className="px-4 py-2 text-center font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {articles.map((article, index) => (
              <tr key={index}>
                <td className="px-2 py-1 text-center">
                  <input
                    type="text"
                    name="reference"
                    defaultValue={article.reference}
                    onChange={(event) => handleArticleChange(event, index)}
                    className="w-full px-2 py-1 border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </td>
                <td className="px-2 py-1 text-center">
                  <input
                    type="text"
                    name="designation"
                    value={article.designation}
                    onChange={(event) => handleArticleChange(event, index)}
                    className="w-full px-2 py-1 border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </td>
                <td className="px-2 py-1 text-center">
                  <input
                    type="text"
                    name="unit"
                    value={article.unit}
                    onChange={(event) => handleArticleChange(event, index)}
                    className="w-full px-2 py-1 border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </td>
                <td className="px-2 py-1 text-center">
                  <input
                    type="number"
                    name="quantity"
                    value={article.quantity}
                    onChange={(event) => handleArticleChange(event, index)}
                    className="w-full px-2 py-1 border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </td>
                <td className="px-2 py-1 text-center">
                  <input
                    type="number"
                    name="pricePerUnit"
                    value={article.pricePerUnit}
                    onChange={(event) => handleArticleChange(event, index)}
                    className="w-full px-2 py-1 border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </td>
                <td className="px-2 py-1 text-center font-semibold text-brand-700">{article.totalPrice}</td>
                <td className="px-2 py-1 text-center">
                  <input
                    type="number"
                    name="remuneration"
                    value={article.remuneration}
                    onChange={(event) => handleArticleChange(event, index)}
                    className="w-full px-2 py-1 border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-gray-500 text-xs block mt-1">(-{article.discountedPrice})</span>
                </td>
                <td className="px-2 py-1 text-center">
                  <button
                    onClick={() => deleteArticle(index)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FacArticles;