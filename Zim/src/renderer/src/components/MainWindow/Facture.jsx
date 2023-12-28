import React, { useState, useEffect, useRef } from 'react';
import GetClient from '../Helper/FactureHelper/GetClient';
import FacArticles from '../Helper/FactureHelper/FacArticles';
import img from '../../assets/Zim.jpg'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
function Facture() {
  const [articles, setArticles] = useState([]);
  const [client, setClient] = useState({});
  const [nextFactureNumber, setNfN] = useState('');
  const navigate = useNavigate()
  const [setting, setSetting] = useState({
    Tva: 0,
    fodec: 0,
    timbreFiscal: 0,
});

const fetchData = async () => {
  try {
      const response = await axios.get('http://localhost:443/setting');
      const { Tva, fodec, timbreFiscal } = response.data.document;
      setSetting({ Tva, fodec, timbreFiscal });
  } catch (error) {
      setError('Error fetching data: ' + error.message);
  }
};
useEffect(() => {
  fetchData();
}, []);


  const getNextFactureNumber = async () => {
    const { data } = await axios.get('http://localhost:443/factures/next')
    setNfN(data.nextFactureNumber)
  }
  useEffect(() => {
    getNextFactureNumber()
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

  }, [articles]);

  const [date, setDate] = useState(getFormattedDate());

  function getFormattedDate() {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    return formattedDate;
  }

  const [invoiceData, setInvoiceData] = useState({
    totalHT: 0,
    remuneration: 0,
    netHT: 0,
    fode: setting.fodec,
    tva: setting.timbreFiscal,
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


  // Imprimer et Enregistrer

  const handelPrintAndSave = async () => {
    try {
      await axios.post('http://localhost:443/factures/add',{
        DateFacture:date,
        Nbc:0,
        articles:articles,
        totalcalcul:invoiceData,
        netAPayer:netAPayerInFrench,
        client:client._id
      })
      navigate(`/Facture/PrintFac`, {
        state: {
          articles: articles,
          client: client,
          date: date,
          invoiceData: invoiceData,
          netAPayerInFrench: netAPayerInFrench,
          Nbc: 0,
          nextFactureNumber: nextFactureNumber
        }
      });
    } catch (error) {
      console.log(error);
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
              <span style={{ fontSize: '24px' }}> {`Facture N°${nextFactureNumber}`}</span>
            </td>
            <td style={{ border: '1px solid black', padding: '10px', textAlign: 'center' }}></td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        <GetClient setClt={setClient} />
      </div>
      {client.referance !== undefined &&
        <>

          <div>
            <table width="100%">
              <tbody>
                <tr>
                  <td>
                    <label htmlFor="date">Date:</label>{' '}
                    <input
                      type="date"
                      name="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
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
            <FacArticles setArtcl={setArticles} />
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
            <input type="button" value="Imprimer Et Enregistrer" onClick={handelPrintAndSave} />
          </div>
        </>
      }

    </div>
  );
}

export default Facture;

