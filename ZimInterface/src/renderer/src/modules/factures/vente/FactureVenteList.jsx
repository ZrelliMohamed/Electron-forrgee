import React, { useEffect, useMemo, useState } from "react";
import PdfPrinter from "./FactureVenteListHelper/PdfPrinter";

export default function FactureVenteList() {
  const [factures, setFactures] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState(""); // Nouveau: date de début
  const [endDate, setEndDate] = useState("");     // Nouveau: date de fin

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 17;

  // --- Fetch factures ---

  // Fonction pour récupérer toutes les factures
  const getAll = () =>
    new Promise((resolve, reject) => {
      window.electron.ipcRenderer.once("Facture:GetAll:succes", (event, data) => {
        resolve(data.factures);
      });
      window.electron.ipcRenderer.once("Facture:GetAll:err", (event, data) => {
        reject(new Error(data));
      });
      window.electron.ipcRenderer.send("Facture:GetAll", "information");
    });
  
  // Fonction pour récupérer les factures par plage de dates
  const getByDateRange = (dates) => 
    new Promise((resolve, reject) => {
      window.electron.ipcRenderer.once("Facture:GetByDateRange-reply", (event, data) => {
        resolve(data.factures);
      });
      window.electron.ipcRenderer.once("Facture:GetByDateRange-err", (event, data) => {
        reject(new Error(data));
      });
      window.electron.ipcRenderer.send("Facture:GetByDateRange", dates);
    });

  async function fetchDataClient() {
    try {
      let data = [];
      if (startDate || endDate) {
        data = await getByDateRange({ startDate, endDate });
      } else {
        data = await getAll();
      }
      setFactures(data);
      setSelectedIndex(0);
      setCurrentPage(1);
    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    fetchDataClient();
  }, [startDate, endDate]); // Déclenche un rechargement lorsque les dates de début ou de fin changent

  // --- Filtrage combiné ---
  const filteredFactures = useMemo(() => {
    return factures.filter((facture) => {
      const clientName = (facture.client?.clientName ?? "").toLowerCase();
      const numero = (facture.Numero ?? "").toLowerCase();
      const term = (searchTerm ?? "").toLowerCase();
      const matchesText = clientName.includes(term) || numero.includes(term);

      const net = Number(facture.totalcalcul?.netAPayer ?? 0);
      const minOk = minAmount === "" || net >= Number(minAmount);
      const maxOk = maxAmount === "" || net <= Number(maxAmount);
      const matchesAmount = minOk && maxOk;

      return matchesText && matchesAmount;
    });
  }, [factures, searchTerm, minAmount, maxAmount]);

  // --- Paginated data ---
  const totalPages = Math.ceil(filteredFactures.length / ITEMS_PER_PAGE);
  const paginatedFactures = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFactures.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredFactures, currentPage]);

  useEffect(() => {
    setSelectedIndex(0);
    setCurrentPage(1);
  }, [filteredFactures]);

  const selectedFacture =
    paginatedFactures.length > 0 ? paginatedFactures[selectedIndex] : null;

  // Navigation in table
  const goPrev = () => selectedIndex > 0 && setSelectedIndex((i) => i - 1);
  const goNext = () =>
    selectedIndex < paginatedFactures.length - 1 &&
    setSelectedIndex((i) => i + 1);

  // Pagination controls
  const goPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedIndex(0);
    }
  };
  
  const resetDates = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-2rem)] p-4">
      {/* 📋 Liste + Filtres */}
      <div className="w-1/3 overflow-auto border rounded-xl shadow bg-white">
        <div className="p-3 border-b bg-gray-50 text-sm text-gray-600">
          Recherchez par <span className="font-medium">client</span>,{" "}
          <span className="font-medium">numéro</span>,{" "}
          <span className="font-medium">montant</span> et <span className="font-medium">date</span>.
        </div>

        {/* Filtres */}
        <div className="p-3 flex flex-col gap-2 border-b">
          <input
            type="text"
            placeholder="Rechercher client ou numéro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min montant"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <input
              type="number"
              placeholder="Max montant"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                 <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
            </div>
            <button
                onClick={resetDates}
                className="px-3 py-2 rounded-lg text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
                Réinitialiser la date
            </button>
          </div>
        </div>

        {/* Table */}
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
            {paginatedFactures.length > 0 ? (
              paginatedFactures.map((facture, i) => (
                <tr
                  key={`${facture.Numero}-${i}`}
                  onClick={() => setSelectedIndex(i)}
                  className={`cursor-pointer hover:bg-brand-100 transition text-center ${
                    selectedIndex === i ? "bg-brand-200 font-medium" : ""
                  }`}
                >
                  <td className="px-4 py-2">{facture.client?.clientName}</td>
                  <td className="px-4 py-2">{facture.Numero}</td>
                  <td className="px-4 py-2">
                    {new Date(facture.DateFacture).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-2">
                    {facture.totalcalcul?.netAPayer} DT
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                  Aucune facture trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 p-3 bg-gray-50 rounded-lg shadow mt-2">
            <button
              onClick={() => goPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-blue-100"
              }`}
            >
              Prev
            </button>
            <span className="text-sm font-medium text-gray-700">
              Page <span className="font-bold">{currentPage}</span> of{" "}
              <span className="font-bold">{totalPages}</span>
            </span>
            <button
              onClick={() => goPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-blue-100"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* 🖨️ PDF + Navigation */}
      <div className="flex-1 flex flex-col">
        {selectedFacture && (
          <>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={goPrev}
                disabled={selectedIndex === 0}
                className={`px-3 py-1 rounded-lg text-sm shadow-sm ${
                  selectedIndex === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-brand-500 text-white hover:bg-brand-600"
                }`}
              >
                ← Précédent
              </button>
              <span className="text-gray-600 text-sm">
                {paginatedFactures.length > 0 ? selectedIndex + 1 : 0} /{" "}
                {paginatedFactures.length}
              </span>
              <button
                onClick={goNext}
                disabled={
                  selectedIndex === paginatedFactures.length - 1 ||
                  paginatedFactures.length === 0
                }
                className={`px-3 py-1 rounded-lg text-sm shadow-sm ${
                  selectedIndex === paginatedFactures.length - 1 ||
                  paginatedFactures.length === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-brand-500 text-white hover:bg-brand-600"
                }`}
              >
                Suivant →
              </button>
            </div>
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