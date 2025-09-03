import React, { useEffect, useState } from 'react'
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
    <div className="overflow-x-auto rounded-2xl shadow-soft">
  <table className="w-full border border-gray-200 text-sm text-gray-700">
    <thead className="bg-brand-50">
      <tr>
        <th className="p-2">
          <input
            type="text"
            placeholder="Référence"
            value={searchTerms.referance}
            onChange={(e) => handleInputChange('referance', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </th>
        <th className="p-2">
          <input
            type="text"
            placeholder="Client Name"
            value={searchTerms.clientName}
            onChange={(e) => handleInputChange('clientName', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </th>
        <th className="p-2">
          <input
            type="text"
            placeholder="Email"
            value={searchTerms.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </th>
        <th className="p-2">
          <input
            type="text"
            placeholder="Phone Numbers"
            value={searchTerms.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </th>
        <th className="p-2">
          <input
            type="text"
            placeholder="Address"
            value={searchTerms.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </th>
        <th className="p-2">
          <input
            type="text"
            placeholder="MF"
            value={searchTerms.MF}
            onChange={(e) => handleInputChange('MF', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {filterClients().map((client) => (
        <tr
          key={client._id}
          onClick={() => handleRowClick(client)}
          onMouseEnter={() => setHoveredRow(client._id)}
          onMouseLeave={() => setHoveredRow(null)}
          className={`cursor-pointer transition ${
            hoveredRow === client._id ? 'bg-brand-100' : 'hover:bg-gray-50'
          }`}
        >
          <td className="px-4 py-2 text-center">{client.referance}</td>
          <td className="px-4 py-2 text-center">{client.clientName}</td>
          <td className="px-4 py-2 text-center">{client.email}</td>
          <td className="px-4 py-2 text-center">{client.phoneNumber.join(', ')}</td>
          <td className="px-4 py-2 text-center">{client.address}</td>
          <td className="px-4 py-2 text-center">{client.MF}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

  );
}


export default AppClientList
