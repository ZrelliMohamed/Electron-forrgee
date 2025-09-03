import React, { useEffect, useState } from "react";

function GetClient({ setClt }) {
  const [client, setClient] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Écoute le choix d’un client depuis la fenêtre de sélection
  useEffect(() => {
    const handleChoosedClient = (event, data) => {
      setClient(data);
      setClt(data);
      setErrorMessage("");
    };

    window.electron.ipcRenderer.on("ChoosedClient", handleChoosedClient);

    return () => {
      window.electron.ipcRenderer.removeAllListeners("ChoosedClient");
    };
  }, [setClt]);

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Sélecteur */}
      <div className="flex items-center gap-2">
        <label className="font-semibold text-gray-700">Référence Client:</label>
        <input
          type="text"
          value={client?.referance || ""}
          readOnly
          className="border border-gray-300 rounded-lg p-1 px-2 w-32 text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          onClick={() => window.electron.ipcRenderer.send("CreateClientList", "")}
          className="px-3 py-1 bg-brand-500 text-white rounded-2xl shadow-soft hover:bg-brand-600 transition"
        >
          ...
        </button>
      </div>

      {/* Affichage infos client */}
      {client && (
        <div className="mt-3">
          <table className="w-full text-sm text-gray-700 border border-gray-200 rounded-2xl shadow-soft">
            <tbody className="divide-y divide-gray-200">
              <tr className="flex flex-wrap md:table-row">
                <td className="w-1/2 md:w-auto px-3 py-2 font-bold text-gray-800">Nom:</td>
                <td className="w-1/2 md:w-auto px-3 py-2">{client.clientName}</td>
                <td className="w-1/2 md:w-auto px-3 py-2 font-bold text-gray-800">Mat. Fisc:</td>
                <td className="w-1/2 md:w-auto px-3 py-2">{client.MF}</td>
              </tr>
              <tr className="flex flex-wrap md:table-row">
                <td className="w-1/2 md:w-auto px-3 py-2 font-bold text-gray-800">Téléphone:</td>
                <td className="w-1/2 md:w-auto px-3 py-2">{client.phoneNumber?.[0] || ""}</td>
                <td className="w-1/2 md:w-auto px-3 py-2 font-bold text-gray-800">Fax:</td>
                <td className="w-1/2 md:w-auto px-3 py-2">{client.fax}</td>
              </tr>
              <tr className="flex flex-wrap md:table-row">
                <td className="w-1/2 md:w-auto px-3 py-2 font-bold text-gray-800">Adresse:</td>
                <td className="w-1/2 md:w-auto px-3 py-2">{client.address}</td>
                <td className="w-1/2 md:w-auto px-3 py-2 font-bold text-gray-800">Email:</td>
                <td className="w-1/2 md:w-auto px-3 py-2">{client.email}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Message d'erreur */}
      {errorMessage && (
        <p className="text-red-500 font-medium">{errorMessage}</p>
      )}
    </div>
  );
}

export default GetClient;