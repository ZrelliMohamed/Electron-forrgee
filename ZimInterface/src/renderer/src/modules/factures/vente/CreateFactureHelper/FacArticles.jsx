import React, { useEffect, useState } from "react";

function FacArticles({ setArtcl, artcl }) {
  const hasArticles = artcl !== undefined;
  const [articles, setArticles] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  // hydrate from parent if provided
  useEffect(() => {
    if (hasArticles) {
      setArticles(artcl);
      setArtcl(artcl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasArticles]);

  // keep parent in sync (only with quantity > 0)
  useEffect(() => {
    const validArticles = articles.filter((a) => Number(a.quantity) > 0);
    setArtcl(validArticles);
  }, [articles, setArtcl]);

  const emptyRow = () => ({
    _id: undefined,
    reference: "",
    designation: "",
    unit: "",
    quantity: "",
    pricePerUnit: "",
    totalPrice: (0).toFixed(2),
    remuneration: "",
    discountedPrice: (0).toFixed(2),
  });

  // 🟢 Receive picked article from picker
  useEffect(() => {
    const handler = (_e, picked) => {
      // If no article was chosen (picker closed), add an empty editable line
      if (!picked) {
        setArticles((prev) => [...prev, emptyRow()]);
        return;
      }

      setArticles((prev) => {
        const idx = prev.findIndex(
          (x) => x._id === picked._id || x.reference === picked.reference
        );
        if (idx >= 0) {
          const next = [...prev];
          const q = Number(next[idx].quantity || 0) + 1;
          const price =
            Number(next[idx].pricePerUnit || picked.prix_unitaire || 0);
          const total = q * price;
          const remise = Number(next[idx].remuneration || 0);
          next[idx] = {
            ...next[idx],
            quantity: q,
            pricePerUnit: price,
            totalPrice: total.toFixed(2),
            discountedPrice: (total * (remise / 100)).toFixed(2),
          };
          return next;
        }

        const quantity = 1;
        const pricePerUnit = Number(picked.prix_unitaire || 0);
        const total = quantity * pricePerUnit;
        return [
          ...prev,
          {
            _id: picked._id,
            reference: picked.reference ?? "",
            designation: picked.designation ?? "",
            unit: picked.unite ?? "",
            quantity,
            pricePerUnit,
            totalPrice: total.toFixed(2),
            remuneration: 0, // %
            discountedPrice: (0).toFixed(2),
          },
        ];
      });
    };

    window.electron.ipcRenderer.on("Invoice:articlePicked", handler);
    return () => {
      window.electron.ipcRenderer.removeAllListeners("Invoice:articlePicked");
    };
  }, []);

  const addArticle = () => {
    // open the picker window; if user closes it, picker will emit null and we add an empty row
    window.electron.ipcRenderer.send("Articles:openPicker");
  };

  const deleteArticle = (index) => {
    setArticles((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  // ✏️ Update fields
  const handleArticleChange = (event, index) => {
    const { name, value } = event.target;

    setArticles((prev) => {
      const next = [...prev];
      const row = { ...next[index] };

      if (name === "reference") {
        row.reference = value;
      }
      if (name === "designation") {
        row.designation = value;
      }
      if (name === "unit") {
        row.unit = value;
      }
      if (name === "quantity") {
        row.quantity = value === "" ? "" : Math.max(0, Number(value));
      }
      if (name === "pricePerUnit") {
        row.pricePerUnit = value === "" ? "" : Math.max(0, Number(value));
      }
      if (name === "remuneration") {
        row.remuneration = value === "" ? "" : Math.max(0, Number(value));
      }

      // Recompute totals if numeric fields changed
      const q = Number(row.quantity) || 0;
      const p = Number(row.pricePerUnit) || 0;
      const total = q * p;
      const rem = Number(row.remuneration) || 0;

      row.totalPrice = total.toFixed(2);
      row.discountedPrice = (total * (rem / 100)).toFixed(2);

      next[index] = row;
      return next;
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
              <th className="px-4 py-2 text-center font-medium">
                Quantité Commandée
              </th>
              <th className="px-4 py-2 text-center font-medium">
                Prix Unité HT
              </th>
              <th className="px-4 py-2 text-center font-medium">Prix HT</th>
              <th className="px-4 py-2 text-center font-medium">Remise (%)</th>
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
                    value={article.reference ?? ""}
                    onChange={(e) => handleArticleChange(e, index)}
                    className="w-full px-2 py-1 border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                    readOnly={Boolean(article._id)} // ✅ lock only picked rows, not empty/manual ones
                  />
                </td>
                <td className="px-2 py-1 text-center">
                  <input
                    type="text"
                    name="designation"
                    value={article.designation ?? ""}
                    onChange={(e) => handleArticleChange(e, index)}
                    className="w-full px-2 py-1 border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </td>
                <td className="px-2 py-1 text-center">
                  <input
                    type="text"
                    name="unit"
                    value={article.unit ?? ""}
                    onChange={(e) => handleArticleChange(e, index)}
                    className="w-full px-2 py-1 border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </td>
                <td className="px-2 py-1 text-center">
                  <input
                    type="number"
                    name="quantity"
                    value={article.quantity ?? ""}
                    onChange={(e) => handleArticleChange(e, index)}
                    min="0"
                    step="1"
                    className="w-full px-2 py-1 border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </td>
                <td className="px-2 py-1 text-center">
                  <input
                    type="number"
                    name="pricePerUnit"
                    value={article.pricePerUnit ?? ""}
                    onChange={(e) => handleArticleChange(e, index)}
                    min="0"
                    step="0.001"
                    className="w-full px-2 py-1 border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </td>
                <td className="px-2 py-1 text-center font-semibold text-brand-700">
                  {article.totalPrice}
                </td>
                <td className="px-2 py-1 text-center">
                  <input
                    type="number"
                    name="remuneration"
                    value={article.remuneration ?? ""}
                    onChange={(e) => handleArticleChange(e, index)}
                    min="0"
                    step="0.01"
                    className="w-full px-2 py-1 border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-gray-500 text-xs block mt-1">
                    (-{article.discountedPrice})
                  </span>
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
            {articles.length === 0 && (
              <tr>
                <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                  Aucun article. Cliquez sur “Add Article” pour ouvrir le
                  catalogue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FacArticles;
