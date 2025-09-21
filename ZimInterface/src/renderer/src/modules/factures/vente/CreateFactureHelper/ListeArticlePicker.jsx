import { useEffect, useRef, useState } from "react";

function ListeArticlePicker() {
  const [articles, setArticles] = useState([]);
  const [query, setQuery] = useState("");
  const chosenRef = useRef(false); // track if user picked something

  useEffect(() => {
    window.electron.ipcRenderer.send("ArticlesPicker:all");

    const ok = (_e, data) => setArticles(data || []);
    const err = (_e, error) =>
      console.error("❌ Failed to fetch articles:", error?.message);

    window.electron.ipcRenderer.on("Articles-reply:Picker", ok);
    window.electron.ipcRenderer.on("Articles-reply:err:Picker", err);

    // If window is closed without a selection, send a null pick
    const handleBeforeUnload = () => {
      if (!chosenRef.current) {
        window.electron.ipcRenderer.send("ArticlesPicker:choose", null);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.electron.ipcRenderer.removeAllListeners("Articles-reply:Picker");
      window.electron.ipcRenderer.removeAllListeners("Articles-reply:err:Picker");
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const filtered = articles.filter((a) =>
    [a.reference, a.designation, a.unite, a.prix_unitaire]
      .join(" ")
      .toLowerCase()
      .includes((query || "").toLowerCase())
  );

  const choose = (a) => {
    chosenRef.current = true;
    window.electron.ipcRenderer.send("ArticlesPicker:choose", a);
    window.close(); // close the picker window after choosing
  };

  return (
    <div className="min-h-screen bg-brand-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-soft overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-brand-100">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un article..."
            className="w-full px-4 py-2 border border-brand-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>

        {/* Table (row click selects) */}
        <table className="min-w-full text-sm">
          <thead className="bg-brand-100 text-left text-brand-900">
            <tr>
              <th className="px-4 py-3">Référence</th>
              <th className="px-4 py-3">Désignation</th>
              <th className="px-4 py-3">Unité</th>
              <th className="px-4 py-3">Prix unitaire</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {filtered.map((a) => (
              <tr
                key={a._id}
                className="hover:bg-brand-50 cursor-pointer"
                onClick={() => choose(a)}
                title="Cliquer pour choisir"
              >
                <td className="px-4 py-3 text-brand-800">{a.reference}</td>
                <td className="px-4 py-3 text-brand-900">{a.designation}</td>
                <td className="px-4 py-3 text-brand-800">{a.unite}</td>
                <td className="px-4 py-3 text-brand-900">{a.prix_unitaire}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-brand-700">
                  Aucun article trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListeArticlePicker;
