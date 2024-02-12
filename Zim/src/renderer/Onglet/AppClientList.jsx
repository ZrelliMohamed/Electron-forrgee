import React, { useEffect, useState } from 'react'
import './AppClientList.css'
function AppClientList() {

  const [clients, setClients] = useState([])
  const [hoveredRow, setHoveredRow] = useState(null);
  const [searchTerms, setSearchTerms] = useState({
    referance: '',
    clientName: '',
    email: '',
    phoneNumber: '',
    address: '',
    MF: '',
  });
  useEffect( () => {
    window.electron.ipcRenderer.send('ClientList', '')
    window.electron.ipcRenderer.on("ClientList-reply", (event, data) => {
      setClients(data);
    })

  }, [])

  const filterClients = () => {
    return clients.filter((client) => {
      return Object.entries(searchTerms).every(([key, value]) => {
        return client[key].toString().toLowerCase().includes(value.toLowerCase());
      });
    });
  };
  const handleInputChange = (column, value) => {
    setSearchTerms((prevSearchTerms) => ({
      ...prevSearchTerms,
      [column]: value,
    }));
  };

  const handleRowClick = (client) => {
    // Handle click action for the specific client ID
    console.log(`Clicked on client: ${client}`);
    window.electron.ipcRenderer.send('Client:choosed', client)
    window.electron.ipcRenderer.send('CloseClientList', '')
  };
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{border: '1px solid black' }}>
        <thead>
          <tr>
            <th>
              <input
                type="text"
                placeholder="Reference"
                value={searchTerms.referance}
                onChange={(e) => handleInputChange('referance', e.target.value)}
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Client Name"
                value={searchTerms.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Email"
                value={searchTerms.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Phone Numbers"
                value={searchTerms.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Address"
                value={searchTerms.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="MF"
                value={searchTerms.MF}
                onChange={(e) => handleInputChange('MF', e.target.value)}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {filterClients().map((client) => (
              <tr
              key={client._id}
              onClick={() => handleRowClick(client)}
              onMouseEnter={() => setHoveredRow(client._id)}
              onMouseLeave={() => setHoveredRow(null)}
              className={hoveredRow === client._id ? 'hovered-row' : ''}
              style={{ cursor: 'pointer' }}
            >
              <td>{client.referance}</td>
              <td>{client.clientName}</td>
              <td>{client.email}</td>
              <td>{client.phoneNumber.join(', ')}</td>
              <td>{client.address}</td>
              <td>{client.MF}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


export default AppClientList
