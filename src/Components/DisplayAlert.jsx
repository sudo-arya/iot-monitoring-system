import React, { useState, useEffect } from 'react';

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

  return (
    <div className="xl:w-[calc(100vw-84rem)] w-[calc(100vw-6rem)]">
      <h2 className="text-2xl font-bold mb-4 mt-6">Latest Alerts :-</h2>
      <div className="overflow-x-auto shadow-lg rounded-lg border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Alert Message</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {alerts.slice(0, 6).map((alert, index) => ( // Limiting to show 6 alerts
              <tr key={index} className="hover:bg-gray-100">
                <td className="px-6 py-4 whitespace-normal break-words text-sm font-medium text-gray-900">
                  {alert.alert_message}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                  {formatTimestamp(alert.timestamp)} {/* Formatted timestamp */}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-700">
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
