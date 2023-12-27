import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
function FacPrinter({ articles, client, date, invoiceData, netAPayerInFrench }) {
  const iframeRef = useRef(null);

  const handlePrint = () => {
    const doc = new jsPDF();

    // Set up initial y position for the table
    let yPos = 10;

    // Create the PDF content
    doc.text('Invoice Details', 10, yPos);
    yPos += 10;

    // Filter articles that don't meet your criteria (e.g., empty or default values)
    const filteredArticles = articles.filter(article => (
      article.reference !== ""
    ));

    // Create the table headers
    const headers = ['Reference', 'Designation', 'Unit', 'Quantity', 'Price per Unit', 'Total Price', 'Remuneration'];
    const data = filteredArticles.map(article => [
      article.reference,
      article.designation,
      article.unit,
      article.quantity,
      article.pricePerUnit,
      article.totalPrice,
      article.remuneration
    ]);

    // Add the table to the PDF
    doc.autoTable({
      startY: yPos,
      head: [headers],
      body: data
    });

    // Save the PDF content to Blob
    const pdfBlob = doc.output('blob');

    // Create a URL for the Blob
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Show the preview in the iframe
    iframeRef.current.src = pdfUrl;
  };


  return (
    <>
      <input type="button" value="Imprimer" onClick={handlePrint} />
      <div>
        <iframe title="PDF Preview" ref={iframeRef} style={{ width: '100%', height: '1080px', border: '1px solid black' }} />
      </div>
    </>
  );
}

export default FacPrinter;
