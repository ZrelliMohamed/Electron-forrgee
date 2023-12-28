import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FactureSetting = () => {
    const [data, setData] = useState({
        Tva: 0,
        fodec: 0,
        timbreFiscal: 0,
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          await axios.put('http://localhost:443/setting/put', data);
          setSuccess('Variables updated successfully');
          setError('');
          setTimeout(() => {
              setSuccess('');
          }, 3000); // Clear success message after 3 seconds
      } catch (error) {
          setError('Error updating variables: ' + error.message);
          setSuccess('');
          setTimeout(() => {
              setError('');
          }, 3000); // Clear error message after 3 seconds
      }
  };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:443/setting');
                const { Tva, fodec, timbreFiscal } = response.data.document;
                setData({ Tva, fodec, timbreFiscal });
            } catch (error) {
                setError('Error fetching data: ' + error.message);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h2>Update Variables</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <form onSubmit={handleSubmit}>
                <table>
                    <tbody>
                        {Object.keys(data).map((key) => (
                            <tr key={key}>
                                <td>{key}</td>
                                <td>
                                    <input
                                        type="number"
                                        name={key}
                                        value={data[key]}
                                        onChange={handleChange}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button type="submit">Update Variables</button>
            </form>
        </div>
    );
};

export default FactureSetting;
