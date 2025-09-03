import React, { useEffect, useState } from 'react'

function WindowAskForDelete() {
    const [Articles, setArticles] = useState([])

      useEffect( () => {
        window.electron.ipcRenderer.send('Articles', '')
        window.electron.ipcRenderer.on("Articles-reply", (event, data) => {
        setArticles(data);
        console.log(data);

    })
  }, [])
    return (
     <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white shadow-soft rounded-2xl p-6 max-w-sm w-full">
    
        {/* Message */}
        <p className="text-gray-600 mb-6">
          Voulez-vous vraiment supprimer cet article ?  
          Cette action est <span className="font-semibold text-red-500">irréversible</span>.
        </p>

        {/* Boutons */}
        <div className="flex justify-end gap-3">
          <button
           
            className="px-4 py-2 rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Annuler
          </button>
          <button
           
            className="px-4 py-2 rounded-2xl bg-brand-500 text-white hover:bg-brand-600 transition"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
    )
}
export default WindowAskForDelete