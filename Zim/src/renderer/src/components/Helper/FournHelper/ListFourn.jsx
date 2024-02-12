import React,{ useEffect, useState } from 'react'
import Fournisseur from './Fournisseur';

function ListFourn() {
  const [fourns, setFourns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [reTogle, setReTogle] = useState(true);
  const togle =()=> {
    setReTogle(!reTogle)
  }
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    window.electron.ipcRenderer.send('Fourn:getAll', '')
    window.electron.ipcRenderer.on('Fourn-reply', (event, data) => {
      setFourns(data)
    })
    window.electron.ipcRenderer.on('Fourn-reply:err', (event, data) => {
      console.log(data);
    })
  }, [reTogle]);
  const filteredfourns = searchTerm.length === 0 ? fourns : fourns.filter((client) => {
    // Filter logic - checking for properties and searching if searchTerm is not empty
    const nameMatch = client.clientName && client.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = client.phoneNumber && client.phoneNumber.toString().includes(searchTerm.toString());
    const MFMatch = client.MF && client.MF.toString().includes(searchTerm.toString());
    const addressMatch = client.address && client.address.toString().includes(searchTerm.toString());
    const emailMatch = client.email && client.email.toString().includes(searchTerm.toString());
    const faxMatch = client.fax && client.fax.toString().includes(searchTerm.toString());
    const referanceMatch = client.referance && String(client.referance).includes(searchTerm);

    return  referanceMatch || nameMatch || phoneMatch || addressMatch ||  MFMatch || emailMatch || faxMatch ;
  });
  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Search by Name, Phone Number..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <div>
        <table width='100%'>
        <thead>
             <tr>
               <th>ID</th>
               <th>Name</th>
               <th>Email</th>
               <th>Phone Number</th>
               <th>Adresse</th>
               <th>Mat Fisc</th>
               <th>Fax</th>
             </tr>
           </thead>
  <tbody>
          {filteredfourns.map((fourn, i) => (
            <Fournisseur key={i} fourn={fourn} i={i}  togle={togle}/>
          ))}
        </tbody>
        </table>

      </div>
    </div>
  );
}

export default ListFourn
