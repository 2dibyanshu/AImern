import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Details() {
  const [metrics, setMetrics] = useState(null); // Store the fetched metrics
  const [message, setMessage] = useState('');

  // Fetch email and modelName from localStorage
  useEffect(() => {
    const email = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : null;
    const modelName = localStorage.getItem('selectedModel');

    if (!email || !modelName) {
      setMessage('No model details available.');
      return;
    }

    // Fetch model details from the backend
    fetchModelDetails(email, modelName);
  }, []);

  // Function to fetch model metrics
  const fetchModelDetails = async (email, modelName) => {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage

    try {
      const res = await axios.get(`http://localhost:5000/api/users/${email}/${modelName}/metrics`, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token for authentication
        },
      });
      setMetrics(res.data); // Set the fetched metrics
    } catch (error) {
      console.error('Error fetching model details:', error);
      setMessage('Failed to fetch model details.');
    }
  };

  // Function to redirect to the "Use Model" page
  const handleUseModel = () => {
    window.location.href = '/usemodel'; // Redirect to /usemodel
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-[#051937] text-white p-4 flex justify-between items-center">
        <div className="font-bold text-lg">
          <h1 className='text-3xl'>CustomCNN</h1>
          <h2>by Squad of Syntax</h2>
        </div>
        <button className="bg-[#E3F4F3] text-[#051937] font-semibold px-10 py-2 rounded hover:bg-[#051937] hover:text-[#E3F4F3] transition-all hover:border hover:border-[#E3F4F3]" onClick={() => {
          window.location.href = "/register";
        }}>
          Register
        </button>
      </header>

      {/* Main Section */}
      <main className="mt-10 ml-20">
        <h2 className="text-2xl mb-4">Model Metrics</h2>

        {/* Display message if any */}
        {message && <p className="text-red-500 mb-4">{message}</p>}

        {/* Display model metrics */}
        {metrics ? (
          <div className="text-lg">
            <p><strong>Accuracy:</strong> {metrics.accuracy}</p>
            <p><strong>Precision:</strong> {metrics.precision}</p>
            <p><strong>Recall:</strong> {metrics.recall}</p>
            <p><strong>F1 Score:</strong> {metrics.f1Score}</p>
            <p><strong>Specificity:</strong> {metrics.specificity}</p>

            {/* Button to use the model */}
            <button
              className="bg-[#051937] text-white font-semibold px-6 py-2 rounded hover:bg-[#E3F4F3] hover:text-[#051937] transition-all mt-6"
              onClick={handleUseModel}
            >
              Use Model
            </button>
          </div>
        ) : (
          <p>Loading model details...</p>
        )}
      </main>
    </div>
  );
}

export default Details;
