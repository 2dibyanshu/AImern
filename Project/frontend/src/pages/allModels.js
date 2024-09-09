import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AllModels() {
  const [models, setModels] = useState([]);
  const [message, setMessage] = useState('');
  const [authToken, setAuthToken] = useState('');

  // Fetch email and token from localStorage when the component mounts
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user')); // Assuming the user data is stored in localStorage
    const token = localStorage.getItem('token'); // Assuming the token is also stored in localStorage
    
    if (userData && userData.email && token) {
      setAuthToken(token); // Set the token for authenticated requests
      fetchModels(userData.email, token);
    } else {
      setMessage('User not logged in');
    }
  }, []);

  // Function to fetch the models from the backend
  const fetchModels = async (email, token) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${email}/models`, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token for authentication
        },
      });
      setModels(res.data); // Set the models received from the backend
    } catch (error) {
      console.error(error);
      setMessage('Failed to fetch models.');
    }
  };

  // Function to handle button click
  const handleModelClick = (modelName) => {
    localStorage.setItem('selectedModel', modelName); // Save the clicked model name in localStorage
    window.location.href = '/modeldetails'; // Redirect to the model details page
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
        <h2 className="text-2xl mb-4">Your Models</h2>

        {/* Display error message if any */}
        {message && <p className="text-red-500 mb-4">{message}</p>}

        {/* Display the models */}
        <ul className="list-disc ml-6">
          {models.length > 0 ? (
            models.map((model, index) => (
              <li key={index} className="text-lg mb-2">
                <button
                  className="bg-[#051937] text-white font-semibold px-6 py-2 rounded hover:bg-[#E3F4F3] hover:text-[#051937] transition-all"
                  onClick={() => handleModelClick(model)}
                >
                  {model}
                </button>
              </li>
            ))
          ) : (
            <p>No models available.</p>
          )}
        </ul>
      </main>
    </div>
  );
}

export default AllModels;
