import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CreateModel() {
    const [email, setEmail] = useState('');
    const [mChoice, setMChoice] = useState('cnn'); // Default model choice
    const [mName, setMName] = useState('');
    const [epochs, setEpochs] = useState('');
    const [zipfile, setZipfile] = useState(null);
    const [message, setMessage] = useState('');
    const [authToken, setAuthToken] = useState('');

    // Fetch email and token from localStorage when the component mounts
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user')); // Assuming the user data is stored in localStorage
        const token = localStorage.getItem('token'); // Assuming the token is also stored in localStorage
        if (userData && userData.email && token) {
            setEmail(userData.email);
            setAuthToken(token); // Set the token for authenticated requests
        } else {
            setMessage('User not logged in');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ensure file is selected
        if (!zipfile) {
            setMessage('Please select a zip file.');
            return;
        }

        const formData = new FormData();
        formData.append('email', email);
        formData.append('m_choice', mChoice);
        formData.append('m_name', mName);
        formData.append('epochs', epochs);
        formData.append('zipfile', zipfile);

        try {
            // POST request to FastAPI to train the model
            const res = await axios.post('http://localhost:8000/train-model-bulk/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authToken}` // Pass the auth token
                }
            });

            const {
                accuracy,
                f1score,
                recall,
                precision,
                specificity,
                model_path,
                confusion_matrix_path,
                label_map_path
            } = res.data;

            setMessage(`Model training successful! Model saved at ${model_path}`);

            // Save the model details in MongoDB via your Express API
            await saveModelToMongoDB(mName, { accuracy, f1score, recall, precision, specificity });
        } catch (error) {
            console.error(error);
            setMessage('Failed to start model training.');
        }
    };

    // Function to save model details to MongoDB
    const saveModelToMongoDB = async (modelName, metrics) => {
        try {
            const res = await axios.post(
                `http://localhost:5000/api/users/${email}/newModel`,
                { modelName, metrics },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            );
            setMessage('Model and metrics saved to database.');
        } catch (error) {
            console.error('Error saving model to MongoDB:', error);
            setMessage('Failed to save model to database.');
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

            {/* Main Form */}
            <main className="mt-10 ml-20 flex flex-wrap justify-evenly">
                <div>
                    <h2 className="text-2xl mb-4">Train a New Model</h2>

                    <form onSubmit={handleSubmit}>
                        {/* Model Choice as a Select Input */}
                        <div className="mb-4">
                            <label className="block mb-1">Model Choice</label>
                            <select
                                value={mChoice}
                                onChange={(e) => setMChoice(e.target.value)}
                                className="w-80 px-3 py-2 bg-[#E3F4F3] border rounded focus:outline-none focus:border-[#051937]"
                                required
                            >
                                <option value="cnn">CNN</option>
                                <option value="efficientnet">EfficientNet</option>
                                <option value="resnet50">ResNet50</option>
                                <option value="mobilenetv2">MobileNetV2</option>
                                <option value="inceptionv3">InceptionV3</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1">Model Name</label>
                            <input
                                type="text"
                                value={mName}
                                onChange={(e) => setMName(e.target.value)}
                                className="w-80 px-3 py-2 bg-[#E3F4F3] border rounded focus:outline-none focus:border-[#051937]"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1">Epochs</label>
                            <input
                                type="number"
                                value={epochs}
                                onChange={(e) => setEpochs(e.target.value)}
                                className="w-80 px-3 py-2 bg-[#E3F4F3] border rounded focus:outline-none focus:border-[#051937]"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1">Upload Zip File</label>
                            <input
                                type="file"
                                accept=".zip"
                                onChange={(e) => setZipfile(e.target.files[0])}
                                className="w-80 px-3 py-2 bg-[#E3F4F3] border rounded focus:outline-none focus:border-[#051937]"
                                required
                            />
                        </div>

                        <button type="submit" className="bg-[#E3F4F3] text-[#051937] font-semibold px-10 py-2 rounded hover:bg-[#051937] hover:text-[#E3F4F3] transition-all">
                            Start Training
                        </button>
                    </form>

                    {/* Display message */}
                    {message && <p className="mt-4 text-red-500">{message}</p>}
                </div>

                {/* Instructions */}
                <div className="p-6">
                    <h1 className="text-xl font-bold text-[#051937]">Save the zip file in this format:</h1>
                    <h2 className="text-lg font-semibold text-[#E3F4F3] bg-[#051937] px-2 py-1 inline-block rounded my-2">data.zip</h2>

                    <ol className="list-decimal ml-4">
                        <li>Label 1
                            <ol className="list-disc ml-6">
                                <li>Image.jpg</li>
                                <li>Image.jpg</li>
                                <li>...</li>
                            </ol>
                        </li>
                        <li>Label 2
                            <ol className="list-disc ml-6">
                                <li>Image.jpg</li>
                                <li>Image.jpg</li>
                                <li>...</li>
                            </ol>
                        </li>
                        <li>Label 3
                            <ol className="list-disc ml-6">
                                <li>Image.jpg</li>
                                <li>Image.jpg</li>
                                <li>...</li>
                            </ol>
                        </li>
                        <li>...</li>
                    </ol>
                </div>
            </main>
        </div>
    );
}

export default CreateModel;
