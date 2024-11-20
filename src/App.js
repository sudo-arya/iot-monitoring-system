// import logo from './logo.svg';

import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "./index.css";
import Home from "./Components/Home";
import Navbar from "./Components/Navbar";
// import Footer from "./Components/Footer";
import Seo from "./Components/Seo";
import Signin from "./Components/Signin";
import ProtectedRoute from "./Components/ProtectedRoute";
import Dashboard from "./Components/Dashboard";
import AdminDashboard from "./Components/AdminDashboard";
import Irrigation from "./Components/Irrigation";
import Analysis from "./Components/Analysis";
import Pest from "./Components/Pest";
import Management from "./Components/Management";
import Logging from "./Components/Logging";
import Alert from "./Components/Alert";
import Control from "./Components/Control";
import Support from "./Components/Support";


import './App.css';

function App() {

  function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);

    return null;
  }

  return (
    <Router>
      <div className="">
        <Navbar />
        <Seo title="Home" description="" keywords="" />
        <ScrollToTop />
        <div className="flex mx-auto">
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<Signin />} />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute role="user">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/irrigation"
              element={
                <ProtectedRoute role="user">
                  <Irrigation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analysis"
              element={
                <ProtectedRoute role="user">
                  <Analysis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pest"
              element={
                <ProtectedRoute role="user">
                  <Pest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/management"
              element={
                <ProtectedRoute role="user">
                  <Management />
                </ProtectedRoute>
              }
            />
            <Route
              path="/logging"
              element={
                <ProtectedRoute role="user">
                  <Logging />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alert"
              element={
                <ProtectedRoute role="user">
                  <Alert />
                </ProtectedRoute>
              }
            />
            <Route
              path="/control"
              element={
                <ProtectedRoute role="user">
                  <Control />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute role="user">
                  <Support />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        {/* <Footer /> */}
      </div>
    </Router>
  );
}

export default App;
