import React from 'react';

function App() {
  return (
    <div>
      <div>
        {/* Header */}
        <header className="bg-blue-900 text-white p-4 flex justify-between items-center">
          <div className="font-bold text-lg">
            <h1>CustomCNN</h1>
            <h2>by Squad of Syntax</h2>
          </div>
          <button className="bg-gray-200 text-blue-900 font-semibold px-4 py-1 rounded hover:bg-gray-300">
            Register
          </button>
        </header>

        {/* Form */}
        <div className="px-8 py-6 mt-12 w-1/5 text-center">
          <input
            type="text"
            placeholder="Username"
            className="mb-4 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          /><br></br>
          <input
            type="password"
            placeholder="Password"
            className="mb-6 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          /><br></br>
          <button className="bg-gray-200 text-blue-900 font-semibold w-40 py-2 rounded hover:bg-gray-300">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
