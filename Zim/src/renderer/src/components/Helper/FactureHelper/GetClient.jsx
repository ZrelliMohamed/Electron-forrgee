import React, { useEffect, useState } from 'react';

function GetClient({ setClt, clt }) {
  const hasClient = clt !== undefined;
  const [client, setClient] = useState({
    referance: '',
    name: '',
    matFisc: '',
    telephone: '',
    fax: '',
    address: '',
    email: '',
  });
  useEffect(() => {
    if (hasClient) {
      setClient({
        referance: clt.referance,
        name: clt.clientName,
        matFisc: clt.MF,
        telephone: clt.phoneNumber,
        fax: clt.fax,
        address: clt.address,
        email: clt.email,
        exonere: clt.exonere
      });
      setClt(clt)
    } else {
      setClient({
        referance: '',
        name: '',
        matFisc: '',
        telephone: '',
        fax: '',
        address: '',
        email: '',
      })
    }
  }, [hasClient,clt])
  const [errorMessage, setErrorMessage] = useState('');

  const getTheClient = async (referance) => {
    window.electron.ipcRenderer.removeAllListeners("Client:getOne:succes")
    window.electron.ipcRenderer.removeAllListeners("Client:getOne:ref?")
    window.electron.ipcRenderer.removeAllListeners("Client:getOne:err")
    window.electron.ipcRenderer.send('Client:getOne', referance)
    window.electron.ipcRenderer.on("Client:getOne:succes", (event, data) => {
      setClt(data)
      const { clientName, email, phoneNumber, address, MF, fax } = data;
      setClient({
        referance: referance,
        name: clientName,
        matFisc: MF,
        telephone: phoneNumber[0] || '',
        fax: fax || '',
        address: address || '',
        email: email || '',
      });
      setErrorMessage(''); // Clear any previous error message
    })
    window.electron.ipcRenderer.on("Client:getOne:ref?", (event, data) => {
      setErrorMessage('Client not found');
    })
    window.electron.ipcRenderer.on("Client:getOne:err", (event, data) => {
      setErrorMessage('Client not found');
      setClient({
        referance: '',
        name: '',
        matFisc: '',
        telephone: '',
        fax: '',
        address: '',
        email: '',
      })
      setClt({})
    })

  };

  const handleClientChange = (event) => {
    const { name, value } = event.target;
    setClient((prevClient) => ({ ...prevClient, [name]: value }));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      getTheClient(client.referance);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <table>
          <tbody>
            <tr>
              <td>
                <label htmlFor="referance">Referance Client:</label>
              </td>
              <td>
                <input
                  type="text"
                  name="referance"
                  value={client.referance}
                  onChange={handleClientChange}
                  onKeyPress={handleKeyPress}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="name">Nom du Client:</label>
              </td>
              <td>
                <input
                  type="text"
                  name="name"
                  value={client.name}
                  onChange={handleClientChange}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="matFisc">Mat Fisc:</label>
              </td>
              <td>
                <input
                  type="text"
                  name="matFisc"
                  value={client.matFisc}
                  onChange={handleClientChange}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ flex: 1 }}>
        <table>
          <tbody>
            <tr>
              <td>
                <label htmlFor="telephone">Telephone:</label>
              </td>
              <td>
                <input
                  type="text"
                  name="telephone"
                  value={client.telephone}
                  onChange={handleClientChange}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="fax">Fax:</label>
              </td>
              <td>
                <input
                  type="text"
                  name="fax"
                  value={client.fax}
                  onChange={handleClientChange}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="address">Adresse:</label>
              </td>
              <td>
                <input
                  type="text"
                  name="address"
                  value={client.address}
                  onChange={handleClientChange}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="email">E-mail:</label>
              </td>
              <td>
                <input
                  type="text"
                  name="email"
                  value={client.email}
                  onChange={handleClientChange}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
}

export default GetClient;
