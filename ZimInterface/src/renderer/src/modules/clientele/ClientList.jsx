import   OneClient  from "./helper/OneClient" ;

import { useEffect, useState } from 'react';

export default function ClientList() {
      const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [reTogle, setReTogle] = useState(true);
  const togle =()=> {
    setReTogle(!reTogle)
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  const filteredClients = searchTerm.length === 0 ? clients : clients.filter((OneClient) => {
    // Filter logic - checking for properties and searching if searchTerm is not empty
    const nameMatch = OneClient.clientName && OneClient.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = OneClient.phoneNumber && OneClient.phoneNumber.toString().includes(searchTerm.toString());
    const MFMatch = OneClient.MF && OneClient.MF.toString().includes(searchTerm.toString());
    const addressMatch = OneClient.address && OneClient.address.toString().includes(searchTerm.toString());
    const emailMatch = OneClient.email && OneClient.email.toString().includes(searchTerm.toString());
    const faxMatch = OneClient.fax && OneClient.fax.toString().includes(searchTerm.toString());
    const referanceMatch = OneClient.referance && String(OneClient.referance).includes(searchTerm);

    return  referanceMatch || nameMatch || phoneMatch || addressMatch ||  MFMatch || emailMatch || faxMatch ;
  });

  useEffect(() => {
    window.electron.ipcRenderer.send('Client', 'getAll')
    window.electron.ipcRenderer.on('Client-reply', (event, data) => {
    setClients(data)
    })
    window.electron.ipcRenderer.on('Client-reply:err', (event, data) => {
      console.log(data);
    })
  }, [reTogle]);

return (
  <div className="p-6">
      {/* 🔍 Search bar */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-brand-700">
          Liste des Clients
        </h1>
        <input
          type="text"
          placeholder="🔍 Rechercher un client..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full md:w-1/3 rounded-lg border border-gray-300 p-2 shadow-sm 
                     focus:ring-2 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* 📋 Table */}
      <div className="overflow-x-auto rounded-2xl shadow-soft border border-gray-200 bg-white">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-brand-50 text-brand-900 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-center">ID</th>
              <th className="px-4 py-3 text-center">Nom</th>
              <th className="px-4 py-3 text-center">Email</th>
              <th className="px-4 py-3 text-center">Téléphone</th>
              <th className="px-4 py-3 text-center">Adresse</th>
              <th className="px-4 py-3 text-center">Mat Fisc</th>
              <th className="px-4 py-3 text-center">Fax</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredClients.map((client, i) => (
              <OneClient key={i} client={client} i={i} togle={togle} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
);
}