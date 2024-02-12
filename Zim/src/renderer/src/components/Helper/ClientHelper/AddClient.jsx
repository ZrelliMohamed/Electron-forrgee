import { useState } from 'react';
import './checkbox.css'
const AddClient = () => {
  const [newClient, setNewClient] = useState({
    clientName: '',
    email: '',
    phoneNumber: [''],
    address: '',
    MF: '',
    fax: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient((prevClient) => ({
      ...prevClient,
      [name]: value,
    }));
  };

  const handleAddPhone = () => {
    setNewClient((prevClient) => ({
      ...prevClient,
      phoneNumber: [...prevClient.phoneNumber, ''],
    }));
  };

  const handlePhoneInputChange = (e, index) => {
    const { value } = e.target;
    setNewClient((prevClient) => {
      const updatedPhoneNumbers = [...prevClient.phoneNumber];
      updatedPhoneNumbers[index] = value;
      return { ...prevClient, phoneNumber: updatedPhoneNumbers };
    });
  };

  const handleDeletePhone = (index) => {
    if (newClient.phoneNumber.length === 1) {
      // If there's only one phone number, don't allow deletion
      return;
    }
    setNewClient((prevClient) => {
      const updatedPhoneNumbers = [...prevClient.phoneNumber];
      updatedPhoneNumbers.splice(index, 1);
      return { ...prevClient, phoneNumber: updatedPhoneNumbers };
    });
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    window.electron.ipcRenderer.send('Client:add', newClient)
    window.electron.ipcRenderer.on('Client:succes', (event, data) => {
      setSuccessMessage('Client successfully added.'); // Set success message
      setNewClient({ // Reset form inputs
        clientName: '',
        email: '',
        phoneNumber: [''],
        address: '',
        MF: '',
        fax: '',
      });
    })
    // Add your logic for handling client addition here
    window.electron.ipcRenderer.on('Client:failer', (event, data) => {
      console.log(data);
    })

  };

  return (
    <div>
      <form onSubmit={handleAddClient}>
        <h1>New Client</h1>
        {successMessage && <p>{successMessage}</p>} {/* Display success message */}
        <table>
          <tbody>
            <tr>
              <td><label htmlFor="clientName">Client Name:</label></td>
              <td><input type="text" id="clientName" name="clientName" value={newClient.clientName} onChange={handleInputChange} required /></td>
            </tr>
            <tr>
              <td><label htmlFor="email">Email:</label></td>
              <td><input type="text" id="email" name="email" value={newClient.email} onChange={handleInputChange} /></td>
            </tr>
            {newClient.phoneNumber.map((phone, index) => (
              <tr key={index}>
                <td><label htmlFor={`phoneNumber-${index}`}>Phone Number {index + 1}:</label></td>
                <td>
                  <input
                    type="number"
                    id={`phoneNumber-${index}`}
                    value={phone}
                    onChange={(e) => handlePhoneInputChange(e, index)}
                    required={index === 0} // Marking the first phone number as required
                  />
                  {newClient.phoneNumber.length > 1 && (
                    <button type="button" onClick={() => handleDeletePhone(index)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="2">
                <center>
                  <button type="button" onClick={handleAddPhone}>Add Phone Number</button>
                </center>
              </td>
            </tr>
            <tr>
              <td><label htmlFor="address">Address:</label></td>
              <td><input type="text" id="address" name="address" value={newClient.address} onChange={handleInputChange} required /></td>
            </tr>
            <tr>
              <td><label htmlFor="MF">MF:</label></td>
              <td><input type="text" id="MF" name="MF" value={newClient.MF} onChange={handleInputChange} required /></td>
            </tr>
            <tr>
              <td><label htmlFor="fax">Fax:</label></td>
              <td><input type="text" id="fax" name="fax" value={newClient.fax} onChange={handleInputChange} /></td>
            </tr>
            <tr>
              <td colSpan="2">
                <center>
                  {/* <button type="submit" >Add Client</button> */}
                  <button className="buttonPlus" type="submit">
                    + Client
                  </button>
                </center>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
}

export default AddClient;
