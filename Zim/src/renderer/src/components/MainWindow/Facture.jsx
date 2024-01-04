import React, { useState, useEffect} from 'react';
import GetClient from '../Helper/FactureHelper/GetClient';
import FacArticles from '../Helper/FactureHelper/FacArticles';
import img from '../../assets/Zim.jpg'
import { useNavigate, useLocation } from 'react-router-dom';
function Facture() {
  const [ModeUpdate, setModeUpdate] = useState(false);
  const [dateMin,setDateMin]=useState("2000-01-01")
  const location = useLocation();
  const factureFromLocation = location.state ? location.state.facture : null;
  const [articles, setArticles] = useState([]);
  const [showArticleMessage, setShowArticleMessage] = useState(false);
  const [client, setClient] = useState({});
  const [nextFactureNumber, setNfN] = useState('');
  const navigate = useNavigate()
  const [setting, setSetting] = useState({
    Tva: 0,
    fodec: 0,
    timbreFiscal: 0,
  });
  useEffect(() => {
    if (factureFromLocation === undefined || factureFromLocation === null) {
      setModeUpdate(false);
    } else {
      setModeUpdate(true);
    }
  }, [factureFromLocation, ModeUpdate]);
  const fetchData =() => {
    window.electron.ipcRenderer.removeAllListeners('Facture:Setting-reply')
    window.electron.ipcRenderer.removeAllListeners('Facture:Setting:err')
    window.electron.ipcRenderer.send('Facture:Setting', 'Tva/fodec/timbreFiscal')
    window.electron.ipcRenderer.on('Facture:Setting-reply', (event, data) => {
      const { Tva, fodec, timbreFiscal } = data.documentToSend;
      setSetting({ Tva, fodec, timbreFiscal });
    })
    window.electron.ipcRenderer.on('Facture:Setting:err', (event, data) => {
      setError('Error fetching data: ' + data.message);
    })
  };
  const getThelastDate =() => {
    window.electron.ipcRenderer.removeAllListeners('GetLastDate:succes')
    window.electron.ipcRenderer.send('GetLastDate', '')
    window.electron.ipcRenderer.on('GetLastDate:succes', (event, data) => {
      setDateMin(data.date)
    })
    window.electron.ipcRenderer.on('GetLastDate:ref?', (event, data) => {
      setDateMin(data.date)
    })

  }
  useEffect(() => {
    fetchData();
    getThelastDate()

  }, []);
  const getNextFactureNumber = () => {
    window.electron.ipcRenderer.removeAllListeners('Facture:nextNumero-reply')
    window.electron.ipcRenderer.send('Facture:nextNumero', 'information')
    window.electron.ipcRenderer.on('Facture:nextNumero-reply', (event, data) => {
      setNfN(data.nextFactureNumber)
    })
  }
  useEffect(() => {
    if (!ModeUpdate) {
      getNextFactureNumber()
    }
  }, []);
  // Function to convert number into French words
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
    calculateInvoiceData();
  }, [articles,setting,client]);

  const [invoiceData, setInvoiceData] = useState({
    totalHT: 0,
    remuneration: 0,
    netHT: 0,
    fode: setting.fodec,
    tva: setting.Tva,
    timbreFiscal: setting.timbreFiscal,
    netAPayer: 0,
  });

  const calculateInvoiceData = () => {
    let totalHT = 0;
    let remuneration = 0;

    articles.forEach((article) => {
      totalHT += parseFloat(article.totalPrice);
      if (article.discountedPrice) {
        remuneration += parseFloat(article.discountedPrice);
      }
    });

    const netHT = totalHT - remuneration;
    var fodec = (netHT / 100) * setting.fodec;
    var tva = ((netHT + fodec) / 100) * setting.Tva;
    var netAPayer = 0
    if (client.exonere) {
      fodec = 0
      tva = 0
      netAPayer = netHT + setting.timbreFiscal;
    } else {
      netAPayer = netHT + fodec + tva + setting.timbreFiscal;
    }
    setInvoiceData({
      totalHT: totalHT.toFixed(3),
      remuneration: remuneration.toFixed(3),
      netHT: netHT.toFixed(3),
      fode: fodec.toFixed(3),
      tva: tva.toFixed(3),
      timbreFiscal: setting.timbreFiscal.toFixed(3),
      netAPayer: netAPayer.toFixed(3),
    });
  };
  const netAPayerInFrench = numberToWords(parseFloat(invoiceData.netAPayer));

  const dateUpdateFacture = (date) => {
    if (date) {
      const parts = date.split('-');
      // Ensure parts have leading zeros if needed
      const formattedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      return formattedDate
    }
  }

  // Imprimer et Enregistrer

  const handelPrintAndSave = async () => {
    const filteredArticles = articles.filter(article => {
      return article.reference !== ""
    });
    if (filteredArticles.length > 0) {

      if (!ModeUpdate) {
    window.electron.ipcRenderer.removeAllListeners('Facture:create:succes')
    window.electron.ipcRenderer.removeAllListeners('Facture:create:err')
        window.electron.ipcRenderer.send('Facture:create', {
          DateFacture: dateMin,
          Nbc: 0,
          articles: filteredArticles,
          totalcalcul: invoiceData,
          netAPayer: netAPayerInFrench,
          client: client._id
        })
        window.electron.ipcRenderer.on('Facture:create:succes', (event, data) => {
          navigate(`/Facture/PrintFac`, {
            state: {
              articles: articles,
              client: {...client,referance:client.referance},
              date: dateMin,
              invoiceData: invoiceData,
              netAPayerInFrench: netAPayerInFrench,
              Nbc: 0,
              nextFactureNumber: nextFactureNumber
            }
          })
        })
        window.electron.ipcRenderer.on('Facture:create:err', (event, data) => {

          console.log(data);
        })
      } else {
        window.electron.ipcRenderer.removeAllListeners('Facture:Update:succes')
        window.electron.ipcRenderer.removeAllListeners('Facture:Update:ref?')
        window.electron.ipcRenderer.removeAllListeners('Facture:Update:err')
        /*******************************************Updating********************************************** */
        window.electron.ipcRenderer.send('Facture:Update', {
          _id: factureFromLocation._id,
          DateFacture: factureFromLocation.DateFacture,
          Nbc: 0,
          articles: filteredArticles,
          totalcalcul: invoiceData,
          netAPayer: netAPayerInFrench,
          client: client._id
        })
        window.electron.ipcRenderer.on('Facture:Update:succes', (event, data) => {
          navigate(`/Facture/PrintFac`, {
            state: {
              articles: filteredArticles,
              client: client,
              date: factureFromLocation.DateFacture,
              invoiceData: invoiceData,
              netAPayerInFrench: netAPayerInFrench,
              Nbc: 0,
              nextFactureNumber: factureFromLocation.Numero
            }
          })
          window.electron.ipcRenderer.on('Facture:Update:ref?' || 'Facture:Update:err', (event, data) => {
            console.log('2');
          })
        })
        /************************************************************************************************* */
      }
    } else {
      setShowArticleMessage(true);
    }
  }
  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ width: '25%', padding: '10px', textAlign: 'center' }}></th>
            <th style={{ width: '35%', padding: '10px', textAlign: 'center' }}></th>
            <th style={{ width: '20%', padding: '10px', textAlign: 'center' }}></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid black', padding: '10px', textAlign: 'center' }}>
              <img src={img} alt="Company Logo" style={{ maxWidth: '130px', maxHeight: '100%' }} />
            </td>
            <td style={{ border: '1px solid black', padding: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '24px' }}> {`Facture N°${ModeUpdate ? factureFromLocation?.Numero : nextFactureNumber}`}</span><br />
            </td>
            <td style={{ border: '1px solid black', padding: '10px', textAlign: 'center' }}></td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        {ModeUpdate ? <GetClient setClt={setClient} clt={factureFromLocation?.client} /> : <GetClient setClt={setClient} />}
      </div>
      {(client.referance !== undefined || ModeUpdate) &&
        <>
          <div>
            <table width="100%">
              <tbody>
                <tr>
                  <td>
                    <label htmlFor="date">Date:</label>{' '}
                    {ModeUpdate ?
                      <input
                      type="date"
                      name="date"
                      min={dateMin}
                      value={dateUpdateFacture(factureFromLocation?.DateFacture)}
                      disabled={ModeUpdate}
                    />
                      :
                      <input
                      type="date"
                      name="date"
                      min={dateMin}
                      defaultValue={dateMin}
                      onChange={(e) => setDateMin(e.target.value)}
                      disabled={ModeUpdate}
                    />
                  }
                  </td>
                  <td>
                    <label htmlFor="nbc">N°BC:</label>{' '}
                    <input type="text" name="nbc" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            {ModeUpdate ? <FacArticles setArtcl={setArticles} artcl={factureFromLocation?.articles} /> : <FacArticles setArtcl={setArticles} />}
          </div>
          <div style={{ marginTop: 50 }}>
            <table width='100%' border={1}>
              <thead>
                <tr>
                  <th>Total HT </th>
                  <th>Rem</th>
                  <th>Net HT</th>
                  <th>Fode</th>
                  <th>Tva</th>
                  <th>Timbre Fiscal</th>
                  <th>Net a Payer</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><center>{invoiceData.totalHT}</center></td>
                  <td><center>{invoiceData.remuneration}</center></td>
                  <td><center>{invoiceData.netHT}</center></td>
                  <td><center>{invoiceData.fode}</center></td>
                  <td><center>{invoiceData.tva}</center></td>
                  <td><center>{invoiceData.timbreFiscal}</center></td>
                  <td><center>{invoiceData.netAPayer}</center></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <table width="100%" style={{ marginTop: 50 }}>
              <tbody>
                <tr>
                  <td>
                    Arretée la présente facture a la somme de :{netAPayerInFrench}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            {showArticleMessage && (
              <div style={{ color: 'red', marginTop: '10px' }}>
                Vous devez ajouter au moins un article.
              </div>
            )}

            <input type="button" value={(ModeUpdate?"Update ":'Enregistrer ')+"Et Imprimer"} onClick={handelPrintAndSave} />
          </div>
        </>
      }

    </div>
  );
}
export default Facture;

