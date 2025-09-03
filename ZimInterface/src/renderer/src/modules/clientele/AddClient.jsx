import { useState } from 'react';
export default function AddClient() {
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
   <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-soft">
      <h1 className="text-2xl font-bold text-brand-700 mb-4">New Client</h1>

      {successMessage && (
        <p className="mb-4 p-2 rounded-md bg-green-100 text-green-700 text-sm">
          {successMessage}
        </p>
      )}

      <form onSubmit={handleAddClient} className="space-y-4">
        {/* Client Name */}
        <div>
          <label
            htmlFor="clientName"
            className="block text-sm font-medium text-gray-700"
          >
            Client Name
          </label>
          <input
            type="text"
            id="clientName"
            name="clientName"
            value={newClient.clientName}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:border-brand-500 focus:ring-brand-500"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="text"
            id="email"
            name="email"
            value={newClient.email}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:border-brand-500 focus:ring-brand-500"
          />
        </div>

        {/* Phone Numbers */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Phone Numbers
          </label>
          {newClient.phoneNumber.map((phone, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="number"
                id={`phoneNumber-${index}`}
                value={phone}
                onChange={(e) => handlePhoneInputChange(e, index)}
                required={index === 0}
                className="flex-1 rounded-lg border border-gray-300 p-2 focus:border-brand-500 focus:ring-brand-500"
              />
              {newClient.phoneNumber.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeletePhone(index)}
                  className="px-3 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddPhone}
            className="mt-2 w-full px-4 py-2 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600"
          >
            + Add Phone Number
          </button>
        </div>

        {/* Address */}
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={newClient.address}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:border-brand-500 focus:ring-brand-500"
          />
        </div>

        {/* MF */}
        <div>
          <label
            htmlFor="MF"
            className="block text-sm font-medium text-gray-700"
          >
            MF
          </label>
          <input
            type="text"
            id="MF"
            name="MF"
            value={newClient.MF}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:border-brand-500 focus:ring-brand-500"
          />
        </div>

        {/* Fax */}
        <div>
          <label
            htmlFor="fax"
            className="block text-sm font-medium text-gray-700"
          >
            Fax
          </label>
          <input
            type="text"
            id="fax"
            name="fax"
            value={newClient.fax}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:border-brand-500 focus:ring-brand-500"
          />
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-brand-600 text-white py-2 rounded-xl shadow-soft hover:bg-brand-700 transition"
          >
            + Client
          </button>
        </div>
      </form>
    </div>
);
}