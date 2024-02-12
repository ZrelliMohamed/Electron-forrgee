import React, { useEffect, useState } from 'react'

function AddFourn() {
  const [successMessage, setSuccessMessage] = useState('');
  const [newFourn, setNewFourn] = useState({
    clientName: '',
    email: '',
    phoneNumber: [''],
    address: '',
    MF: '',
    fax: '',
    exonere: false, // Default value for exonere field
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFourn((prevFourn) => ({
      ...prevFourn,
      [name]: value,
    }));
  };

  const handleAddPhone = () => {
    setNewFourn((prevFourn) => ({
      ...prevFourn,
      phoneNumber: [...prevFourn.phoneNumber, ''],
    }));
  };


  const handleDeletePhone = (index) => {
    if (newFourn.phoneNumber.length === 1) {
      // If there's only one phone number, don't allow deletion
      return;
    }
    setNewFourn((prevFourn) => {
      const updatedPhoneNumbers = [...prevFourn.phoneNumber];
      updatedPhoneNumbers.splice(index, 1);
      return { ...prevFourn, phoneNumber: updatedPhoneNumbers };
    });
  };

  const handlePhoneInputChange = (e, index) => {
    const { value } = e.target;
    setNewFourn((prevFourn) => {
      const updatedPhoneNumbers = [...prevFourn.phoneNumber];
      updatedPhoneNumbers[index] = value;
      return { ...prevFourn, phoneNumber: updatedPhoneNumbers };
    });
  };

  const handleAddFourn = async (e) => {
    e.preventDefault();
    window.electron.ipcRenderer.send('Fourn:add', newFourn)
    window.electron.ipcRenderer.on('Fourn:succes', (event, data) => {
    setSuccessMessage('Fourn successfully added.'); // Set success message
    setNewFourn({ // Reset form inputs
      clientName: '',
      email: '',
      phoneNumber: [''],
      address: '',
      MF: '',
      fax: '',
      exonere: false, // Reset exonere to default value
    });
      })
    // Add your logic for handling Fourn addition here
    window.electron.ipcRenderer.on('Fourn:failer', (event, data) => {
      console.log(data);
    })
    console.log(newFourn);

};



  return (
    <div>
      <form onSubmit={handleAddFourn}>
        <h1>New Fournisseur</h1>
        {successMessage && <p>{successMessage}</p>} {/* Display success message */}
        <table>
          <tbody>
            <tr>
              <td><label htmlFor="clientName">Fournisseur :</label></td>
              <td><input type="text" id="clientName" name="clientName" value={newFourn.clientName} onChange={handleInputChange} required /></td>
            </tr>
            <tr>
              <td><label htmlFor="email">Email:</label></td>
              <td><input type="text" id="email" name="email" value={newFourn.email} onChange={handleInputChange} /></td>
            </tr>
            {newFourn.phoneNumber.map((phone, index) => (
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
                  {newFourn.phoneNumber.length > 1 && (
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
              <td><input type="text" id="address" name="address" value={newFourn.address} onChange={handleInputChange} required /></td>
            </tr>
            <tr>
              <td><label htmlFor="MF">MF:</label></td>
              <td><input type="text" id="MF" name="MF" value={newFourn.MF} onChange={handleInputChange}  required/></td>
            </tr>
            <tr>
              <td><label htmlFor="fax">Fax:</label></td>
              <td><input type="text" id="fax" name="fax" value={newFourn.fax} onChange={handleInputChange} /></td>
            </tr>
            <tr>
              <td colSpan="2">
                <center>
                  <button type="submit" >Add Fourn</button>
                </center>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
    )
}

export default AddFourn
