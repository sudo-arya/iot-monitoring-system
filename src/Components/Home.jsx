// src/components/SEO.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate(); // Hook to navigate to a different route

  const handleClick = () => {
    navigate("/signin"); // Redirect to the /signin route
  };

  return (
    <div>
      <button
        className="w-full p-40"
        onClick={handleClick} // Trigger redirect on click
      >
        Go to Signin page
      </button>
    </div>
  );
};

export default Home;
