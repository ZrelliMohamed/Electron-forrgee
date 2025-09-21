import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PdfPrinter from "./FactureVenteListHelper/PdfPrinter";

export default function FactureVenteList() {
  const [factures, setFactures] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the 'print' query param
  const params = new URLSearchParams(location.search);
  const printNumero = params.get("print");

  function formatDateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const currentYear = new Date().getFullYear();
  const defaultStartDate = formatDateLocal(new Date(currentYear, 0, 1));
  const defaultEndDate = formatDateLocal(new Date(currentYear, 11, 31));

  const [searchTerm, setSearchTerm] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [isInfoPanelVisible, setIsInfoPanelVisible] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // --- Fetch factures ---
  const getAll = () =>
    new Promise((resolve, reject) => {
      window.electron.ipcRenderer.removeAllListeners("Facture:GetAll:succes");
      window.electron.ipcRenderer.removeAllListeners("Facture:GetAll:err");
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
      window.electron.ipcRenderer.removeAllListeners("Facture:GetByDateRange-reply");
      window.electron.ipcRenderer.removeAllListeners("Facture:GetByDateRange-err");
      window.electron.ipcRenderer.once(
        "Facture:GetByDateRange-reply",
        (event, data) => {
          resolve(data.factures);
        }
      );
      window.electron.ipcRenderer.once(
        "Facture:GetByDateRange-err",
        (event, data) => {
          reject(new Error(data));
        }
      );
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
    // Clean up listeners on unmount
    return () => {
      window.electron.ipcRenderer.removeAllListeners("Facture:GetAll:succes");
      window.electron.ipcRenderer.removeAllListeners("Facture:GetAll:err");
      window.electron.ipcRenderer.removeAllListeners("Facture:GetByDateRange-reply");
      window.electron.ipcRenderer.removeAllListeners("Facture:GetByDateRange-err");
    };
  }, [startDate, endDate]);

  // ✅ Sort newest → oldest (by DateFacture, fallback Numero) ONCE
  const sortedFactures = useMemo(() => {
    return [...factures].sort((a, b) => {
      const da = a?.DateFacture ? new Date(a.DateFacture) : new Date(0);
      const db = b?.DateFacture ? new Date(b.DateFacture) : new Date(0);
      if (db - da !== 0) return db - da; // descending by date
      const na = String(a?.Numero ?? "");
      const nb = String(b?.Numero ?? "");
      return nb.localeCompare(na, undefined, { numeric: true, sensitivity: "base" }); // descending by numero
    });
  }, [factures]);

  const filteredFactures = useMemo(() => {
    return sortedFactures.filter((facture) => {
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
  }, [sortedFactures, searchTerm, minAmount, maxAmount]);

  const totalMontant = useMemo(() => {
    return filteredFactures.reduce(
      (sum, f) => sum + Number(f.totalcalcul?.netAPayer ?? 0),
      0
    );
  }, [filteredFactures]);

  const filterDescription = useMemo(() => {
    const parts = [];

    let startDisplayDate = startDate;
    let endDisplayDate = endDate;

    if (startDate === "" && endDate !== "") {
      startDisplayDate = "début";
    }
    if (startDate !== "" && endDate === "") {
      endDisplayDate = "Aujourd'hui";
    }

    if (startDate || endDate) {
      const start =
        startDisplayDate === "début"
          ? startDisplayDate
          : new Date(startDisplayDate).toLocaleDateString("fr-FR");
      const end =
        endDisplayDate === "Aujourd'hui"
          ? endDisplayDate
          : new Date(endDisplayDate).toLocaleDateString("fr-FR");
      parts.push(`par date du ${start} au ${end}`);
    }

    if (searchTerm) {
      parts.push(`par client/numéro : "${searchTerm}"`);
    }

    if (minAmount && maxAmount) {
      parts.push(`par montant entre ${minAmount} DT et ${maxAmount} DT`);
    } else if (minAmount) {
      parts.push(`par montant supérieur ou égal à ${minAmount} DT`);
    } else if (maxAmount) {
      parts.push(`par montant inférieur ou égal à ${maxAmount} DT`);
    }

    return parts;
  }, [startDate, endDate, searchTerm, minAmount, maxAmount]);

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

  const goPrev = () => selectedIndex > 0 && setSelectedIndex((i) => i - 1);
  const goNext = () =>
    selectedIndex < paginatedFactures.length - 1 &&
    setSelectedIndex((i) => i + 1);

  const goPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedIndex(0);
    }
  };

  const resetDates = () => {
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
  };

  const handleEditFacture = (facture) => {
    navigate(`/factures/vente/edit/${encodeURIComponent(facture.Numero)}`);
  };

  // Find the facture to print if printNumero is present
  const [factureToPrint, setFactureToPrint] = useState(null);

  useEffect(() => {
    if (printNumero && sortedFactures.length > 0) {
      const foundIndex = sortedFactures.findIndex(f => f.Numero === printNumero);
      if (foundIndex !== -1) {
        setFactureToPrint(sortedFactures[foundIndex]);
        // Calculate the page where the facture is
        const page = Math.floor(foundIndex / ITEMS_PER_PAGE) + 1;
        setCurrentPage(page);
        setSelectedIndex(foundIndex % ITEMS_PER_PAGE);
        navigate(location.pathname, { replace: true });
      }
    } else {
      setFactureToPrint(null);
    }
    // eslint-disable-next-line
  }, [printNumero, sortedFactures]);

  return (
    <div className="flex gap-4 h-[calc(100vh-2rem)] p-4">
      {/* 📋 Liste + Filtres */}
      <div className="w-2/5 overflow-auto border rounded-2xl shadow-soft bg-white">
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
              <th className="px-4 py-2 text-center font-medium">Actions</th>
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
                  <td className="px-4 py-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFacture(facture);
                      }}
                      className="px-3 py-1.5 text-sm bg-brand-500 text-white rounded-lg shadow-soft hover:bg-brand-600 transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="icon icon-tabler icons-tabler-outline icon-tabler-edit"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                        <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                        <path d="M16 5l3 3" />
                      </svg>
                    </button>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 p-3 bg-gray-50 rounded-lg shadow mt-2">
            <button
              onClick={() => goPage(1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-brand-100"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-first-icon lucide-chevron-first"
              >
                <path d="m17 18-6-6 6-6" />
                <path d="M7 6v12" />
              </svg>
            </button>
            <button
              onClick={() => goPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-brand-100"
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
                  : "bg-white text-gray-700 hover:bg-brand-100"
              }`}
            >
              Next
            </button>
            <button
              onClick={() => goPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-brand-100"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-last-icon lucide-chevron-last"
              >
                <path d="m7 18 6-6-6-6" />
                <path d="M17 6v12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* 🖨️ PDF + Navigation */}
      <div className="flex-1 flex flex-col">
        {factureToPrint ? (
          <PdfPrinter key={factureToPrint.Numero} factureToPrint={factureToPrint} />
        ) : selectedFacture && (
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

      {/* 💰 Info Total flottante */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex items-center">
        <div
          className={`absolute right-0 top-1/2 -translate-y-1/2 w-80 bg-gray-900/80 backdrop-blur-md text-gray-200 rounded-2xl shadow-soft p-6 transform transition-all duration-300 ease-out
           ${isInfoPanelVisible
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
            }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Détails</h3>
            <button
              onClick={() => setIsInfoPanelVisible(false)}
              className="text-gray-400 hover:text-white transition p-1 rounded-full hover:bg-gray-800"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col gap-y-3 mb-4">
            <div className="flex items-center gap-x-3 bg-gray-800 p-4 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-400">
                  Factures affichées :
                </p>
                <p className="text-xl font-bold text-white">
                  {filteredFactures.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-x-3 bg-gray-800 p-4 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-400">Total :</p>
                <p className="text-xl font-bold text-white">
                  {totalMontant.toLocaleString()} DT
                </p>
              </div>
            </div>
          </div>
          <hr className="my-4 border-t border-gray-700" />
          <div className="text-xs text-gray-400">
            <p className="font-medium text-gray-300 mb-2">Filtres appliqués :</p>
            {filterDescription.length > 0 ? (
              <div className="flex flex-wrap ">
                {filterDescription.map((part, index) => (
                  <span
                    key={index}
                    className=" text-gray-200  px-3 py-1 text-xs font-semibold "
                  >
                    • {part.toLocaleUpperCase()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm">
                Aucun filtre appliqué (Tous Les Facture )
              </p>
            )}
          </div>
        </div>

        {/* Bouton pour ouvrir/fermer le panneau */}
        <button
          onClick={() => setIsInfoPanelVisible(!isInfoPanelVisible)}
          className={`bg-brand-500 text-white p-4 rounded-full shadow-lg cursor-pointer transform transition-all duration-300
            ${isInfoPanelVisible ? "-translate-x-80 rotate-180" : "translate-x-0 rotate-0"}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-landmark-icon lucide-landmark"
          >
            <path d="M10 18v-7" />
            <path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z" />
            <path d="M14 18v-7" />
            <path d="M18 18v-7" />
            <path d="M3 22h18" />
            <path d="M6 18v-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
