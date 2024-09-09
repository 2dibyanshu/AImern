import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateModel from './pages/createModel';
import AllModels from './pages/allModels';
import Details from './pages/Details';
import UseModel from './pages/UseModel';

const App = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/createmodel" element={<CreateModel />} />
            <Route path="/allmodels" element={<AllModels />} />
            <Route path="/modeldetails" element={<Details />} />
            <Route path="/usemodel" element={<UseModel />} />
            <Route path="/" element={<Login />} />
        </Routes>
    );
};

export default App;