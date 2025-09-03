import React, { useEffect, useState } from "react";
import PdfPrinter from "./FactureVenteListHelper/PdfPrinter";

export default function FactureVenteList() {
  const [factures, setFactures] = useState([]);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const getAll = () => {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.once("Facture:GetAll:succes", (event, data) => {
        resolve(data.factures);
      });
      window.electron.ipcRenderer.once("Facture:GetAll:err", (event, data) => {
        reject(new Error(data));
      });
      window.electron.ipcRenderer.send("Facture:GetAll", "information");
    });
  };

  async function fetchDataClient() {
    try {
      const factures = await getAll();
      setFactures(factures);
      if (factures.length > 0) {
        setSelectedFacture(factures[0]);
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    fetchDataClient();
  }, []);

  // Filtered list based on search term (clientName OR Numero)
  const filteredFactures = factures.filter((facture) => {
    const clientName = facture.client?.clientName?.toLowerCase() || "";
    const numero = facture.Numero?.toString().toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return clientName.includes(term) || numero.includes(term);
  });

  // Always reset to first facture in filtered list
  useEffect(() => {
    if (filteredFactures.length > 0) {
      setSelectedFacture(filteredFactures[0]);
    } else {
      setSelectedFacture(null);
    }
  }, [searchTerm, factures]);

  // Index of currently selected facture in filtered list
  const currentIndex = selectedFacture
    ? filteredFactures.findIndex((f) => f.Numero === selectedFacture.Numero)
    : -1;

  const goPrev = () => {
    if (currentIndex > 0) {
      setSelectedFacture(filteredFactures[currentIndex - 1]);
    }
  };

  const goNext = () => {
    if (currentIndex < filteredFactures.length - 1) {
      setSelectedFacture(filteredFactures[currentIndex + 1]);
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-2rem)] p-4">
      {/* Left panel: search + list */}
      <div className="w-1/3 flex flex-col border rounded-xl shadow overflow-hidden">
        {/* Search bar */}
        <div className="p-2 border-b">
          <input
            type="text"
            placeholder="Rechercher par client ou numéro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        {/* Factures list */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-gray-700 border-collapse">
            <thead className="bg-brand-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-center font-medium">Client</th>
                <th className="px-4 py-2 text-center font-medium">Numéro</th>
                <th className="px-4 py-2 text-center font-medium">Date</th>
                <th className="px-4 py-2 text-center font-medium">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFactures.length > 0 ? (
                filteredFactures.map((facture, i) => (
                  <tr
                    key={i}
                    onClick={() => setSelectedFacture(facture)}
                    className={`cursor-pointer hover:bg-brand-100 transition text-center 
                      ${selectedFacture?.Numero === facture.Numero ? "bg-brand-200" : ""}`}
                  >
                    <td className="px-4 py-2">{facture.client?.clientName}</td>
                    <td className="px-4 py-2">{facture.Numero}</td>
                    <td className="px-4 py-2">
                      {new Date(facture.DateFacture)
                        .toLocaleString("fr-FR")
                        .slice(0, 10)}
                    </td>
                    <td className="px-4 py-2">
                      {facture.totalcalcul?.netAPayer} DT
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    Aucune facture trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right panel: PDF with navigation */}
      <div className="flex-1 flex flex-col">
        {selectedFacture && (
          <>
            {/* Navigation buttons */}
            <div className="flex items-center justify-center gap-4 mb-2">
              <button
                onClick={goPrev}
                disabled={currentIndex <= 0}
                className={`px-3 py-1 rounded-lg text-sm border shadow 
                  ${currentIndex <= 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-brand-50"}`}
              >
                ⬅️ Précédent
              </button>

              <span className="text-sm font-medium text-gray-600">
                {currentIndex + 1} / {filteredFactures.length}
              </span>

              <button
                onClick={goNext}
                disabled={currentIndex === filteredFactures.length - 1}
                className={`px-3 py-1 rounded-lg text-sm border shadow 
                  ${currentIndex === filteredFactures.length - 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-brand-50"}`}
              >
                Suivant ➡️
              </button>
            </div>

            {/* PDF Preview */}
            <PdfPrinter
              key={selectedFacture.Numero}
              factureToPrint={selectedFacture}
            />
          </>
        )}
      </div>
    </div>
  );
}
