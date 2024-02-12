import React, { useEffect, useState } from 'react'
import './AppClientList.css'
function AppFournList() {
  const  [fournisseurs, setFournisseurs] = useState([])
  const [hoveredRow, setHoveredRow] = useState(null);
  const [searchTerms, setSearchTerms] = useState({
    referance: '',
    clientName: '',
    email: '',
    phoneNumber: '',
    address: '',
    MF: '',
  });
  const filterClients = () => {
    return fournisseurs.filter((client) => {
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
    console.log(`Clicked on Fourn: ${client}`);
    window.electron.ipcRenderer.send('Fourn:choosed', client)
  };
const fetchData =()=>{
  window.electron.ipcRenderer.send('FournList', '')
  window.electron.ipcRenderer.on('FournList-reply', (event, data) => {
    setFournisseurs(data);
  });
}
useEffect(()=>{
  fetchData()
},[])
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

export default AppFournList
