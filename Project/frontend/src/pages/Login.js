import React, { useState } from 'react';
import axios from 'axios'; // For making API requests

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', { email, password });
      const { token, user } = res.data;
      
      // Save the token in localStorage (or sessionStorage)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect to dashboard after login
      window.location.href = '/dashboard';
    } catch (error) {
      if (error.response && error.response.data.msg) {
        setErrorMessage(error.response.data.msg);
      } else {
        setErrorMessage('Server error. Please try again later.');
      }
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

        {/* Form */}
        <div className="mt-28 ml-20 w-80 text-center">
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
            <form onSubmit={handleLogin}>
              <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="mb-4 w-full px-3 py-2 bg-[#E3F4F3] border rounded focus:outline-none focus:border-[#051937]"
              /><br></br>
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="mb-6 w-full px-3 py-2 bg-[#E3F4F3] border rounded focus:outline-none focus:border-[#051937]"
              /><br></br>
              <button type="submit" className="bg-[#E3F4F3] text-[#051937] font-semibold px-10 py-2 rounded hover:bg-[#051937] hover:text-[#E3F4F3] transition-all">
                  Login
              </button>
            </form>
        </div>
    </div>
  );
}

export default Login;
