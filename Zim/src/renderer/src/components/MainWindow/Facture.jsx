import React, { useState, useEffect,useRef } from 'react';
import GetClient from '../Helper/FactureHelper/GetClient';
import FacArticles from '../Helper/FactureHelper/FacArticles';

import FacPrinter from '../Helper/FactureHelper/FacPrinter';

function Facture() {
  const [articles, setArticles] = useState([]);
  const [client, setClient] = useState({});



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
    console.log('1',articles);
    console.log(client);
    calculateInvoiceData();
  }, [articles,client]);

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
    fode: 0,
    tva: 0,
    timbreFiscal: 0,
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
    const valfodec = 1;
    const valTva = 19; // 19% TVA
    var fodec = (netHT / 100) * valfodec;
    var tva = ((netHT + fodec) / 100) * valTva;
    const timbreFiscal = 1;
    var netAPayer = 0
    if (client.exonere) {
      fodec = 0
      tva = 0
      netAPayer = netHT + timbreFiscal;
    } else {
      netAPayer = netHT + fodec + tva + timbreFiscal;
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
  // Inside your component:
  const netAPayerInFrench = numberToWords(parseFloat(invoiceData.netAPayer));
  return (
    <div>


        <div>
          <GetClient setClt={setClient} />
        </div>
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
        <FacPrinter articles={articles} client={client} date={date} invoiceData={invoiceData} netAPayerInFrench={netAPayerInFrench}/>

    </div>
  );
}

export default Facture;

