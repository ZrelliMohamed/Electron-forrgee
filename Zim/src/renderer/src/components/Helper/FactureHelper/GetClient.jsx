import axios from 'axios';
import React, { useState } from 'react';

function GetClient({setClt}) {
  const [client, setClient] = useState({
    reference: '',
    name: '',
    matFisc: '',
    telephone: '',
    fax: '',
    address: '',
    email: '',
  });
  const [errorMessage, setErrorMessage] = useState('');

  const getTheClient = async (reference) => {
    try {
      const { data } = await axios.get(`http://localhost:443/clients/getOne/${reference}`);
      if (data) {
        setClt(data)
        const { clientName, email, phoneNumber, address, MF, fax } = data;
        setClient({
          reference: reference,
          name: clientName,
          matFisc: MF,
          telephone: phoneNumber[0] || '',
          fax: fax || '',
          address: address || '',
          email: email || '',
        });
        setErrorMessage(''); // Clear any previous error message
      } else {
        setErrorMessage('Client not found');
      }
    } catch (error) {
      console.log('this',error.response.data );
      setErrorMessage(error.response.data.message);
    }
  };

  const handleClientChange = (event) => {
    const { name, value } = event.target;
    setClient((prevClient) => ({ ...prevClient, [name]: value }));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      getTheClient(client.reference);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <table>
          <tbody>
            <tr>
              <td>
                <label htmlFor="reference">Reference Client:</label>
              </td>
              <td>
                <input
                  type="text"
                  name="reference"
                  value={client.reference}
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
