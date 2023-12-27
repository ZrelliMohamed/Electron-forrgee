import React, { useEffect, useState } from "react";
import axios from "axios";
import Article from '../Helper/ArticleHelper/Article.jsx';

function Articles() {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [reTogle, setReTogle] = useState(true);

  const togle =()=> {
    setReTogle(!reTogle)
  }

  const getAllArticles = async () => {
    try {
      const { data } = await axios.get('http://localhost:443/article/get');
      setArticles(data);
      setSearchResults(data); // Initialize search results with all articles
    } catch (error) {
      console.log(error);
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    filterArticles(e.target.value);
  }

  const filterArticles = (term) => {
    if (!term) {
      setSearchResults(articles); // If the search term is empty, show all articles
    } else {
      const filtered = articles.filter(article => (
        article.referance.toString().toLowerCase().includes(term.toLowerCase()) ||
        article.designation.toLowerCase().includes(term.toLowerCase()) ||
        article.unite.toString().toLowerCase().includes(term.toLowerCase()) ||
        article.prix_unitaire.toString().toLowerCase().includes(term.toLowerCase())
      ));
      setSearchResults(filtered);
    }
  }

  useEffect(() => {
    getAllArticles();
  }, [reTogle]);

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <table width='100%'>
          <thead>
            <tr>
              <th>Referance</th>
              <th>Designation</th>
              <th>unite</th>
              <th>Prix Unitaire</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.length > 0 && searchResults.map((artcl, i) => (
              <Article article={artcl} key={i}  togle={togle}/>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Articles;
