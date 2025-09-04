import jsPDF from 'jspdf';
import React, { useEffect, useRef, useState } from 'react';
import 'jspdf-autotable';
import img from '../../../../assets/images/Zim.jpg';

// Helper function to wrap text at a specific character limit
const wrapTextByCharLimit = (text, limit) => {
  if (!text) return [''];
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length <= limit) {
      currentLine += (currentLine.length > 0 ? ' ' : '') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  lines.push(currentLine);
  return lines;
};

// Main Component
function FacPrinter({ factureToPrint }) {
  
function dateFormat (date){
  const dateParts = date.split('-');
  const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
  return formattedDate
}
  const iframeRef = useRef(null);
  const [setting, setSetting] = useState({ Tva: 0, fodec: 0, timbreFiscal: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      window.electron.ipcRenderer.removeAllListeners('Facture:Setting-reply');
      window.electron.ipcRenderer.removeAllListeners('Facture:Setting:err');
      window.electron.ipcRenderer.send('Facture:Setting', 'Tva/fodec/timbreFiscal');
      window.electron.ipcRenderer.on('Facture:Setting-reply', (event, data) => {
        const { Tva, fodec, timbreFiscal } = data.documentToSend;
        setSetting({ Tva, fodec, timbreFiscal });
      });
      window.electron.ipcRenderer.on('Facture:Setting:err', (event, data) => {
        setError('Error fetching data: ' + data.message);
      });
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (factureToPrint && setting.Tva !== 0) {
      handlePrint();
    }
  }, [factureToPrint, setting]);

  const getImageData = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  };

  const handlePrint = async () => {
    const doc = new jsPDF();
    let yPos = 10;
    const { articles, client, DateFacture, netAPayer, Nbc, dateBC, exonere, totalcalcul, Numero } = factureToPrint;
    const numIterations = Math.ceil(articles.length / 20);

    const imgData = await getImageData(img);

    for (let i = 0; i < numIterations; i++) {
      if (i !== 0) doc.addPage();
      const startIndex = i * 20;
      const portion = articles.slice(startIndex, startIndex + 20);
      
      yPos = addHeaderSection(doc, imgData, Numero, DateFacture);
      yPos = renderClientInfo(doc, client, yPos);
      yPos = renderDateAndNbc(doc, dateBC, Nbc, yPos);
      
      await generateArticlesTable(doc, portion, yPos);
      yPos = doc.previousAutoTable.finalY + 8;
      
      if (i === numIterations - 1) {
        if (exonere.value) {
          const remarkText = `Facture émise en suspension de TVA suivant Attestation d'exonoération N° ${exonere.rules.attestation_num} du ${new Date(exonere.rules.date_Attes).toLocaleDateString()} et Bon de Commande N° ${exonere.rules.BCN} du ${new Date(exonere.rules.date_BC).toLocaleDateString()}\nTVA DUE : ${(totalcalcul.netAPayer / 100 * setting.Tva).toFixed(3)}`;
          yPos = addRemarkSection(doc, remarkText, yPos, 170);
        }
        
        yPos = addInvoiceDataTable(doc, totalcalcul, yPos);
        yPos = addNetAPayerSection(doc, netAPayer, yPos, 'Arretée la présente facture a la somme de:');
      } else {
        yPos = addInvoiceDataTable(doc, {
          totalHT: "", remuneration: "", netHT: "", fode: "", tva: "", timbreFiscal: "", netAPayer: ""
        }, yPos);
        yPos = addNetAPayerSection(doc, '', yPos, '');
      }
      renderFooter(doc);
    }
    
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    if (iframeRef.current) {
      iframeRef.current.src = pdfUrl;
    }
  };

  const addHeaderSection = (doc, imgData, Numero, DateFacture) => {
    let yPos = 10;
    doc.setDrawColor(0, 0, 255);
    doc.setFillColor(255, 255, 255);
    doc.rect(10, 10, 190, 10, 'F');
    doc.rect(10, 5, 50, 22);
    doc.rect(60, 5, 80, 22);
    doc.rect(140, 5, 60, 22);
    doc.addImage(imgData, 'JPEG', 15, 7, 35, 19);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    const invoiceText = `Facture N°: ${Numero}`;
    const invoiceTextWidth = doc.getTextWidth(invoiceText);
    const centerXPos = (doc.internal.pageSize.width - invoiceTextWidth) / 2;
    doc.text(invoiceText, centerXPos - 10, 17);

    const additionalText = `Date du: ${new Date(DateFacture).toLocaleDateString()}`;
    const additionalTextWidth = doc.getTextWidth(additionalText);
    const additionalTextXPos = (doc.internal.pageSize.width - additionalTextWidth) / 2;
    doc.text(additionalText, additionalTextXPos - 10, 22);

    yPos += 20;
    return yPos;
  };
  
  // Refactored function for more space between lines
  // Refactored function for more space and optimized email wrapping
const renderClientInfo = (doc, client, yPos) => {
    const lineHeight = 6; 

    // Use custom function for client name and address
    const clientNameLines = wrapTextByCharLimit(`Client: ${client.clientName || ''}`, 30);
    const addressLines = wrapTextByCharLimit(`Adresse: ${client.address || ''}`, 30);
    
    // Use jsPDF's built-in function for the email
    const emailLines = doc.splitTextToSize(`Email: ${client.email || ''}`, 90);
    
    // Calculate a height that can accommodate all content
    const maxLines = Math.max(clientNameLines.length, addressLines.length, emailLines.length);
    const rectHeight = 25 + (maxLines - 1) * lineHeight;

    doc.rect(10, yPos, 95, rectHeight);
    doc.rect(105, yPos, 95, rectHeight);

    let currentYPos1 = yPos + 5.3;
    doc.text(`Identifiant Client: ${client.referance || ''}`, 13, currentYPos1);
    currentYPos1 += lineHeight;
    doc.text(clientNameLines, 13, currentYPos1);
    currentYPos1 += clientNameLines.length * lineHeight;
    doc.text(`MF: ${client.MF || ''}`, 13, currentYPos1);
    currentYPos1 += lineHeight;
    doc.text(`Téléphone: ${client.phoneNumber || ''}`, 13, currentYPos1);

    let currentYPos2 = yPos +  5.3;
    doc.text(addressLines, 107, currentYPos2);
    currentYPos2 += addressLines.length * lineHeight;
    doc.text(`Fax: ${client.fax || ''}`, 107, currentYPos2);
    currentYPos2 += lineHeight;
    doc.text(emailLines, 107, currentYPos2);

    return yPos + rectHeight + 5;
};

  const renderDateAndNbc = (doc, DateFacture, Nbc, yPos) => {
   if (DateFacture !== '1970-1-1' && DateFacture !== null) {
      const dateColumn = `Date: ${dateFormat(DateFacture)}`;
      const nbcColumn = `Nbc: ${Nbc}`;
      doc.setFontSize(12);
      doc.text(dateColumn, 110, yPos);
    }
      Nbc?  doc.text(`Nbc: ${Nbc}`, 13, yPos) :""


    return yPos + 5; //
  };

  const generateArticlesTable = (doc, articles, yPos) => {
    const filteredArticles = articles.filter(article => article.reference !== "");
    const rowsToShow = 19;
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
      }
      return ['', '', '', '', '', '', '', ''];
    });
    doc.autoTable({
      startY: yPos,
      head: [headers],
      body: data
    });
    return doc.previousAutoTable.finalY;
  };

  const addRemarkSection = (doc, remarkText, yPos, maxWidth) => {
    const remarkColumn = doc.splitTextToSize(remarkText, maxWidth);
    doc.setFontSize(12);
    doc.text(remarkColumn, 13, yPos);
    const remarkTextHeight = remarkColumn.length * 2;
    return yPos + remarkTextHeight + 7;
  };

  const addInvoiceDataTable = (doc, totalcalcul, yPos) => {
    const headersA = ["Total HT", 'Remise', 'Net HT', 'Fodec', "TVA", "Timbre Fiscal", 'Net a payer'];
    const dataA = [Object.values(totalcalcul)];
    doc.autoTable({
      startY: yPos,
      head: [headersA],
      body: dataA,
      styles: {
        body: { cellPadding: 5, valign: 'middle', halign: 'center' }
      }
    });
    return yPos;
  };

  const addNetAPayerSection = (doc, netAPayer, yPos, str) => {
    const rectX = 10;
    const rectY = yPos + 18;
    const rectWidthColumn1 = 140;
    const rectWidthColumn2 = 50;
    const rectHeight = 18;
    doc.rect(rectX, rectY, rectWidthColumn1, rectHeight);
    doc.rect(rectX + rectWidthColumn1, rectY, rectWidthColumn2, rectHeight);
    doc.setFontSize(10);
    doc.text(str, rectX + 2, rectY + 7);
    doc.text(`${netAPayer}`, rectX + 2, rectY + 13);
    return yPos + rectHeight + 5;
  };

  const renderFooter = (doc) => {
    const lines = [
      "Entreprise Hamdi zrelli pour le travail a façon - Matricule Fiscal : 1468285 F/A/C/ 000",
      "Route de Ceinture 4070 M'saken Tél : 55.542.499 E-mail : Hamdi.Zrelli@hotmail.fr",
      "Zitouna Banque Agence M'saken Ville -RIB : 250 018 000 0000121208 01 / RC : N° 0919332017"
    ];
    const calculateXCentered = (text) => (doc.internal.pageSize.width - doc.getTextDimensions(text).w) / 2;
    let yPos = doc.internal.pageSize.height - 25;
    doc.setFontSize(10);
    lines.forEach(line => {
      doc.text(line, calculateXCentered(line), yPos);
      yPos += doc.getTextDimensions(line).h + 2;
    });
  };

  if (!factureToPrint) {
    return (
      <div className="flex-1 flex items-center justify-center border border-slate-200 shadow-soft rounded-xl bg-gray-50">
        <p className="text-gray-500">Sélectionnez une facture pour afficher un aperçu.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 border border-slate-200 shadow-soft overflow-hidden rounded-xl">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          <p>Erreur: {error}</p>
        </div>
      )}
      <iframe
        title="PDF Preview"
        ref={iframeRef}
        className="w-full h-full"
      />
    </div>
  );
}

export default FacPrinter;