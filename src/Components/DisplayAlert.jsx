import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle } from 'react-icons/fa'; // Import icons for status

const DisplayAlert = ({ userId }) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!userId) return;

    // Clear previous alerts when connecting to a new SSE connection
    setAlerts([]);

    const eventSource = new EventSource(`http://localhost:5000/get-alerts-for-user?user_id=${userId}`);

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
  }, [userId]);

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
    <div className="xl:w-[calc(100vw-84rem)] w-[calc(100vw-6rem)] p-">
      <h2 className="text-3xl font-semibold mb-4 mt-4 text-gray-800">Latest Alerts :-</h2>
      <div className="overflow-y-auto xl:h-[calc(100vh-40rem)] h-[calc(100vh-24rem)] shadow-lg rounded-lg border border-gray-300 ">
        {/* Fixed header */}
        <div className="sticky top-0 p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-between z-10">
          <div className="flex-1 text-left font-medium">Alert Message</div>
          <div className="w-[120px] text-center font-medium">Timestamp</div>
          <div className="w-[100px] text-center font-medium">Status</div>
        </div>
        <div className="">
          {alerts.map((alert, index) => ( // Limiting to show 6 alerts at once
            <div key={index} className="flex items-start justify-between p-4 bg-white hover:bg-gray-50 transition duration-300 border border-gray-200">
              <div className="flex-1 xl:max-w-[250px] max-w-96">
                <p className="text-sm font-medium text-gray-900 break-words">{alert.alert_message}</p>
              </div>
              <div className="w-[120px] text-center text-sm text-gray-700">
                {formatTimestamp(alert.timestamp)}
              </div>
              <div className="w-[100px] text-center flex items-center justify-start text-sm text-gray-700">
                <span className="mr-2">{getStatusIcon(alert.alert_status)}</span>
                {alert.alert_status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DisplayAlert;
