import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
function UpdateClient() {
  const location = useLocation();
  const initialClientData = location.state.clientData;
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updatedClient, setUpdatedClient] = useState({
    clientName: '',
    email: '',
    phoneNumber: [''],
    address: '',
    MF: '',
    fax: '',
    exonere: false,
  });


  useEffect(() => {
    if (initialClientData) {
      setUpdatedClient(initialClientData);
    }
  }, [initialClientData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedClient((prevClient) => ({
      ...prevClient,
      [name]: value,
    }));
  };

  const handleAddPhone = () => {
    setUpdatedClient((prevClient) => ({
      ...prevClient,
      phoneNumber: [...prevClient.phoneNumber, ''],
    }));
  };

  const handlePhoneInputChange = (e, index) => {
    const { value } = e.target;
    setUpdatedClient((prevClient) => {
      const updatedPhoneNumbers = [...prevClient.phoneNumber];
      updatedPhoneNumbers[index] = value;
      return { ...prevClient, phoneNumber: updatedPhoneNumbers };
    });
  };

  const handleDeletePhone = (index) => {
    if (updatedClient.phoneNumber.length === 1) {
      return;
    }
    setUpdatedClient((prevClient) => {
      const updatedPhoneNumbers = [...prevClient.phoneNumber];
      updatedPhoneNumbers.splice(index, 1);
      return { ...prevClient, phoneNumber: updatedPhoneNumbers };
    });
  };

  const handleUpdateClient = async () => {
    window.electron.ipcRenderer.send('Client:Update', updatedClient)
    window.electron.ipcRenderer.on('UpdateClient:succes', (event, data) => {
      setUpdateSuccess(true);
         setTimeout(() => {
        setUpdateSuccess(false); // Reset success message after some time
      }, 3000);
    })
    window.electron.ipcRenderer.on('UpdateClient:ref?', (event, msg) => {
      console.log(msg);
    })
    window.electron.ipcRenderer.on('UpdateClient:err', (event, err) => {
      console.log(err);
    })


  };


  const handleButtonClick = (e) => {
    e.preventDefault();
    handleUpdateClient();
  };

  return (
    <div>
      {updateSuccess && (
        <div >
          Client successfully updated.
        </div>
      )}
      <div>
        <form onSubmit={handleButtonClick}>
          <h1>Update Client</h1>
          <table>
            <tbody>
              {/* Client Name */}
              <tr>
                <td><label htmlFor="clientName">Client Name:</label></td>
                <td>
                  <input
                    type="text"
                    id="clientName"
                    name="clientName"
                    value={updatedClient.clientName}
                    onChange={handleInputChange}
                    required
                  />
                </td>
              </tr>

              {/* Email */}
              <tr>
                <td><label htmlFor="email">Email:</label></td>
                <td>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    value={updatedClient.email}
                    onChange={handleInputChange}

                  />
                </td>
              </tr>

              {/* Phone Numbers */}
              {updatedClient.phoneNumber.map((phone, index) => (
                <tr key={index}>
                  <td><label htmlFor={`phoneNumber-${index}`}>Phone Number {index + 1}:</label></td>
                  <td>
                    <input
                      type="number"
                      id={`phoneNumber-${index}`}
                      value={phone}
                      onChange={(e) => handlePhoneInputChange(e, index)}
                      required={index === 0}
                    />
                    {updatedClient.phoneNumber.length > 1 && (
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

              {/* Address */}
              <tr>
                <td><label htmlFor="address">Address:</label></td>
                <td>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={updatedClient.address}
                    onChange={handleInputChange}
                    required
                  />
                </td>
              </tr>

              {/* MF */}
              <tr>
                <td><label htmlFor="MF">MF:</label></td>
                <td>
                  <input
                    type="text"
                    id="MF"
                    name="MF"
                    value={updatedClient.MF}
                    onChange={handleInputChange}
                    required
                  />
                </td>
              </tr>

              {/* Fax */}
              <tr>
                <td><label htmlFor="fax">Fax:</label></td>
                <td>
                  <input
                    type="text"
                    id="fax"
                    name="fax"
                    value={updatedClient.fax}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>
              {/* Exonere Checkbox */}
              <tr>
                <td><label htmlFor="exonere">Exonere:</label></td>
                <td>
                  <input
                    type="checkbox"
                    id="exonere"
                    name="exonere"
                    checked={updatedClient.exonere}
                    onChange={(e) => setUpdatedClient(prevClient => ({ ...prevClient, exonere: e.target.checked }))}
                  />
                </td>
              </tr>

              {/* Submit Button */}
              <tr>
                <td colSpan="2">
                  <center>
                    <button type="submit" >Update Client</button>
                  </center>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    </div>
  );
}

export default UpdateClient;
