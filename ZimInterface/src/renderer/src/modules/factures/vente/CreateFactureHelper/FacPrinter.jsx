import React, { useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import img from '../../../../assets/images/Zim.jpg';
import { useLocation } from 'react-router-dom';
function FacPrinter() {

function dateFormat (date){
  const dateParts = date.split('-');
  const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
  return formattedDate
}

  const [setting, setSetting] = useState({
    Tva: 0,
    fodec: 0,
    timbreFiscal: 0,
  });
  useEffect(() => {
    fetchData();
  }, [setting]);
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
  const iframeRef = useRef(null);
  const location = useLocation();
  const { articles, client, date, invoiceData, netAPayerInFrench, Nbc, dateBC, nextFactureNumber, exonere} = location.state;
  const handlePrint = async () => {
    const doc = new jsPDF();
    let yPos
    let numIterations = Math.ceil(articles.length / 20);
    for (let i = 0; i < numIterations; i++) {
      let startIndex = i * 20;
      let portion = articles.slice(startIndex, startIndex + 20);
      const imgData = await getImageData(img);
      yPos = await addHeaderSection(doc, imgData, nextFactureNumber, date);
      yPos = renderClientInfo(doc, client, yPos);
      yPos = await renderDateAndNbc(doc, dateBC, Nbc, yPos);
      yPos = await generateArticlesTable(doc, portion, yPos);
      if (i === numIterations - 1) {
        if (exonere.value) {
          yPos = addRemarkSection(doc, `Facture émise en suspension de TVA suivant Attestation d'exonoération N° ${exonere.rules.attestation_num} du ${dateFormat(exonere.rules.date_Attes)} et Bon de Commande N° ${exonere.rules.BCN} du ${dateFormat(exonere.rules.date_BC)}
TVA DUE : ${(invoiceData.netAPayer / 100 * setting.Tva).toFixed(3)}`, yPos, 170);
        }
        yPos = addInvoiceDataTable(doc, invoiceData, yPos);
        yPos = addNetAPayerSection(doc, netAPayerInFrench, yPos, 'Arretée la présente facture a la somme de:');
      } else {
        if (exonere.value) {
          yPos = addRemarkSection(doc, `Facture émise en suspension de TVA suivant Attestation d'exonoération N° ${exonere.rules.attestation_num} du ${dateFormat(exonere.rules.date_Attes)} et Bon de Commande N° ${exonere.rules.BCN} du ${dateFormat(exonere.rules.date_BC)}
TVA DUE : ${(invoiceData.netAPayer / 100 * setting.Tva).toFixed(3)}`, yPos, 170);
        }
        yPos = addInvoiceDataTable(doc, {
          totalHT: "",
          remuneration: "",
          netHT: "",
          fode: "",
          tva: "",
          timbreFiscal: "",
          netAPayer: ""
        }, yPos);
        yPos = addNetAPayerSection(doc, '', yPos, '');
      }
      renderFooter(doc);
      if (i !== numIterations - 1) doc.addPage();
    }
    // Save the PDF content to Blob
    const pdfBlob = doc.output('blob');
    // Create a URL for the Blob
    const pdfUrl = URL.createObjectURL(pdfBlob);
    // Show the preview in the iframe
    iframeRef.current.src = pdfUrl;
  };

  const getImageData = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg'); // Convert image to base64
        resolve(dataURL);
      };
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  };

  useEffect(() => {
    handlePrint()
  }, [])
  const addHeaderSection = async (doc, imgData, nextFactureNumber, date) => {
    // Set up initial y position for the table
    let yPos = 10;

    // Add a rectangle at the top for header
    doc.setDrawColor(0, 0, 255);
    doc.setFillColor(255, 255, 255); // Set rectangle fill color
    doc.rect(10, 10, 190, 10, 'F'); // Draw a rectangle (x, y, width, height) with fill

    // Add columns for logo, invoice number, and an empty space
    doc.rect(10, 5, 50, 22); // Logo column
    doc.rect(60, 5, 80, 22); // Invoice number column
    doc.rect(140, 5, 60, 22); // Empty column

    // Add image
    doc.addImage(imgData, 'JPEG', 15, 7, 35, 19);

    // Add text for logo and invoice number in columns
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Set text color to black

    const invoiceText = 'Facture N°:' + nextFactureNumber;
    const invoiceTextWidth = doc.getTextWidth(invoiceText); // Calculate text width

    const centerXPos = (doc.internal.pageSize.width - invoiceTextWidth) / 2; // Calculate center position
    doc.text(invoiceText, centerXPos - 10, 17); // Centered text
    // Add a new line under 'Facture N°:'
    const additionalText = 'Date du: ' + dateFormat(date);
    const additionalTextWidth = doc.getTextWidth(additionalText);
    const additionalTextXPos = (doc.internal.pageSize.width - additionalTextWidth) / 2;
    doc.text(additionalText, additionalTextXPos - 10, 22);

    yPos += 20; // Adjust the vertical position accordingly

    return yPos; // Return the updated y position
  };

  function renderClientInfo(doc, client, yPos) {
    const clientInfoColumn1 = `Référence: ${client.referance || ''}\nClient: ${client.clientName || ''}\nMF: ${client.MF || ''}\nTéléphone: ${client.phoneNumber || ''}`;
    const clientInfoColumn2 = `Adresse: ${client.address || ''}\nFax: ${client.fax || ''}\nEmail: ${client.email || ''}`;

    // Draw rectangles for client information columns
    doc.rect(10, yPos, 95, 20); // Rectangle for column 1
    doc.rect(105, yPos, 95, 20); // Rectangle for column 2

    doc.text(clientInfoColumn1, 13, yPos + 4); // First column
    doc.text(clientInfoColumn2, 107, yPos + 6); // Second column

    return yPos + 26; // Return updated yPos
  }
  const renderDateAndNbc = (doc, date, Nbc, yPos) => {
    console.log(date);
    if (date !== '1970-1-1' && date !== null) {
      const dateColumn = `Date: ${dateFormat(date)}`;
      const nbcColumn = `Nbc: ${Nbc}`;
      doc.setFontSize(12);
      doc.text(dateColumn, 110, yPos);
    }
      Nbc?  doc.text(`Nbc: ${Nbc}`, 13, yPos) :""


    return yPos + 5; // Update yPos and return for further adjustments
  };


  function generateArticlesTable(doc, articles, yPos) {
    const filteredArticles = articles.filter(article => (
      article.reference !== ""
    ));

    const rowsToShow = 20;
    const numberOfArticles = Math.min(filteredArticles.length, rowsToShow);

    const headers = ['Reference', 'Designation', 'Unité', 'Qté', 'PU HT', 'Prix HT', 'Remise %'];

    const data = new Array(rowsToShow).fill([]).map((_, index) => {
      if (index < numberOfArticles) {
        const article = filteredArticles[index];
        return [
          article.reference,
          article.designation.slice(0, 49),
          article.unit,
          article.quantity,
          article.pricePerUnit,
          article.totalPrice,
          article.remuneration
        ];
      } else {
        return ['', '', '', '', '', '', '', ''];
      }
    });

    doc.autoTable({
      startY: yPos,
      head: [headers],
      body: data
    });

    const tableHeight = doc.previousAutoTable.finalY;
    yPos = tableHeight + 8; // Adjust as needed for spacing

    return yPos; // Return the updated yPos value for further adjustments
  }



  function addRemarkSection(doc, remarkText, yPos, maxWidth ) {
    const remarkColumn = doc.splitTextToSize(remarkText, maxWidth);

    doc.setFontSize(12);
    doc.text(remarkColumn, 13, yPos);

    const remarkTextHeight = remarkColumn.length * 2; // Assuming font size is 12

    yPos += remarkTextHeight + 7;

    return yPos; // Return the updated yPos value for further adjustments
  }

  function addInvoiceDataTable(doc, invoiceData, yPos) {
    const headersA = ["Total HT", 'Remise', 'Net HT', 'Fodec', "TVA", "Timbre Fiscal", 'Net a payer'];

    const dataA = [Object.values(invoiceData)];

   doc.autoTable({
      startY: yPos,
      head: [headersA],
      body: dataA,
      styles: {
        body: {
          cellPadding: 5,
          valign: 'middle',
          halign: 'center'
        }
      }
    });
    return yPos; // Return the updated yPos value
  }

  function addNetAPayerSection(doc, netAPayerInFrench, yPos, str) {
    const rectX = 10;
    const rectY = yPos + 18;
    const rectWidthColumn1 = 140;
    const rectWidthColumn2 = 50;
    const rectHeight = 18;

    doc.rect(rectX, rectY, rectWidthColumn1, rectHeight);
    doc.rect(rectX + rectWidthColumn1, rectY, rectWidthColumn2, rectHeight);

    doc.setFontSize(10);
    const firstLineText = str;
    doc.text(firstLineText, rectX + 2, rectY + 7);

    const secondLineText = `${netAPayerInFrench}`;
    doc.text(secondLineText, rectX + 2, rectY + 13);

    yPos += rectHeight + 5; // Adjust the increment for yPos as needed

    return yPos; // Return the updated yPos value
  }

  const renderFooter = (doc) => {
    const line1 = "Entreprise Hamdi zrelli pour le travail a façon - Matricule Fiscal : 1468285 F/A/C/ 000";
    const line2 = "Route de Ceinture 4070 M'saken Tél : 55.542.499 E-mail : Hamdi.Zrelli@hotmail.fr";
    const line3 = "Zitouna Banque Agence M'saken Ville -RIB : 250 018 000 0000121208 01 / RC : N° 0919332017";

    // Function to calculate X position for center alignment
    function calculateXCentered(text) {
      const textWidth = doc.getTextDimensions(text).w;
      const pageWidth = doc.internal.pageSize.width;
      return (pageWidth - textWidth) / 2;
    }

    // Calculate total height of these three lines
    const combinedLinesHeight = doc.getTextDimensions(`${line1}\n${line2}\n${line3}`).h;

    // Set the Y position for the combined lines at the very bottom
    const combinedLinesYPos = doc.internal.pageSize.height - combinedLinesHeight - 10; // Adjust 10 for padding

    // Add these lines at the calculated Y position
    doc.setFontSize(10);
    doc.text(line1, calculateXCentered(line1), combinedLinesYPos);
    doc.text(line2, calculateXCentered(line2), combinedLinesYPos + doc.getTextDimensions(line1).h);
    doc.text(line3, calculateXCentered(line3), combinedLinesYPos + doc.getTextDimensions(line1).h + doc.getTextDimensions(line2).h);
  };
  return (
    <>
      <div style={{ marginTop: '20px' }}>
        <iframe title="PDF Preview" ref={iframeRef} style={{ width: '100%', height: '1080px', border: '1px solid black' }} />
      </div>
    </>
  );
}

export default FacPrinter;
