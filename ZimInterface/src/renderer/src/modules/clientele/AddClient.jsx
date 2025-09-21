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
    if (newClient.phoneNumber.length === 1) return;
    setNewClient((prevClient) => {
      const updatedPhoneNumbers = [...prevClient.phoneNumber];
      updatedPhoneNumbers.splice(index, 1);
      return { ...prevClient, phoneNumber: updatedPhoneNumbers };
    });
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    window.electron.ipcRenderer.send('Client:add', newClient);

    window.electron.ipcRenderer.on('Client:succes', (event, data) => {
      setSuccessMessage('Client successfully added.');
      setNewClient({
        clientName: '',
        email: '',
        phoneNumber: [''],
        address: '',
        MF: '',
        fax: '',
      });
    });

    window.electron.ipcRenderer.on('Client:failer', (event, data) => {
      console.log(data);
    });
  };

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      {/* Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-soft">
        {/* Card header */}
        <div className="border-b border-gray-100 p-5 md:p-6">
         <h1 className="flex items-center gap-2 text-xl md:text-2xl font-semibold text-gray-900">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-user-plus"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" x2="19" y1="8" y2="14" />
    <line x1="22" x2="16" y1="11" y2="11" />
  </svg>
  Add client
</h1>

          <p className="mt-1 text-sm text-gray-500">Create a new client profile. Fields marked with <span className="text-brand-600">*</span> are required.</p>

          {successMessage && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {successMessage}
            </div>
          )}
        </div>

        {/* Card content */}
        <form onSubmit={handleAddClient} className="p-5 md:p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Identity */}
            <section className="space-y-4">
              <h2 className="text-sm font-medium text-gray-900">Identity</h2>

              {/* Client Name */}
              <div className="space-y-1.5">
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                  Client name <span className="text-brand-600">*</span>
                </label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={newClient.clientName}
                  onChange={handleInputChange}
                  required
                  placeholder="ACME Corp"
                  className="mt-1 block w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newClient.email}
                  onChange={handleInputChange}
                  placeholder="name@company.com"
                  className="mt-1 block w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              {/* Phone Numbers */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Phone numbers <span className="text-brand-600">*</span></label>
                  <button
                    type="button"
                    onClick={handleAddPhone}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    + Add phone
                  </button>
                </div>

                <div className="space-y-2">
                  {newClient.phoneNumber.map((phone, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="tel"
                        id={`phoneNumber-${index}`}
                        value={phone}
                        onChange={(e) => handlePhoneInputChange(e, index)}
                        required={index === 0}
                        placeholder="e.g. 22 345 678"
                        className="flex-1 rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      />
                      {newClient.phoneNumber.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeletePhone(index)}
                          className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Business info */}
            <section className="space-y-4">
              <h2 className="text-sm font-medium text-gray-900">Business info</h2>

              {/* Address */}
              <div className="space-y-1.5">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address <span className="text-brand-600">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={newClient.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Street, city, postal code"
                  className="mt-1 block w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              {/* MF */}
              <div className="space-y-1.5">
                <label htmlFor="MF" className="block text-sm font-medium text-gray-700">
                  MF <span className="text-brand-600">*</span>
                </label>
                <input
                  type="text"
                  id="MF"
                  name="MF"
                  value={newClient.MF}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter MF"
                  className="mt-1 block w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              {/* Fax */}
              <div className="space-y-1.5">
                <label htmlFor="fax" className="block text-sm font-medium text-gray-700">Fax</label>
                <input
                  type="tel"
                  id="fax"
                  name="fax"
                  value={newClient.fax}
                  onChange={handleInputChange}
                  placeholder="Optional"
                  className="mt-1 block w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="submit"
              className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            >
              Add client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
