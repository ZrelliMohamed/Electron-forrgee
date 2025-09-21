import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GetClient from "../vente/CreateFactureHelper/GetClient";
import FacArticles from "../vente/CreateFactureHelper/FacArticles";
import img from "../../../assets/images/ZimLogo.png";

export default function ModifierFactureVente() {
  const { numero } = useParams();
  const navigate = useNavigate();

  const [facture, setFacture] = useState(null);
  const [articles, setArticles] = useState([]);
  const [client, setClient] = useState({});
  const [exonore, setExonore] = useState(false);
  const [rules, setRules] = useState({
    attestation_num: 0,
    date_Attes: null,
    BCN: 0,
    date_BC: null,
  });
  const [NumBC, setNumBC] = useState("");
  const [dateBC, setdateBC] = useState("");
  const [setting, setSetting] = useState({
    Tva: 0,
    fodec: 0,
    timbreFiscal: 0,
  });
  const [showArticleMessage, setShowArticleMessage] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    totalHT: 0,
    remuneration: 0,
    netHT: 0,
    fode: 0,
    tva: 0,
    timbreFiscal: 0,
    netAPayer: 0,
  });

  useEffect(() => {
    // Remove previous listeners to avoid duplicates
    window.electron.ipcRenderer.removeAllListeners("Facture:GetOne:succes");
    window.electron.ipcRenderer.removeAllListeners("Facture:GetOne:err");
    window.electron.ipcRenderer.removeAllListeners('Facture:Setting-reply');
    window.electron.ipcRenderer.removeAllListeners('Facture:Setting:err');

    window.electron.ipcRenderer.send("Facture:GetOne", numero);

    window.electron.ipcRenderer.on("Facture:GetOne:succes", (event, data) => {
      setFacture(data.facture);
      setArticles(data.facture.articles || []);
      setClient(data.facture.client || {});
      setExonore(data.facture.exonere?.value || false);
      setRules(data.facture.exonere?.rules || {});
      setNumBC(data.facture.Nbc || "");
      setdateBC(data.facture.dateBC || "");
      setInvoiceData(data.facture.totalcalcul || {});
    });

    window.electron.ipcRenderer.on("Facture:GetOne:err", (event, err) => {
      setFacture(null);
    });

    window.electron.ipcRenderer.send('Facture:Setting', 'Tva/fodec/timbreFiscal');
    window.electron.ipcRenderer.on('Facture:Setting-reply', (event, data) => {
      const { Tva, fodec, timbreFiscal } = data.documentToSend;
      setSetting({ Tva, fodec, timbreFiscal });
    });
    window.electron.ipcRenderer.on('Facture:Setting:err', (event, data) => {
      // handle error if needed
    });

    // Clean up listeners on unmount
    return () => {
      window.electron.ipcRenderer.removeAllListeners("Facture:GetOne:succes");
      window.electron.ipcRenderer.removeAllListeners("Facture:GetOne:err");
      window.electron.ipcRenderer.removeAllListeners('Facture:Setting-reply');
      window.electron.ipcRenderer.removeAllListeners('Facture:Setting:err');
      window.electron.ipcRenderer.removeAllListeners('Facture:Update:succes');
      window.electron.ipcRenderer.removeAllListeners('Facture:Update:err');
    };
  }, [numero]);
  // French number to words (same as your CreateFactureVente)
  function numberToWords(number) {
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
    const currency = 'dinar';
    const millimesUnit = 'millime';

    function convertGroup(n) {
      const result = [];
      if (n >= 1000) {
        if (n === 1000) {
          result.push('mille');
        } else {
          const thousands = Math.floor(n / 1000);
          if (thousands > 1) {
            result.push(convertGroup(thousands) + ' mille');
          } else {
            result.push('mille');
          }
        }
        n %= 1000;
      }
      if (n >= 100) {
        const hundreds = Math.floor(n / 100);
        if (hundreds > 1) {
          result.push(units[hundreds] + ' cent');
        } else {
          result.push('cent');
        }
        n %= 100;
      }
      if (n >= 10 && n <= 19) {
        result.push(teens[n - 10]);
        n = 0;
      } else {
        result.push(tens[Math.floor(n / 10)]);
        n %= 10;
        if (n > 0) {
          result.push(units[n]);
        }
      }
      return result.join(' ');
    }
    function convertMillimes(millimes) {
      if (millimes === 0) {
        return '';
      } else if (millimes < 10) {
        return units[millimes];
      } else {
        return convertGroup(millimes);
      }
    }
    const dinars = Math.floor(number);
    const millimes = Math.round((number - dinars) * 1000);
    const dinarsText = dinars === 1 ? 'dinar' : 'dinars';
    const millimesText = millimes === 1 ? 'millime' : 'millimes';
    const dinarsStr = convertGroup(dinars);
    const millimesStr = convertMillimes(millimes);
    let result = dinarsStr + ' ' + dinarsText;
    if (millimesStr !== '') {
      result += ' et ' + millimesStr + ' ' + millimesText;
    }
    return result;
  }

  useEffect(() => {
    if (facture) {
      calculateInvoiceData();
    }
    // eslint-disable-next-line
  }, [articles, setting, exonore, rules, NumBC, dateBC, facture]);

  const calculateInvoiceData = () => {
    let totalHT = 0;
    let remuneration = 0;
    articles.forEach((article) => {
      totalHT += parseFloat(article.totalPrice || 0);
      if (article.discountedPrice) {
        remuneration += parseFloat(article.discountedPrice);
      }
    });
    const netHT = totalHT - remuneration;
    var fodec = (netHT / 100) * setting.fodec;
    var tva = ((netHT + fodec) / 100) * setting.Tva;
    var timbreFiscal = setting.timbreFiscal;
    var netAPayer = 0;
    if (exonore || facture?.exonere?.value) {
      fodec = 0;
      tva = 0;
      timbreFiscal = 0;
      netAPayer = netHT;
    } else {
      netAPayer = netHT + fodec + tva + setting.timbreFiscal;
    }
    setInvoiceData({
      totalHT: totalHT.toFixed(3),
      remuneration: remuneration.toFixed(3),
      netHT: netHT.toFixed(3),
      fode: fodec.toFixed(3),
      tva: tva.toFixed(3),
      timbreFiscal: timbreFiscal.toFixed(3),
      netAPayer: netAPayer.toFixed(3),
    });
  };

  const netAPayerInFrench = numberToWords(parseFloat(invoiceData.netAPayer));

  // Handler for updating the facture
  const handleUpdate = () => {
    const filteredArticles = articles.filter(article => article.reference !== "");
    if ((exonore && rules.attestation_num !== 0 && rules.date_Attes !== null && rules.BCN !== 0 && rules.date_BC !== null) || exonore === false) {
      if (filteredArticles.length > 0) {
        window.electron.ipcRenderer.removeAllListeners('Facture:Update:succes');
        window.electron.ipcRenderer.removeAllListeners('Facture:Update:err');
        window.electron.ipcRenderer.send('Facture:Update', {
          _id: facture._id,
          DateFacture: facture.DateFacture, // not editable
          Numero: facture.Numero, // not editable
          Nbc: NumBC,
          dateBC: dateBC,
          articles: filteredArticles,
          totalcalcul: invoiceData,
          netAPayer: netAPayerInFrench,
          client: client._id,
          exonere: { value: exonore, rules: rules }
        });
        window.electron.ipcRenderer.on('Facture:Update:succes', () => {
          navigate(`/factures/vente/list?print=${encodeURIComponent(facture.Numero)}`);
        });
        window.electron.ipcRenderer.on('Facture:Update:err', (event, err) => {
          // handle error if needed
        });
      } else {
        setShowArticleMessage(true);
      }
    } else {
      setShowArticleMessage(true);
    }
  };

  if (!facture) {
    return <p className="p-4 text-gray-600">Chargement de la facture...</p>;
  }

  return (
    <div className="space-y-6 px-4 py-8 bg-gray-50 rounded-2xl shadow-soft">
      {/* Header Table */}
      <table className="w-full border-separate border-spacing-0 border border-brand-500 shadow">
        <tbody>
          <tr>
            <td className="w-1/4 border-r border-b border-brand-500 p-2 text-center">
              <img src={img} alt="Company Logo" className="max-w-xs mx-auto max-h-24" />
            </td>
            <td className="w-1/2 border-r border-b border-brand-500 p-2 text-center">
              <span className="text-2xl font-semibold text-brand-700">
                {`Facture N°${facture.Numero}`}
              </span>
              <br />
              <span className="text-lg">
                <label>Date Du :</label>{' '}
                <input
                  type="date"
                  value={
                    facture.DateFacture
                      ? new Date(facture.DateFacture).toISOString().slice(0, 10)
                      : ""
                  }
                  disabled
                  className="mt-2 p-1 border rounded bg-gray-100 text-gray-500"
                />
              </span>
            </td>
            <td className="w-1/4 border-b border-brand-500 p-2"></td>
          </tr>
        </tbody>
      </table>

      {/* Client Information */}
      <div className="mt-4">
        <GetClient setClt={setClient} clt={facture.client} />
      </div>

      {/* BC and Date */}
      <div className="flex flex-col md:flex-row md:space-x-8 mt-8">
        <div className="flex items-center space-x-2">
          <label htmlFor="nbc" className="font-medium">N°BC:</label>
          <input
            type="text"
            name="nbc"
            value={NumBC}
            onChange={(e) => setNumBC(e.target.value)}
            className="p-1 border rounded w-full md:w-auto"
          />
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <label htmlFor="date" className="font-medium">Date BC:</label>
          <input
            type="date"
            name="date"
            value={dateBC}
            onChange={(e) => setdateBC(e.target.value)}
            className="p-1 border rounded w-full md:w-auto"
          />
        </div>
      </div>

      {/* Exoneration Section */}
      <div className="flex flex-wrap items-center space-x-4 mt-6">
        <button
          type="button"
          onClick={() => {
            setExonore(!exonore);
            setRules({
              attestation_num: 0,
              date_Attes: null,
              BCN: 0,
              date_BC: null,
            });
          }}
          className={`py-2 px-4 rounded-md font-semibold transition-colors duration-200 ${exonore
            ? 'bg-brand-500 text-white hover:bg-brand-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          {`Exonoré ${exonore ? '✔' : '✖'}`}
        </button>

        {exonore && (
          <div className="flex flex-wrap items-center space-x-2 text-sm mt-4 md:mt-0">
            <span>attestation d'exonération N°:</span>
            <input
              type="text"
              value={rules.attestation_num}
              onChange={(e) => setRules({ ...rules, attestation_num: e.target.value })}
              className="p-1 border rounded w-24"
            />
            <span>du:</span>
            <input
              type="date"
              value={rules.date_Attes || ""}
              onChange={(e) => setRules({ ...rules, date_Attes: e.target.value })}
              className="p-1 border rounded w-32"
            />
            <span>BC N°:</span>
            <input
              type="text"
              value={rules.BCN}
              onChange={(e) => setRules({ ...rules, BCN: e.target.value })}
              className="p-1 border rounded w-24"
            />
            <span>du:</span>
            <input
              type="date"
              value={rules.date_BC || ""}
              onChange={(e) => setRules({ ...rules, date_BC: e.target.value })}
              className="p-1 border rounded w-32"
            />
          </div>
        )}
      </div>

      {/* Articles */}
      <div className="mt-8">
        <FacArticles setArtcl={setArticles} artcl={articles} />
      </div>

      {/* Invoice Data Table */}
      <div className="mt-12 overflow-x-auto">
        <table className="w-full border-collapse border border-gray-400 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 p-2">Total HT</th>
              <th className="border border-gray-400 p-2">Rem</th>
              <th className="border border-gray-400 p-2">Net HT</th>
              <th className="border border-gray-400 p-2">Fodec</th>
              <th className="border border-gray-400 p-2">Tva</th>
              <th className="border border-gray-400 p-2">Timbre Fiscal</th>
              <th className="border border-gray-400 p-2">Net a Payer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 p-2 text-center">{invoiceData.totalHT}</td>
              <td className="border border-gray-400 p-2 text-center">{invoiceData.remuneration}</td>
              <td className="border border-gray-400 p-2 text-center">{invoiceData.netHT}</td>
              <td className="border border-gray-400 p-2 text-center">{invoiceData.fode}</td>
              <td className="border border-gray-400 p-2 text-center">{invoiceData.tva}</td>
              <td className="border border-gray-400 p-2 text-center">{invoiceData.timbreFiscal}</td>
              <td className="border border-gray-400 p-2 text-center">{invoiceData.netAPayer}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Total in Words */}
      <div className="mt-12">
        <p className="border border-black p-2 rounded-md bg-gray-100">
          Arretée la présente facture a la somme de : {netAPayerInFrench}
        </p>
      </div>

      {/* Buttons and Messages */}
      <div className="mt-8 flex flex-col items-center">
        {showArticleMessage && (
          <div className="text-red-500 text-center mb-4 p-4 border border-red-300 rounded-md bg-red-50">
            Veuillez compléter la facture avec la partie exonération ou articles
            "la facture doit contenir au moins 1 article".
          </div>
        )}
        <button
          type="button"
          onClick={handleUpdate}
          className="bg-brand-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-brand-700 transition-colors duration-300"
        >
          Mettre à jour & Imprimer
        </button>
      </div>
    </div>
  );
}
