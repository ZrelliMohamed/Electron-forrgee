
import axios from 'axios';
import { useEffect, useState } from 'react';
import Client from '../Helper/ClientHelper/Client';

function Clients() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [reTogle, setReTogle] = useState(true);

  const togle =()=> {
    setReTogle(!reTogle)
  }
  const getClient = async () => {
    try {
      let response = await axios.get('http://localhost:443/clients/get');
      setClients(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredClients = searchTerm.length === 0 ? clients : clients.filter((client) => {
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

  useEffect(() => {
    getClient();
  }, [reTogle]);

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
               <th>Exonere</th>
             </tr>
           </thead>
  <tbody>
          {filteredClients.map((client, i) => (
            <Client key={i} client={client} i={i}  togle={togle}/>
          ))}
        </tbody>
        </table>

      </div>
    </div>
  );
}

export default Clients;
