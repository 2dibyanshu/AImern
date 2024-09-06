import React from 'react';

function Dashboard() {
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

        <main className='flex flex-wrap justify-evenly mt-20'>
            <button className='bg-[#E3F4F3] text-[#051937] text-2xl font-semibold px-10 py-2 h-40 w-40 rounded hover:bg-[#051937] hover:text-[#E3F4F3] transition-all hover:border hover:border-[#E3F4F3]' onClick={() => {
                window.location.href = "/createmodel"
            }}>New Model</button>
            <button className='bg-[#E3F4F3] text-[#051937] text-2xl font-semibold px-10 py-2 h-40 w-40 rounded hover:bg-[#051937] hover:text-[#E3F4F3] transition-all hover:border hover:border-[#E3F4F3]' onClick={() => {
                window.location.href = "/allmodels"
            }}>Existing Models</button>
        </main>
    </div>
  );
}

export default Dashboard;