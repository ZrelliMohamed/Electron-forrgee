import React, { useState, useEffect } from 'react';
import GetClient from '../Helper/FactureHelper/GetClient';
import FacArticles from '../Helper/FactureHelper/FacArticles';
import img from '../../assets/Zim.jpg'
import { useNavigate, useLocation } from 'react-router-dom';
function Facture() {
  const [exonore, setExonore] = useState(false);
  const [rules, setRules] = useState({
    attestation_num: 0,
    date_Attes: null,
    BCN: 0,
    date_BC: null,
  });

  const [ModeUpdate, setModeUpdate] = useState(false);
  const [dateMin, setDateMin] = useState("2000-01-01")
  const [dateBC, setdateBC] = useState(null)
  const [NumBC, setNumBC] = useState(null)
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
    console.log('factureFromlocation',factureFromLocation);
  }, [factureFromLocation, ModeUpdate]);



  useEffect(() => {
    if(factureFromLocation?.Nbc && factureFromLocation?.dateBC){
      setdateBC(factureFromLocation.dateBC)
      setNumBC(factureFromLocation.Nbc)
      }
  }, [factureFromLocation]);

  const fetchData = () => {
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
  const getThelastDate = () => {
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
  }, [articles, setting, exonore]);

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
    var timbreFiscal=setting.timbreFiscal
    var netAPayer = 0
    if (exonore || factureFromLocation?.exonere.value) {
      fodec = 0
      tva = 0
      timbreFiscal=0
      netAPayer = netHT ;
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
    if((exonore && rules.attestation_num !=0 &&  rules.date_Attes !== null &&  rules.BCN !==0 &&  rules.date_BC !== null) || exonore === false)
    {
      if (filteredArticles.length > 0) {

      if (!ModeUpdate) {

        window.electron.ipcRenderer.removeAllListeners('Facture:create:succes')
        window.electron.ipcRenderer.removeAllListeners('Facture:create:err')
        window.electron.ipcRenderer.send('Facture:create', {
          DateFacture: dateMin,
          Nbc: NumBC,
          dateBC: dateBC,
          articles: filteredArticles,
          totalcalcul: invoiceData,
          netAPayer: netAPayerInFrench,
          client: client._id,
          exonere: { value: exonore, rules: rules }
        })
        window.electron.ipcRenderer.on('Facture:create:succes', (event, data) => {
          navigate(`/Vente/Facture/PrintFac`, {
            state: {
              articles: articles,
              client: { ...client, referance: client.referance },
              date: dateMin,
              invoiceData: invoiceData,
              netAPayerInFrench: netAPayerInFrench,
              Nbc: NumBC,
              dateBC: dateBC,
              nextFactureNumber: nextFactureNumber,
              exonere: { value: exonore, rules: rules }
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
        /*******************************************Updating**********************************************  dateBC
NumBC */
console.log("2",{
  articles: filteredArticles,
  _id: factureFromLocation._id,
  DateFacture: factureFromLocation.DateFacture,
  Nbc: NumBC !== factureFromLocation?.Nbc ?NumBC :factureFromLocation?.Nbc ,
  dateBC: dateBC !== factureFromLocation?.dateBC ?dateBC:factureFromLocation?.dateBC,
  totalcalcul: invoiceData,
  netAPayer: netAPayerInFrench,
  client: client._id,
  exonere: { value: exonore, rules: rules }
});
        window.electron.ipcRenderer.send('Facture:Update', {
          articles: filteredArticles,
          _id: factureFromLocation._id,
          DateFacture: factureFromLocation.DateFacture,
          Nbc: NumBC !== factureFromLocation?.Nbc ?NumBC :factureFromLocation?.Nbc ,
          dateBC: dateBC !== factureFromLocation?.dateBC ?dateBC:factureFromLocation?.dateBC,
          totalcalcul: invoiceData,
          netAPayer: netAPayerInFrench,
          client: client._id,
          exonere: { value: exonore, rules: rules },

        })
        window.electron.ipcRenderer.on('Facture:Update:succes', (event, data) => {
          navigate(`/Vente/Facture/PrintFac`, {
            state: {
              articles: filteredArticles,
              client: client,
              date: factureFromLocation.DateFacture,
              invoiceData: invoiceData,
              netAPayerInFrench: netAPayerInFrench,
              Nbc: NumBC !== factureFromLocation?.Nbc ?NumBC :factureFromLocation?.Nbc ,
              dateBC: dateBC !== factureFromLocation?.dateBC ?dateBC:factureFromLocation?.dateBC,
              nextFactureNumber: factureFromLocation.Numero,
              exonere: { value: exonore, rules: rules },

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

  }else {
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
              <span style={{ fontSize: '24px' }}>
                <label htmlFor="date">Date Du :</label>{' '}
                {ModeUpdate ?
                  <input
                    type="date"
                    name="date"
                    min={dateMin}
                    defaultValue={dateUpdateFacture(factureFromLocation?.DateFacture)}
                    disabled={ModeUpdate}
                  />
                  :
                  <input
                    type="date"
                    name="date"
                    min={dateMin}
                    value={dateMin === "2000-01-01" ? "" : dateMin}
                    onChange={(e) => setDateMin(e.target.value)}
                    disabled={ModeUpdate}
                  />
                }
              </span><br />
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
            <br />
            <br />
            <table width="100%" >
              <tbody>
                <tr >
                  <td>
                    {ModeUpdate ? <>
                      <label htmlFor="nbc">N°BC:</label>
                      <input type="text" name="nbc"
                        defaultValue={factureFromLocation?.Nbc}
                        onChange={(e) => setNumBC(e.target.value)}

                      /></>
                      : <>
                        <label htmlFor="nbc">N°BC:</label>
                        <input type="text" name="nbc"
                          onChange={(e) => setNumBC(e.target.value)}
                        />
                      </>
                    }
                  </td>
                  <td>
                    {ModeUpdate ? <>
                      <label htmlFor="date">Date BC:</label>{' '}
                      <input
                        type="date"
                        name="date"
                        defaultValue={factureFromLocation?.dateBC !== null ? dateUpdateFacture(factureFromLocation?.dateBC) : "jj/mm/aaaa"}
                        onChange={(e) => setdateBC(e.target.value)}

                      />
                    </>
                      : <>
                        <label htmlFor="date">Date BC:</label>{' '}
                        <input
                          type="date"
                          name="date"
                          onChange={(e) => setdateBC(e.target.value)}
                        />
                      </>
                    }
                  </td>
                </tr>
              </tbody>
            </table>
            <br />
           {ModeUpdate?
           factureFromLocation.exonere.value? " veuiller prendre en consideration que cette facture est exonore ✔" : " veuiller prendre en consideration que cette facture n'est pas exonore ✖"
           :
           <div>
              <input type="button" value={`Exonore ${exonore ? "✔" : "✖"}`} style={{ marginLeft: 150 }} onClick={() => {
                setExonore(!exonore)
                setRules({
                  attestation_num: 0,
                  date_Attes: null,
                  BCN: 0,
                  date_BC: null,
                })
              }} /> &nbsp;&nbsp;&nbsp;
              {exonore ? <>
                <span>attestation d'exoneration N° :</span> <input type="text" onChange={(e) => { setRules({ ...rules, attestation_num: e.target.value }) }} />
                du : <input type="date" onChange={(e) => { setRules({ ...rules, date_Attes: e.target.value }) }} />
                BC N° :<input type="text" onChange={(e) => { setRules({ ...rules, BCN: e.target.value }) }} />
                du : <input type="date" onChange={(e) => { setRules({ ...rules, date_BC: e.target.value }) }} /> </>
                : ""
              }
            </div>}
            <br />
            <br />
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
                Veuiller completer la facture avoir la partie exonoration ou articles "la facture doit contenire au moins 1 articles".
              </div>
            )}

            <input type="button" value={(ModeUpdate ? "Update " : 'Enregistrer ') + "Et Imprimer"} onClick={handelPrintAndSave} />
          </div>
        </>
      }

    </div>
  );
}
export default Facture;

