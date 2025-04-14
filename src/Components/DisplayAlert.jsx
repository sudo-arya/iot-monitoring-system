import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle } from 'react-icons/fa'; // Import icons for status

const DisplayAlert = ({ userId }) => {
  const [alerts, setAlerts] = useState([]);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    if (!userId) return;

    // Clear previous alerts when connecting to a new SSE connection
    setAlerts([]);

    const eventSource = new EventSource(`${BASE_URL}/get-alerts-for-user?user_id=${userId}`);

    eventSource.onmessage = (event) => {
      const alertData = JSON.parse(event.data);
      if (alertData.alert_type) {
        setAlerts((prevAlerts) => [...prevAlerts, alertData]);
      } else {
        console.log(alertData.message); // No alerts found
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [userId,BASE_URL]);

  // Function to format timestamp to "8:40 AM 24 Nov"
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      day: '2-digit',
      month: 'short',
    });
  };

  // Function to determine icon based on alert status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <FaCheckCircle className="text-green-500" />;
      case 'Warning':
        return <FaExclamationCircle className="text-yellow-500" />;
      case 'Critical':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaExclamationCircle className="text-gray-500" />;
    }
  };

  return (
    // <div className="xl:w-[calc(100vw-84rem)] w-[calc(100vw-6rem)] p-">
    <div className="xl:w-full w-[calc(100vw-6rem)]">
    <h2 className="text-3xl font-semibold mb-4 mt-4 text-gray-800">Latest Alerts :-</h2>

    {/* Wrapper */}
    <div className="overflow-x-auto shadow-md rounded-lg border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 overflow-y-auto xl:h-[calc(100vh-40rem)] h-[calc(100vh-30rem)] xl:w-full  w-[calc(100vw-6rem)] bg-white">

      {/* Header for xl screens */}
      <div className="hidden xl:grid grid-cols-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-sm sticky top-0 z-10">
        <div className="p-3 border-r">Alert Message</div>
        <div className="p-3 border-r text-center">Timestamp</div>
        <div className="p-3 text-center">Status</div>
      </div>

      {/* Data rows for xl screens */}
      <div className="hidden xl:block text-sm">
        {alerts.map((alert, index) => (
          <div key={index} className="grid grid-cols-3 border-t border-gray-200 hover:bg-gray-50 transition">
            <div className="p-3 border-r font-medium text-gray-800">{alert.alert_message}</div>
            <div className="p-3 border-r text-center text-gray-600">{formatTimestamp(alert.timestamp)}</div>
            <div className="p-3 text-center text-gray-600 flex items-center justify-center">
              <span className="mr-2">{getStatusIcon(alert.alert_status)}</span>
              {alert.alert_status}
            </div>
          </div>
        ))}
      </div>

      {/* Responsive cards for smaller screens */}
      <div className="xl:hidden space-y-2 text-sm p-2">
        {alerts.map((alert, index) => (
          <div key={index} className="border rounded-md p-4 bg-white shadow-sm">
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Alert Message: </span>
              <span>{alert.alert_message}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Timestamp: </span>
              <span>{formatTimestamp(alert.timestamp)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Status: </span>
              <div className="flex items-center">
                <span className="mr-2">{getStatusIcon(alert.alert_status)}</span>
                <span className="text-gray-600">{alert.alert_status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>

  );
};

export default DisplayAlert;
