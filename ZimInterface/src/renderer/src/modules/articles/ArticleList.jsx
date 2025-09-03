import React, { useEffect, useState } from "react";
import Article from './helper/Article.jsx';

export default function ArticleList() {
const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [reTogle, setReTogle] = useState(true);

  const togle =()=> {
    setReTogle(!reTogle)
  }

  const getAllArticles = async () => {
    window.electron.ipcRenderer.send('Articles', 'getAll')
    window.electron.ipcRenderer.on('Articles-reply', (event, data) => {
      setArticles(data);
      setSearchResults(data);
    })
    window.electron.ipcRenderer.on('Articles-reply:err', (event, data) => {
      console.log(data);
    })
  }



  useEffect(() => {
    getAllArticles();
  }, [reTogle]);
return (
<div className="overflow-x-auto">
  <div className="p-4 bg-white shadow-soft rounded-2xl">
    <table className="w-full border-collapse">
      <thead className="bg-brand-50">
        <tr>
          <th className="px-4 py-3 text-left text-sm font-semibold text-brand-800">Référence</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-brand-800">Désignation</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-brand-800">Unité</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-brand-800">Prix Unitaire</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-brand-800"></th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-brand-800"></th>
        </tr>
      </thead>
      <tbody>
        {searchResults.length > 0 && searchResults.map((artcl, i) => (
          <tr
            key={i}
            className="border-b border-gray-200 hover:bg-brand-50 transition"
          >
            <Article article={artcl} togle={togle} />
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>


);
}