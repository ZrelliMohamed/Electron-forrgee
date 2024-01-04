import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomConfirmDialog from '../ClientHelper/CustomConfirmDialog';

function ListFac() {
  const Navigate = useNavigate();
  const [factures, setFactures] = useState([]);
  const [togle, setTogle] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDeleteButtonVisible, setIsDeleteButtonVisible] = useState(true);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState('Numero');
  const [showConfirmDialogForFacture, setShowConfirmDialogForFacture] = useState(null);

  const getAll = async () => {
        window.electron.ipcRenderer.send('Facture:GetAll', 'information')
        window.electron.ipcRenderer.on('Facture:GetAll:succes', (event, data) => {
          setFactures(data.factures);
        })
        window.electron.ipcRenderer.on('Facture:GetAll:err', (event, data) => {
          console.log(data);
        })
  };

  useEffect(() => {
    getAll();
  }, [togle]);

  const handelPrinter = async (facture) => {
    Navigate(`/Facture/PrintFac`, {
      state: {
        articles: facture.articles,
        client: facture.client,
        date: facture.DateFacture,
        invoiceData: facture.totalcalcul,
        netAPayerInFrench: facture.netAPayer,
        Nbc: facture.Nbc,
        nextFactureNumber: facture.Numero,
      },
    });
  };

  const handleDelete = (facture) => {
    setSelectedFacture(facture);
    setShowConfirmDialogForFacture(facture);
    setIsDeleteButtonVisible(true);
  };

  const handleCancel = () => {
    setShowConfirmDialogForFacture(null);
    setSelectedFacture(null);
    setIsDeleteButtonVisible(true);
  };

  const handleConfirmation = async () => {
    if (selectedFacture) {
      window.electron.ipcRenderer.send('Facture:Delete', selectedFacture._id)
      window.electron.ipcRenderer.on('Facture:Delete:succes', (event, data) => {
        setTogle(!togle);
        setShowConfirmDialog(false);
        setSelectedFacture(null);
      })
      window.electron.ipcRenderer.on('Facture:Delete:err', (event, data) => {
        console.log(data);
      })
    }
  };



  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterCriteriaChange = (e) => {
    setFilterCriteria(e.target.value);
  };

  const filteredFactures = factures.filter((facture) => {
    const fieldValue = (() => {
      if (filterCriteria === 'client.clientName') {
        return facture.client ? facture.client.clientName : ''; // Handle missing client
      } else if (filterCriteria === 'totalcalcul.netAPayer') {
        return facture.totalcalcul ? facture.totalcalcul.netAPayer.toString() : ''; // Convert to string
      } else {
        return facture[filterCriteria];
      }
    })();

    if (typeof fieldValue === 'string') {
      return fieldValue.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return false;
  });

  return (
    <div>
      <div style={{ marginBottom: '20px', marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
        <select value={filterCriteria} onChange={handleFilterCriteriaChange}>
          <option value="Numero">Numéro de la facture</option>
          <option value="DateFacture">Date de la facture</option>
          <option value="totalcalcul.netAPayer">Montant total a payer</option>
          <option value="client.clientName">Client</option>
        </select>
      </div>
      <table width="100%" border={1}>
        <thead>
          <tr>
            <th>Numéro de la facture</th>
            <th>Date de la facture</th>
            <th>Montant total a payer</th>
            <th>Client</th>
            <th>Imprimer</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredFactures.length > 0 &&
            filteredFactures.map((facture, i) => (
              <tr key={i} style={{ textAlign: 'center' }}>
                <td>{facture.Numero}</td>
                <td>{new Date(facture.DateFacture).toLocaleString('fr-FR').slice(0, 10)}</td>
                <td>{facture.totalcalcul.netAPayer} DT</td>
                <td>{facture.client.clientName}</td>
                <td>
                  <input type="button" value="I" onClick={() => handelPrinter(facture)} />
                </td>
                <td>
                  {isDeleteButtonVisible && (
                    <input type="button" value="X" onClick={() => handleDelete(facture)} />
                  )}
                  {showConfirmDialogForFacture === facture && (
                    <CustomConfirmDialog
                      message="Are you sure you want to delete?"
                      onConfirm={handleConfirmation}
                      onCancel={handleCancel}
                    />
                  )}
                </td>
                <td><input type="button" value="Update" onClick={()=>{
                     Navigate(`/Facture/Fac`, {
                      state: {facture},
                    });
                }} /></td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

export default ListFac;
