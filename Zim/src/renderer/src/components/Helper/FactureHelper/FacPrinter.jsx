import React, { useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import img from '../../../assets/Zim.jpg'
import { useLocation } from 'react-router-dom';
function FacPrinter() {
  const iframeRef = useRef(null);
  const location = useLocation();
  const {articles,client,invoiceData,netAPayerInFrench,Nbc,nextFactureNumber,date} = location.state;
  const handlePrint = async() => {
    const doc = new jsPDF();

    /*--------------------------------------------------Top---------------------------------------------------------------*/
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

    // Load image
    const imgData = await getImageData(img); // Function to convert image to base64

    // Add image
    doc.addImage(imgData, 'JPEG', 15, 7, 35, 19);

  // Add text for logo and invoice number in columns
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0); // Set text color to black

  const invoiceText = 'Facture N°:'+nextFactureNumber;
  const invoiceTextWidth = doc.getTextWidth(invoiceText); // Calculate text width

  const centerXPos = (doc.internal.pageSize.width - invoiceTextWidth) / 2; // Calculate center position
  doc.text(invoiceText, centerXPos-10, 17); // Centered text

  yPos += 22;
/*--------------------------------------------------Client-------------------------------------------------------------*/

const clientInfoColumn1 = `Référence: ${client.referance || ''}\nClient: ${client.clientName || ''}\nMF: ${client.MF || ''}\nTéléphone: ${client.phoneNumber || ''}`;
const clientInfoColumn2 = `Adresse: ${client.address || ''}\nFax: ${client.fax || ''}\nEmail: ${client.email || ''}`;

// Draw rectangles for client information columns
doc.rect(10, yPos, 95, 20); // Rectangle for column 1
doc.rect(105, yPos, 95, 20); // Rectangle for column 2

// Add text inside rectangles for client information
doc.setFontSize(12);
doc.text(clientInfoColumn1, 13, yPos + 4); // First column
doc.text(clientInfoColumn2, 107, yPos + 6); // Second column

yPos += 25;
/*--------------------------------------------------Date-------------------------------------------------------------*/
// Date and Nbc row
const dateParts = date.split('-');
const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

const dateColumn = `Date: ${formattedDate}`; // Assuming date is in the format '2023-12-27'
const nbcColumn = `Nbc: ${Nbc}`;

// Add text for date and Nbc
doc.setFontSize(12);
doc.text(dateColumn, 13, yPos); // Date column
doc.text(nbcColumn, 110, yPos); // Nbc column

yPos += 5; // Move
/*----------------------------------------------------articles-------------------------------------------------------------*/

// Filter articles that don't meet your criteria (e.g., empty or default values)
const filteredArticles = articles.filter(article => (
  article.reference !== ""
));

// Determine the number of articles to display (up to 15)
const rowsToShow = 21; // Define the number of rows to display
const numberOfArticles = Math.min(filteredArticles.length, rowsToShow);

// Create the table headers
const headers = ['Reference', 'Designation', 'Unité', 'Qté', 'PU HT', 'Prix HT', 'Remise %'];

// Prepare data for the table (fill with empty arrays for missing rows)
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

// Add the table to the PDF
doc.autoTable({
  startY: yPos,
  head: [headers],
  body: data
});
  /*--------------------------------------------------------invoiceData---------------------------------------------------------*/
  // Create the table headers for the second table
  const headersA =["Total HT",'Remise','Net HT','Fodec',"TVA","Timbre Fiscal",'Net a payer']; // Extract keys as headers
  const dataA = [Object.values(invoiceData)]; // Extract values as a single row

 // Get the height of the first table
const firstTableHeight = doc.previousAutoTable.finalY || 10; // Use a default startY value if it's the first table
yPos=firstTableHeight + 10
// Position the second table right after the first one
doc.autoTable({
  startY: yPos, // Add a padding to ensure some space between tables
  head: [headersA],
  body: dataA,
  styles: {
    body: {
      cellPadding: 5, // Add padding to body cells
      valign: 'middle', // Vertically center the content
      halign: 'center' // Horizontally center the content
    }
  }
});
  /*--------------------------------------------------------netAPayerInFrench---------------------------------------------------------*/
  const rectX = 10;
  const rectY = yPos + 20; // Use the current yPos as the starting Y position for the rectangles
  const rectWidthColumn1 = 140;
  const rectWidthColumn2 = 50; // Width for the second column
  const rectHeight = 18; // Adjust the height to fit two lines of text

  // Draw rectangles for the two columns
  doc.rect(rectX, rectY, rectWidthColumn1, rectHeight); // Rectangle for column 1
  doc.rect(rectX + rectWidthColumn1, rectY, rectWidthColumn2, rectHeight); // Rectangle for column 2

  // Add text inside rectangles for netAPayerInFrench information
  doc.setFontSize(10);
  const firstLineText = 'Arretée la présente facture a la somme de:';
  doc.text(firstLineText, rectX+2, rectY+7); // First line of text

  // Assuming netAPayerInFrench is a variable holding the value for the second line
  const secondLineText = `${netAPayerInFrench}`; // Replace netAPayerInFrench with the variable holding the value
  doc.text(secondLineText, rectX + 2, rectY + 13); // Second line of text

  yPos += rectHeight;


  /*----------------------------------------------------buttom of the page-------------------------------------------------------------*/
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

  /*-----------------------------------------------------------------------------------------------------------------*/
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

  useEffect(()=>{
    handlePrint()
  },[])

  return (
    <>
      <div style={{marginTop:'20px'}}>
        <iframe title="PDF Preview" ref={iframeRef} style={{ width: '100%', height: '1080px', border: '1px solid black' }} />
      </div>
    </>
  );
}

export default FacPrinter;
