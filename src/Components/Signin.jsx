import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  // eslint-disable-next-line
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  // eslint-disable-next-line
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [toastColor, setToastColor] = useState(""); // Add this line
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    let timer;
    if (toastMessage) {
      // Set a timer to clear the toast message after 3 seconds
      timer = setTimeout(() => {
        setToastMessage("");
      }, 3000);
    }

    // Clear the timer if the toast message changes or the component unmounts
    return () => {
      clearTimeout(timer);
    };
  }, [toastMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post("/login", {
        email,
        password,
      });

      if (response.status === 200) {
        const { token, user, locations } = response.data;
        // console.log("API Response:", response.data);

        // Save token and user details in local storage
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user.userId);
        localStorage.setItem("userRole", user.role.trim().toLowerCase()); // Always store roles in lowercase
        // Ensure locations are an array and save them to localStorage
        const userLocations =
          Array.isArray(locations) && locations.length > 0 ? locations : [];
        localStorage.setItem("locations", JSON.stringify(userLocations));

        // Redirect based on role
        if (user.role === "admin") {
          setToastMessage("Redirecting to Admin Dashboard");
          setToastColor("bg-green-500");
          navigate("/admin-dashboard", {
            state: {
              toastMessage: "Welcome Admin",
              toastColor: "bg-green-100",
            },
          });
        } else {
          setToastMessage("Redirecting to Dashboard");
          setToastColor("bg-green-100");
          navigate("/dashboard", {
            state: { toastMessage: "Welcome User", toastColor: "bg-green-100" },
          });
        }
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          setErrorMessage("Invalid email or password");
        } else if (error.response.status === 403) {
          setErrorMessage("Login not allowed for this user");
        } else {
          setErrorMessage("Something went wrong. Please try again.");
        }
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className=" w-full flex flex-col justify-center items-center relative bg-gray-100">
      <div className="my-8">
        {toastMessage && (
          <div
            className={`toast-top ${toastColor} p-2 px-10 my-20 rounded-xl text-green-700`}
          >
            {toastMessage}
          </div>
        )}

        {isLoading && ( // Display loading component when isLoading is true
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24"></div>
          </div>
        )}
        <div className="my-10">
          <div className="w-full max-w-md p-8 bg-white rounded shadow">
            <h2 className="text-3xl font-bold text-center">Sign In</h2>

            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-md font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 mt-1 mb-2 border rounded"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-md font-medium">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-2 mt-1 mb-2 border rounded"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {errorMessage && (
                <div className="p-2 my-4 text-sm text-red-700 bg-red-100 rounded">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="p-2 text-sm my-4 text-green-700 bg-green-100 rounded">
                  {successMessage}
                </div>
              )}
              <button
                type="submit"
                className="w-full px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
