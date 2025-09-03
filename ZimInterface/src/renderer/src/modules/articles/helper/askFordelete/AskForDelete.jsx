import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import WindowAskForDelete from './WindowAskForDelete.jsx'
import '../../../../index.css'
ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<WindowAskForDelete/>}></Route>
    </Routes>
  </HashRouter>
)
