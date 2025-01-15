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
      <div className="overflow-x-auto shadow-md rounded-lg border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 overflow-y-auto h-[calc(100vh-40rem)]">
  <table className="min-w-full divide-y divide-gray-200 bg-white  ">
    <thead className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white ">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
          Alert Message
        </th>
        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
          Timestamp
        </th>
        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
          Status
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {alerts.map((alert, index) => (
        <tr key={index} className="hover:bg-gray-100">
          <td className="px-4 py-3 text-sm font-medium text-gray-800 whitespace-nowrap">
            {alert.alert_message}
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600">
            {formatTimestamp(alert.timestamp)}
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600 flex items-center justify-start">
            <span className="mr-2">{getStatusIcon(alert.alert_status)}</span>
            {alert.alert_status}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  );
};

export default DisplayAlert;
