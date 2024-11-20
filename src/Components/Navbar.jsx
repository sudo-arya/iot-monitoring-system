// src/components/SEO.js
import React from "react";
import { FaSignOutAlt } from "react-icons/fa";
// import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  // Check if the user is signed in
  const isSignedIn = !!localStorage.getItem("token");
  // const isUser = !!localStorage.getItem("userRole");
  
  const handleRedirect = () => {
    const userRole = localStorage.getItem("userRole"); // Retrieve user role
    const token = localStorage.getItem("token"); // Retrieve JWT token

    if (!token) {
      // If token is missing, redirect to login
      navigate("/sign-in");
      return;
    }

    if (userRole === "admin") {
      navigate("/admin-dashboard");
    } else if (userRole === "user") {
      navigate("/dashboard");
    } else {
      // Handle unexpected roles
      navigate("/sign-in");
    }
  };

  const handleSignOut = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");

    // Redirect to Sign-in page with a toast message
    navigate("/", {
      state: {
        toastMessage: "You have successfully signed out.",
        toastColor: "bg-green-500",
      },
    });
  };

  return (
    <nav className="w-full bg-blue-800 p-2 pl-16 pr-8 py-3 fixed top-0 z-50">
      <div className="mx-auto flex justify-between items-center font-bold text-lg ">
        {" "}
        <Link to="/" className="flex items-center xl:space-x-2">
          <span className="text-white hover:text-black">Home </span>
        </Link>
        <Link to="/dashboard" className="flex items-center xl:space-x-2">
          {isSignedIn && ( // Render button only if user is signed in
            <button
              onClick={handleRedirect}
              className="flex whitespace-nowrap text-white hover:text-black rounded xl:ml-20 items-end justify-end"
            >
              Dashboard
            </button>
          )}
        </Link>
        {/* <a href="/dashboard">Dashboard</a> */}
        <div className="">
          {isSignedIn && ( // Render button only if user is signed in
            <button
              onClick={handleSignOut}
              className="flex whitespace-nowrap text-white hover:text-black rounded items-end justify-end"
            >
              <FaSignOutAlt size={24} title="Logout" className="xl:mr-2" />{" "}
              <span className="hidden lg:block ">Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
