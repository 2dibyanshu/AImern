import React from 'react';

function Register() {
  return (
    <div>
        {/* Header */}
        <header className="bg-[#051937] text-white p-4 flex justify-between items-center">
            <div className="font-bold text-lg">
                <h1 className='text-3xl'>CustomCNN</h1>
                <h2>by Squad of Syntax</h2>
            </div>
            <button className="bg-[#E3F4F3] text-[#051937] font-semibold px-10 py-2 rounded hover:bg-[#051937] hover:text-[#E3F4F3] transition-all hover:border hover:border-[#E3F4F3]" onClick={() => {
                window.location.href = "/login";
            }}>
                Login
            </button>
        </header>

        {/* Form */}
        <div className="mt-28 ml-20 w-80 text-center">
            <input
                type="text"
                placeholder="Name"
                className="mb-4 w-full px-3 py-2 bg-[#E3F4F3] border rounded focus:outline-none focus:border-[#051937]"
            /><br></br>
            <input
                type="text"
                placeholder="Email"
                className="mb-4 w-full px-3 py-2 bg-[#E3F4F3] border rounded focus:outline-none focus:border-[#051937]"
            /><br></br>
            <input
                type="password"
                placeholder="Password"
                className="mb-6 w-full px-3 py-2 bg-[#E3F4F3] border rounded focus:outline-none focus:border-[#051937]"
            /><br></br>
            <button className="bg-[#E3F4F3] text-[#051937] font-semibold px-10 py-2 rounded hover:bg-[#051937] hover:text-[#E3F4F3] transition-all">
                Register
            </button>
        </div>
    </div>
  );
}

export default Register;