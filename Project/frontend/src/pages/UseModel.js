import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UseModel() {
  const [zipfile, setZipfile] = useState(null);
  const [message, setMessage] = useState('');
  const [modelName, setModelName] = useState('');
  const [email, setEmail] = useState('');
  const [predictions, setPredictions] = useState([]); // Store predictions here

  // Fetch email and model name from localStorage when the component mounts
  useEffect(() => {
    const storedEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : null;
    const storedModelName = localStorage.getItem('selectedModel');

    if (!storedEmail || !storedModelName) {
      setMessage('No model selected or user not logged in.');
      return;
    }

    setEmail(storedEmail);
    setModelName(storedModelName);
  }, []);

  // Handle form submission for testing the model
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure file is selected
    if (!zipfile) {
      setMessage('Please select a zip file.');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('m_name', modelName);
    formData.append('zipfile', zipfile);

    try {
      const res = await axios.post('http://localhost:8000/test-model/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Set the predictions from the response
      setPredictions(res.data.predictions);
      setMessage('Model tested successfully.');
    } catch (error) {
      console.error(error);
      setMessage('Failed to test the model.');
    }
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
        <h2 className="text-2xl mb-4">Test Model: {modelName}</h2>

        {/* Display error or success message */}
        {message && <p className="text-red-500 mb-4">{message}</p>}

        {/* Form for uploading a zip file */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Upload Zip File for Testing</label>
            <input
              type="file"
              accept=".zip"
              onChange={(e) => setZipfile(e.target.files[0])}
              className="w-80 px-3 py-2 bg-[#E3F4F3] border rounded focus:outline-none focus:border-[#051937]"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-[#051937] text-white font-semibold px-10 py-2 rounded hover:bg-[#E3F4F3] hover:text-[#051937] transition-all"
          >
            Test Model
          </button>
        </form>

        {/* Display predictions if available */}
        {predictions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl mb-4">Prediction Results:</h3>
            <ul className="list-disc ml-4">
              {predictions.map((prediction, index) => (
                <li key={index} className="mb-2">
                  <strong>Filename:</strong> {prediction.filename}<br />
                  <strong>Predicted Class:</strong> {prediction.predicted_class}<br />
                  <strong>Predictions:</strong> {prediction.predictions.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

export default UseModel;
