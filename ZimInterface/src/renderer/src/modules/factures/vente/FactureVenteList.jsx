import React, { useEffect, useMemo, useState } from "react";
import PdfPrinter from "./FactureVenteListHelper/PdfPrinter";

export default function FactureVenteList() {
  const [factures, setFactures] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isInfoPanelVisible, setIsInfoPanelVisible] = useState(false);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 17;

  // --- Fetch factures ---
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
  }, [startDate, endDate]);

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

  // --- Total Montant ---
  const totalMontant = useMemo(() => {
    return filteredFactures.reduce(
      (sum, f) => sum + Number(f.totalcalcul?.netAPayer ?? 0),
      0
    );
  }, [filteredFactures]);

  // --- Description des filtres ---
  const filterDescription = useMemo(() => {
    const parts = [];

    // Logic to handle one date selected
    let startDisplayDate = startDate;
    let endDisplayDate = endDate;

    if (startDate === "" && endDate !== "") {
      startDisplayDate = "début";
    }
    if (startDate !== "" && endDate === "") {
      endDisplayDate = "Aujourd'hui";
    }

    if (startDate || endDate) {
      const start = startDisplayDate === "début"
        ? startDisplayDate
        : new Date(startDisplayDate).toLocaleDateString("fr-FR");
      const end = endDisplayDate === "Aujourd'hui"
        ? endDisplayDate
        : new Date(endDisplayDate).toLocaleDateString("fr-FR");
      parts.push(`par date du ${start} au ${end}`);
    }

    if (searchTerm) {
      parts.push(`par client/numéro : "${searchTerm}"`);
    }

    // New logic for min/max amount description
    if (minAmount && maxAmount) {
      parts.push(`par montant entre ${minAmount} DT et ${maxAmount} DT`);
    } else if (minAmount) {
      parts.push(`par montant supérieur ou égal à ${minAmount} DT`);
    } else if (maxAmount) {
      parts.push(`par montant inférieur ou égal à ${maxAmount} DT`);
    }

    return parts;
  }, [startDate, endDate, searchTerm, minAmount, maxAmount]);



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
          <span className="font-medium">montant</span> et{" "}
          <span className="font-medium">date</span>.
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
                  className={`cursor-pointer hover:bg-brand-100 transition text-center ${selectedIndex === i ? "bg-brand-200 font-medium" : ""
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
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${currentPage === 1
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
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${currentPage === totalPages
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
                className={`px-3 py-1 rounded-lg text-sm shadow-sm ${selectedIndex === 0
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
                className={`px-3 py-1 rounded-lg text-sm shadow-sm ${selectedIndex === paginatedFactures.length - 1 ||
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
      {/* 💰 Info Total flottante - Maintenant au clic */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex items-center">
        <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-80 bg-gray-900/80 backdrop-blur-md text-gray-200 rounded-xl shadow-xl p-6 transform transition-all duration-300 ease-out 
          ${isInfoPanelVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Détails</h3>
            <button onClick={() => setIsInfoPanelVisible(false)} className="text-gray-400 hover:text-white transition p-1 rounded-full hover:bg-gray-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-y-3 mb-4">
            <div className="flex items-center gap-x-3 bg-gray-800 p-4 rounded-lg">
              <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-400">Factures affichées :</p>
                <p className="text-xl font-bold text-white">{filteredFactures.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-x-3 bg-gray-800 p-4 rounded-lg">
              <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8c-1.11 0-2.08-.402-2.599-1M12 8a3 3 0 00-3-3m0 0a3 3 0 00-3 3v11a3 3 0 003 3h14a3 3 0 003-3V8a3 3 0 00-3-3m-9 0a3 3 0 013-3m-9 3l2.257 4.513M21 8l-2.257 4.513M9 16l-2.257 4.513M21 16l-2.257 4.513m-16.146-8.59l4.444-2.222m-16.146 8.59l4.444 2.222m16.146-8.59l-4.444-2.222m16.146 8.59l-4.444 2.222"></path>
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-400">Total :</p>
                <p className="text-xl font-bold text-white">{totalMontant.toLocaleString()} DT</p>
              </div>
            </div>
          </div>
          <hr className="my-4 border-t border-gray-700" />
          {/* Description des filtres */}
          <div className="text-xs text-gray-400">
            <p className="font-medium text-gray-300 mb-2">Filtres appliqués :</p>
            {filterDescription.length > 0 ? (
              <div className="flex flex-wrap ">
                {filterDescription.map((part, index) => (
                  <span key={index} className=" text-gray-200  px-3 py-1 text-xs font-semibold ">
                    •   {part.toLocaleUpperCase()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm">Aucun filtre appliqué</p>
            )}
          </div>
        </div>

        {/* Bouton pour ouvrir/fermer le panneau */}
        <button
          onClick={() => setIsInfoPanelVisible(!isInfoPanelVisible)}
          className={`bg-brand-500 text-white p-4 rounded-full shadow-lg cursor-pointer transform transition-all duration-300
            ${isInfoPanelVisible ? '-translate-x-80 rotate-180' : 'translate-x-0 rotate-0'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" class="lucide lucide-qr-code-icon lucide-qr-code"><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" />
            <rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" />
            <path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" /></svg>
        </button>
      </div>
    </div>
  );
}
