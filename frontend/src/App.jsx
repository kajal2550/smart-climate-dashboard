import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClimateProvider } from './context/ClimateContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import SensorsPage from './components/SensorsPage';
import AlertsPage from './components/AlertsPage';
import MapPage from './components/MapPage';
import AnalyticsPage from './components/AnalyticsPage';
import ContactPage from './components/ContactPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ClimateProvider>
        <Router>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/"          element={<HomePage />}      />
                <Route path="/login"     element={<LoginPage />}     />
                <Route path="/register"  element={<RegisterPage />}  />
                <Route path="/contact"   element={<ContactPage />}   />
                <Route path="/dashboard" element={<div className="page-inner"><Dashboard /></div>}     />
                <Route path="/sensors"   element={<div className="page-inner"><SensorsPage /></div>}   />
                <Route path="/alerts"    element={<div className="page-inner"><AlertsPage /></div>}    />
                <Route path="/map"       element={<div className="page-inner"><MapPage /></div>}       />
                <Route path="/analytics" element={<div className="page-inner"><AnalyticsPage /></div>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ClimateProvider>
    </AuthProvider>
  );
}

export default App;
