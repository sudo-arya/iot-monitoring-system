// src/components/SEO.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate(); // Hook to navigate to a different route

  const handleClick = () => {
    navigate("/signin"); // Redirect to the /signin route 
  };

  return (
    <div className="flex items-center justify-center w-full bg-gray-100">
      <div className=" flex items-center justify-center p-2">
        <button
          className="w-full p-20 bg-gray-400 hover:bg-blue-300 text-3xl font-semibold"
          onClick={handleClick} // Trigger redirect on click
        >
          Go to Signin page
        </button>
      </div>
    </div>
  );
};

export default Home;
