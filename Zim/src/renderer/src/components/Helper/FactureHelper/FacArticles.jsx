import React, { useEffect, useState } from 'react';

function FacArticles({ setArtcl, artcl }) {
  const hasArticles = artcl !== undefined;
  const [articles, setArticles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
    if (hasArticles) {
      setArticles(artcl);
      setArtcl(artcl)
    }
  }, [hasArticles])

  useEffect(() => {
    setArtcl(articles);
  }, [articles])
  const handleArticleChange = async (event, index) => {
    const { name, value } = event.target;
    window.electron.ipcRenderer.removeAllListeners('Article:getOne:succes');
    window.electron.ipcRenderer.removeAllListeners('Article:getOne:ref?');
    window.electron.ipcRenderer.removeAllListeners('Article:getOne:err');
    if (name === 'reference') {
      if (value === '') {
        // If the reference is empty, set all other fields to their initial values
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
        if (value) {
          window.electron.ipcRenderer.send('Article:getOne', value)
          window.electron.ipcRenderer.on('Article:getOne:succes', (event, data) => {
            // Update the article data based on the retrieved information
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
            setErrorMessage(``);
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

      // Calculate discountedPrice
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
    }
    else if (name === 'quantity' || name === 'pricePerUnit') {

      setArticles((prevArticles) => {
        const updatedArticles = [...prevArticles];
        updatedArticles[index][name] = value;

        // Calculate totalPrice
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
    ])
  };

  const deleteArticle = (index) => {
    setArticles((prevArticles) => {
      const updatedArticles = JSON.parse(JSON.stringify(prevArticles));
      updatedArticles.splice(index, 1);
      return updatedArticles;
    });
  };
  return (
    <>
      {errorMessage && <div>{errorMessage}</div>}
      <button onClick={addArticle}>Add Article</button>
      <table width="100%" >
        <thead>
          <tr>
            <th>Référence</th>
            <th>Désignation</th>
            <th>Unité</th>
            <th>Quantité Commandée</th>
            <th>Prix Unité HT</th>
            <th>Prix HT</th>
            <th>Remise</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article, index) => (
            <tr key={`${index}-${article.reference}`}>
              <td style={{ textAlign: 'center' }}>
                <input
                  type="text"
                  name="reference"
                  defaultValue={article.reference}
                  onChange={(event) => handleArticleChange(event, index)}
                  key={`${index}-${article.reference}`}
                  style={{ textAlign: 'center' }}
                />
              </td>
              <td style={{ textAlign: 'center' }}>
                <input
                  type="text"
                  name="designation"
                  value={article.designation}
                  onChange={(event) => handleArticleChange(event, index)}
                  style={{ textAlign: 'center' }}
                />
              </td>
              <td style={{ textAlign: 'center' }}>
                <input
                  type="text"
                  name="unit"
                  value={article.unit}
                  onChange={(event) => handleArticleChange(event, index)}
                  style={{ textAlign: 'center' }}
                />
              </td>
              <td style={{ textAlign: 'center' }}>
                <input
                  type="number"
                  name="quantity"
                  value={article.quantity}
                  onChange={(event) => handleArticleChange(event, index)}
                  style={{ textAlign: 'center' }}
                />
              </td>
              <td style={{ textAlign: 'center' }}>
                <input
                  type="number"
                  name="pricePerUnit"
                  value={article.pricePerUnit}
                  onChange={(event) => handleArticleChange(event, index)}
                  style={{ textAlign: 'center' }}
                />
              </td>
              <td style={{ textAlign: 'center' }}>{article.totalPrice}</td>
              <td style={{ textAlign: 'center' }}>
                <input
                  type="number"
                  name="remuneration"
                  value={article.remuneration}
                  onChange={(event) => handleArticleChange(event, index)}
                /> &nbsp;{article.discountedPrice} {/* Display the discountedPrice for the current article */}
              </td>
              <td style={{ textAlign: 'center' }}>
                <button onClick={() => deleteArticle(index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </>
  );
}

export default FacArticles;
