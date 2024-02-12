import React, { useEffect, useState } from 'react';

function FactureAchat() {
  /************************************************ */
  const [loading, setLoading] = useState(true);
  const [setting, setSetting] = useState({
    Tva: 0,
    fodec: 0,
    timbreFiscal: 0,
  });

  useEffect(() => {
    console.log(setting);
  },
  [setting
  ]);
  const fetchData = () => {
    window.electron.ipcRenderer.removeAllListeners('Facture:Setting-reply');
    window.electron.ipcRenderer.removeAllListeners('Facture:Setting:err');
    window.electron.ipcRenderer.send('Facture:Setting', 'Tva/fodec/timbreFiscal');

    window.electron.ipcRenderer.on('Facture:Setting-reply', (event, data) => {
      const { Tva, fodec, timbreFiscal } = data.documentToSend;
      setSetting({ Tva, fodec, timbreFiscal });
      setLoading(false); // Set loading to false once data is fetched
    });

    window.electron.ipcRenderer.on('Facture:Setting:err', (event, data) => {
      console.log('Error fetching data: ' + data.message);
      setLoading(false); // Set loading to false in case of an error
    });
  };
  useEffect(() => {
    fetchData()
  }, [])

  /*********************css***************************/
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
  };
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
  };
  const cellStyle = {
    border: '1px solid #dddddd',
    padding: '8px',
    textAlign: 'left',
  };
  const fournisseurCellStyle = {
    ...cellStyle,
    marginLeft: '200px', // Adjust the margin as needed
  };
  /******************************************************/
  const [refFourn, setRefFourn] = useState(0);
  const [msgErr, setMsgErr] = useState('');
  const [fournisseur, setfournisseur] = useState({
    clientName: '',
    email: '',
    phoneNumber: [],
    address: '',
    MF: '',
    fax: '',
    referance: ''
  });
  /***************************this is a listener for the choosen one from the list of fournisseur in the open Onglet******************************** */
  window.electron.ipcRenderer.on("ChoosedFourn", (event, data) => {
    console.log(data);
    setfournisseur(data);
  })
  /************************************************************** */
  const getTheClient = (refFourn) => {
    console.log(refFourn);
    window.electron.ipcRenderer.send('Fournisseur:getOne', refFourn)
    window.electron.ipcRenderer.on('Fournisseur:getOne:succes', (event, data) => {
      setfournisseur(data);
      setMsgErr('')
    });
    window.electron.ipcRenderer.on('Fournisseur:getOne:ref?', (event, data) => {
      setMsgErr('fournisseur Not Found !')
      setfournisseur({
        clientName: '',
        email: '',
        phoneNumber: [],
        address: '',
        MF: '',
        fax: '',
        referance: 0
      })
      console.log('err');
    });
  }
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      getTheClient(refFourn);
    }
  };
  /****************************************************************************************************** */
  const [factureAchat, setFactureAchat] = useState({
    factureN: '',
    date: '',
    montantHt: 0,
    montantTTC: 0
  })


  const [tvaList, setTvaList] = useState([{ percentage: 0, amount: 0 }]);
  useEffect(() => {
    calculTotalTva();
  }, [tvaList])
  const [totalTva, setTotalTva] = useState(0);

  const calculTotalTva = () => {
    const totalTvaAmount = tvaList.reduce((acc, tva) => acc + parseFloat(tva.amount), 0);
    setTotalTva(totalTvaAmount);
  };


  const addTva = () => {
    setTvaList([...tvaList, { percentage: 0, amount: 0 }]);
  };

  const deleteTva = (index) => {
    if (tvaList.length > 1) {
      const updatedTvaList = [...tvaList];
      updatedTvaList.splice(index, 1);
      setTvaList(updatedTvaList);
    }
  };

  const handleTvaChange = (index, field, value) => {
    const updatedTvaList = [...tvaList];
    updatedTvaList[index][field] = value;
    setTvaList(updatedTvaList);
  };

  useEffect(() => {
    console.log(factureAchat);
    setFactureAchat(prevFactureAchat => {
      const montantTTC = Number(totalTva) + Number(prevFactureAchat.montantHt) + Number(setting.fodec) + Number(setting.timbreFiscal);
      const roundedMontantTTC = Number(montantTTC.toFixed(1));
      return {
        ...prevFactureAchat,
        montantTTC: roundedMontantTTC
      };
    });
  }, [factureAchat.montantHt, totalTva, setting]);


  return (
    <div>
      <div style={containerStyle}>
        <center><h1 style={{ marginTop: 50 }}>Facture Achat</h1></center>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th colSpan="4" style={{ textAlign: "center" }}>{msgErr}</th>
            </tr>
            <tr>
              <th colSpan="4" style={cellStyle}>Fournisseur <input type="button" value="📜"
                onClick={() => {
                  window.electron.ipcRenderer.send('CreateFournList', '')
                }}
              /></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th style={cellStyle}>Ref Fournisseur</th>
              <td style={cellStyle}>
                <input type="text"
                  onChange={(e) => setRefFourn(e.target.value)}
                  onKeyPress={handleKeyPress}
                  defaultValue={fournisseur.referance} />
              </td>
              <th style={fournisseurCellStyle}>Email</th>
              <td style={cellStyle}>
                <input type="text"
                  defaultValue={fournisseur.email} />
              </td>
            </tr>
            <tr>
              <th style={fournisseurCellStyle}>Adresse</th>
              <td style={cellStyle}>
                <input type="text"
                  defaultValue={fournisseur.address} />
              </td>
              <th style={fournisseurCellStyle}>Mat Fisc</th>
              <td style={cellStyle}>
                <input type="text"
                  defaultValue={fournisseur.MF} />
              </td>
            </tr>
            <tr>
              <th style={fournisseurCellStyle}>fax</th>
              <td style={cellStyle}>
                <input type="text"
                  defaultValue={fournisseur.fax} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <br />
      {/* *******************************************Fachture Achat Information ****************************************************** */}
      <br />
      <div style={{ width: '100%' }}>
        <form action="">

          <table style={tableStyle}>
            <tbody>
              <tr>
                <th style={fournisseurCellStyle}><label htmlFor="NumFactrAchat">Facture N°:</label></th>
                <td style={cellStyle}><input type="text"
                  onChange={(e) => {
                    setFactureAchat({ ...factureAchat, factureN: e.target.value })
                  }
                  }
                />
                </td>
                <th style={fournisseurCellStyle}><label htmlFor="NumFactrAchat">Date:</label></th>
                <td style={cellStyle}><input type="date"
                  onChange={(e) => {
                    setFactureAchat({ ...factureAchat, date: e.target.value })
                  }
                  }
                /></td>
              </tr>
              <tr>
                <th style={fournisseurCellStyle}><label htmlFor="NumFactrAchat">Montant HT:</label></th>
                <td style={cellStyle}><input type="number"
                  onChange={(e) => {
                    setFactureAchat({ ...factureAchat, montantHt: e.target.value })
                  }
                  }
                /></td>
                <th style={fournisseurCellStyle}><label htmlFor="NumFactrAchat">FODEC:</label></th>
                <td style={cellStyle}><input type="text" defaultValue={loading ? '' : setting.fodec}/></td>
              </tr>
              <tr>
                <th style={fournisseurCellStyle}><label htmlFor="NumFactrAchat">Timbre Fiscal:</label></th>
                <td style={cellStyle}><input type="text" defaultValue={loading ? '' : setting.timbreFiscal} /></td>
              </tr>
              <tr>
                <th colSpan="4" style={fournisseurCellStyle}><label htmlFor="NumFactrAchat">TVA Details:</label>
                  &nbsp;&nbsp;&nbsp;&nbsp;<input type="button" value="➕" onClick={addTva} />
                </th>
              </tr>
              {tvaList.map((tva, index) => (
                <tr key={index}>
                  <th style={fournisseurCellStyle}>
                    <label htmlFor={`percentage_${index}`}>TVA Percentage:</label>
                  </th>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      id={`percentage_${index}`}
                      value={tva.percentage}
                      onChange={(e) => handleTvaChange(index, 'percentage', e.target.value)}
                    />
                  </td>
                  <th style={fournisseurCellStyle}>
                    <label htmlFor={`amount_${index}`}>Montant TVA:</label>
                  </th>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      id={`amount_${index}`}
                      value={tva.amount}
                      onChange={(e) => handleTvaChange(index, 'amount', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="button"
                      value="Delete TVA"
                      onClick={() => deleteTva(index)}
                    />
                  </td>
                </tr>
              ))}
              <tr>
                <th style={fournisseurCellStyle}><label htmlFor="totalTva">Total TVA:</label></th>
                <td colSpan="3" style={cellStyle}><input type="number" id="totalTva" value={totalTva} onChange={(e) => setTotalTva(e.target.value)} /></td>
              </tr>
              <tr>
                <th style={fournisseurCellStyle}><label htmlFor="NumFactrAchat">Total Montant TTC:</label></th>
                <td style={cellStyle}><input type="text"  value={factureAchat.montantTTC}
                /></td>
              </tr>
            </tbody>
          </table>
        </form>

      </div>
    </div>

  );
}

export default FactureAchat;
