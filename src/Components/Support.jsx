import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import { SendHorizonal, RefreshCw } from "lucide-react";

const Support = () => {
  // eslint-disable-next-line
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  // eslint-disable-next-line
  const [sensorData, setSensorData] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  // eslint-disable-next-line
  const [toastColor, setToastColor] = useState("bg-green-200");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatFlow, setChatFlow] = useState([]); // Chat flow history
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Flag to track data load
  // eslint-disable-next-line
  const [selectedMessageId, setSelectedMessageId] = useState(null); // Track selected message
  const triggeredMessageIdsRef = React.useRef(new Set());
  // eslint-disable-next-line
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [userComment, setUserComment] = useState("");
  const [viewMode, setViewMode] = useState("open");
  const [chatMode, setChatMode] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState(""); // string instead of array 
  const [tickets, setTickets] = useState([]);



  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load root messages initially
  useEffect(() => {
    fetchMessages(null);
    // eslint-disable-next-line
  }, []);

  const fetchMessages = async (parentId) => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/get-ticket-messages", {
        params: parentId ? { parent_id: parentId } : {},
      });

      const responseParentId = response.data.parent_id ?? null;

      // Check for duplicate based on parent_id AND message ids
      const alreadyExists = chatFlow.some(
        entry => (entry.parent_id ?? null) === responseParentId
      );

      if (!alreadyExists) {
        const newEntry = {
          parent_id: responseParentId,
          messages: response.data.messages,
          messagesShown: false,
        };

        setChatFlow((prev) => [...prev, newEntry]);
      }

      setIsDataLoaded(true);
    } catch (err) {
      console.error("Failed to fetch messages", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const scrollArea = document.getElementById("chat-scroll-area");
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [chatFlow]);

  const handleMessageClick = (message) => {
    // Prevent duplicate user message for auto-triggered non-buttons
    if (message.is_button) {
      // setSelectedMessageId(message.id); // Track the selected message ID
      setSelectedMessages((prev) =>
        prev ? `${prev} > ${message.text}` : message.text
      );
      setChatFlow((prev) => [
        ...prev,
        {
          userMessage: message.text,
        },
      ]);
    }

    if (message.next_level_exists) {
      fetchMessages(message.id);
    } else {
      // setChatFlow((prev) => [
      //   ...prev,
      //   {
      //     botMessage: "Thank you! Our team will follow up if needed.",
      //   },
      // ]);
      setShowCommentInput(true);
    }
  };

  const NonButtonMessage = ({ msg, onAutoTrigger }) => {
    useEffect(() => {
      if (msg.id !== "provide-comment") {
        const alreadyTriggered = triggeredMessageIdsRef.current.has(msg.id);
        if (!alreadyTriggered) {
          triggeredMessageIdsRef.current.add(msg.id);
          onAutoTrigger(msg);
        }
      }
      // eslint-disable-next-line
    }, [msg]);

    return (
      <span className="bg-gray-200 text-black px-4 py-2 rounded-ss-full rounded-e-full inline-block">
        {msg.text}
      </span>
    );
  };


  const sanitizeInput = (input) => {
    return input.replace(/['"\\;]/g, "").trim(); // Basic sanitization
  };

  const handleCommentSubmit = () => {
    const sanitized = sanitizeInput(userComment);
    if (!sanitized) return;

    setChatFlow((prev) => [
      ...prev,
      {
        userMessage: sanitized,
      },
      {
        botMessage: "Thank you! Our team will follow up if needed.",
      },
    ]);

    const updatedSelection = selectedMessages
    ? `${selectedMessages} > ${sanitized}`
    : sanitized;

  setSelectedMessages(updatedSelection);

  // Now delay calling submitTicket using setTimeout to ensure state updates
  setTimeout(() => {
    submitTicket(updatedSelection);
  }, 0); // Run after state update

    setShowCommentInput(false);
    setUserComment("");
  };


  async function submitTicket(selectionPath) {
    const selections = selectionPath.split(" > ");
    if (selections.length < 1) {
      setToastMessage("Please select options and provide a comment.");
      return;
    }

    const ticketMessage = selections[selections.length - 1];
    const ticketIssue = selections.slice(0, -1).join(" > ");

    if (!ticketMessage || !ticketIssue) {
      setToastMessage("Missing required fields.");
      return;
    }

    const payload = {
      user_id: userId,
      ticket_issue: ticketIssue,
      ticket_message: ticketMessage,
    };

    try {
      const response = await fetch('http://localhost:3000/create-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setToastMessage(`Ticket created!`);
        // setToastMessage(`Ticket created! ID: ${result.ticket_id}`);
        setSelectedMessages("");
      } else {
        setToastMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to send ticket:', error);
      setToastMessage('Something went wrong. Please try again.');
    }
  }


  useEffect(() => {
    // Check if userId exists before starting SSE connection
    if (!userId) {
      setError('User ID is required');
      return;
    }

    const eventSource = new EventSource(`http://localhost:5000/get-live-tickets?user_id=${userId}`);

    // Listen for incoming events
    eventSource.onmessage = (event) => {
      try {
        const newTickets = JSON.parse(event.data);
        setTickets(newTickets);  // Update the state with new ticket data
      } catch (err) {
        console.error('Error parsing SSE data', err);
        setError('Error receiving ticket updates');
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE error', err);
      setError('Error connecting to the server');
    };

    // Cleanup when component unmounts or userId changes
    return () => {
      eventSource.close();
    };
  }, [userId]);





  return (
    <div className="w-full h-full flex">
      <div className="w-full h-full flex">
        <Sidebar />
      </div>

      {/* Alert */}
      <div className="absolute xl:w-[calc(100vw-6rem)] h-full my-20 ml-20 flex xl:flex-col flex-col px-">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed xl:right-6 xl:top-2 right-2 top-2 text-xl rounded-xl border p-3 px-6 z-50 ${toastColor}`}
          >
            {toastMessage}
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50 z-40">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-white h-20 w-20 animate-spin"></div>
          </div>
        )}

        {/* Support */}
        <div className="flex flex-col md:flex-row md:space-x-4">
          {/* first column */}
          <div className="md:w-6/12 xl:h-[calc(100vh-6rem)]">
            <div className="xl:w-full w-[calc(100vw-6rem)] mt-">
              <div className="overflow-x-auto p-3 border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg xl:h-[calc(100vh-10rem)] h-[calc(100vh-30rem)] overflow-y-auto">
                {/* open and closed ticket selection */}
                <div className="flex text-center justify-center flex-row xl:flex-row text-white font-semibold text-base xl:mt-6 mt-4">
                  <div
                    className={`flex xl:w-1/3 py-2 xl:px-1 px-4 justify-center items-center xl:hover:bg-gradient-to-r xl:hover:from-gray-500 xl:hover:to-black transition-transform ease-in-out duration-300 cursor-pointer rounded-l-full shadow-2xl ${
                      viewMode === "open" ? "bg-gradient-to-r from-blue-500 to-indigo-500" : "bg-gray-400"
                    }`}
                    onClick={() => setViewMode("open")}
                  >
                    <button>Open Ticket's</button>
                  </div>
                  <div
                    className={`flex xl:w-1/3 py-2 px-1 justify-center xl:hover:bg-gradient-to-r xl:hover:to-gray-500 xl:hover:from-black transition-transform ease-in-out duration-300 cursor-pointer rounded-r-full shadow-2xl ${
                      viewMode === "closed" ? "bg-gradient-to-r from-blue-500 to-indigo-500" : "bg-gray-400"
                    }`}
                    onClick={() => setViewMode("closed")}
                  >
                    <button>Closed Ticket's</button>
                  </div>
                </div>

                {viewMode === "open" && (
                  <div className="mt-6">
                    {/* Create Ticket Card - Full Width */}
                    <div
                      onClick={() => setChatMode("create")}
                      className="cursor-pointer bg-white hover:bg-blue-50 border-2 border-dashed border-blue-400 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3 transition w-full mb-6"
                    >
                      <div className="bg-blue-100 text-blue-600 rounded-full p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span className="text-blue-700 font-semibold text-lg">Create a Ticket</span>
                    </div>

                    {/* Ticket Cards - Grid Layout */}
                    <div className="ticket-dashboard">
                      {error && <div className="error text-red-500 font-semibold">{error}</div>}

                      {/* <h2 className="text-2xl font-semibold text-gray-800 mb-4">Live Tickets for User {userId}</h2> */}

                      {tickets.length === 0 ? (
                        <p className="text-gray-500">No tickets found.</p>
                      ) : (
                        <div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap- mt-6">
                          {tickets
                            .filter(ticket => ticket.ticket_status !== 'resolved' && ticket.ticket_status !== 'rejected')
                            .map((ticket) => (
                              <div
                                key={ticket.ticket_id}
                                className="bg-white shadow-md rounded-xl border border-gray-200 p-4 transition-transform hover:scale-[1.02] aspect-square flex flex-col justify-between text-center h-64"
                              >
                                {/* Top Section: Issue */}
                                <div>
                                  <p className="text-lg font-semibold text-gray-800 mb-2">{ticket.ticket_issue}</p>
                                </div>

                                {/* Bottom Section: Message, ID, Status, Timestamps */}
                                <div className="mt-auto text-sm space-y-1">
                                  {/* Scrollable Message */}
                                  <div className="mb-2 max-h-12 overflow-y-auto px-1">
                                    <p className="text-base text-gray-600 text-center whitespace-pre-wrap">
                                      {ticket.ticket_message}
                                    </p>
                                  </div>

                                  {/* Ticket ID and Status */}
                                  <div className="flex flex-col justify-center items-center gap-1 text-base">
                                    <div className="flex justify-center items-center">
                                      <strong className="text-gray-600 mr-1">Ticket ID:</strong>
                                      <p className="text-gray-900 font-medium">#{ticket.ticket_id}</p>
                                    </div>

                                    <div className="flex justify-center items-center">
                                      <strong className="text-gray-600 mr-1">Status:</strong>
                                      <p className={`font-semibold ${ticket.ticket_status === 'resolved' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {ticket.ticket_status}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Divider */}
                                  <div className="w-full h-px bg-gray-300 my-4" />

                                  {/* Timestamps */}
                                  <div className="flex justify-center items-center text-gray-600">
                                    <strong className="mr-1">Created:</strong>
                                    <p className="text-gray-500 text-xs">{new Date(ticket.created_at).toLocaleString()}</p>
                                  </div>
                                  <div className="flex justify-center items-center text-gray-600">
                                    <strong className="mr-1">Updated:</strong>
                                    <p className="text-gray-500 text-xs">{new Date(ticket.updated_at).toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>
                          ))}

                        </div>




                      )}
                    </div>
                  </div>
                )}

                {viewMode === "closed" && (
                  <div className="mt-6">
                    {/* Ticket Cards - Grid Layout */}
                    <div className="ticket-dashboard">
                      {error && <div className="error text-red-500 font-semibold">{error}</div>}

                      {(() => {
                        const closedTickets = tickets.filter(
                          ticket => ticket.ticket_status === 'resolved' || ticket.ticket_status === 'rejected'
                        );

                        if (closedTickets.length === 0) {
                          return <p className="text-gray-500">No closed tickets found.</p>;
                        }

                        return (
                          <div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 mt-6">
                            {closedTickets.map((ticket) => (
                              <div
                                key={ticket.ticket_id}
                                className="bg-white shadow-md rounded-xl border border-gray-200 p-4 transition-transform hover:scale-[1.02] aspect-square flex flex-col justify-between text-center h-64"
                              >
                                {/* Top Section: Issue */}
                                <div>
                                  <p className="text-lg font-semibold text-gray-800 mb-2">{ticket.ticket_issue}</p>
                                </div>

                                {/* Bottom Section: Message, ID, Status, Timestamps */}
                                <div className="mt-auto text-sm space-y-1">
                                  {/* Scrollable Message */}
                                  <div className="mb-6 max-h-12 overflow-y-auto px-1">
                                    <p className="text-base text-gray-600 text-center whitespace-pre-wrap">
                                      {ticket.ticket_message}
                                    </p>
                                  </div>

                                  {/* Ticket ID and Status */}
                                  <div className="flex flex-col justify-center items-center gap-1 text-base">
                                    <div className="flex justify-center items-center">
                                      <strong className="text-gray-600 mr-1">Ticket ID:</strong>
                                      <p className="text-gray-900 font-medium">#{ticket.ticket_id}</p>
                                    </div>

                                    <div className="flex justify-center items-center">
                                      <strong className="text-gray-600 mr-1">Status:</strong>
                                      <p className={`font-semibold ${ticket.ticket_status === 'resolved' ? 'text-green-600' : 'text-red-600'}`}>
                                        {ticket.ticket_status}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Divider */}
                                  <div className="w-full h-px bg-gray-300 my-4" />

                                  {/* Timestamps */}
                                  <div className="flex justify-center items-center text-gray-600">
                                    <strong className="mr-1">Created:</strong>
                                    <p className="text-gray-500 text-xs">{new Date(ticket.created_at).toLocaleString()}</p>
                                  </div>
                                  <div className="flex justify-center items-center text-gray-600">
                                    <strong className="mr-1">Updated:</strong>
                                    <p className="text-gray-500 text-xs">{new Date(ticket.updated_at).toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>

          {/* second column */}
          <div className="md:w-6/12 w-[calc(100vw-6rem)] xl:h-[calc(100vh-10rem)] xl:mt-0 mt-6 h-[calc(100vh-20rem)] flex flex-col overflow-y-auto overflow-x-hidden p- border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg">

            { chatMode === null &&(
              <div className="w-full h-full bg-gray-200 text-gray-900 text-center justify-center items-center flex">
                Please select create a ticket or choose open/closed ticket to see its details
              </div>
            )}

            {chatMode==='create' && (
              <>
                <div className="bg-white px-4 py-3 border-b border-gray-300">
              <label className="block text-3xl text-center font-semibold text-black">
                Create a Ticket
              </label>
              {/* <div className="w-4/4 flex mx-auto h-px bg-gray-300 mb-4" /> */}

            </div>
            {/* Message Area */}
            <div
              id="chat-scroll-area"
              className="flex-1 overflow-y-auto overflow-x-hidden p-3 "
            >
              {/* Render only when data is fully loaded */}
              {isDataLoaded && (
                <div className="w-full mx-auto p-4">
                  {/* <h2 className="text-xl font-bold mb-4">💬 Ticket Support Bot</h2> */}

                  <div className="space-y-6">
                    {chatFlow.map((entry, index) => {
                      if (index === 0 && entry.parent_id === null) return null;
                      const hasButton = entry.messages?.some((msg) => msg.is_button);

                      return (
                        <div key={index} className="space-y-2">
                          {entry.userMessage && (
                            <div className="text-right">
                              <span className="bg-blue-500 text-white px-4 py-2 rounded-se-full rounded-s-full inline-block">
                                {entry.userMessage}
                              </span>
                            </div>
                          )}
                          {/* {entry.userMessage} */}
                          {/* {selectedMessages} */}

                          {entry.messages && !entry.messagesShown && (
                            <div className="space-y-2">
                              {hasButton && (
                                <div className="text-left">
                                  <span className="bg-gray-100 text-sm text-gray-600 px-3 py-1 rounded-full inline-block">
                                    Please select an option :
                                  </span>
                                </div>
                              )}
                              <div className="flex flex-wrap gap-2">
                                {entry.messages.map((msg) => {
                                  if (msg.is_button && msg.id === selectedMessageId) return null;
                                  return (
                                    <div key={msg.id}>
                                      {msg.is_button ? (
                                        <button
                                          onClick={() => handleMessageClick(msg)}
                                          className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium px-4 py-2 rounded-full transition"
                                        >
                                          {msg.text}
                                        </button>
                                      ) : (
                                        <NonButtonMessage msg={msg} onAutoTrigger={handleMessageClick} />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              {/* Show guidance message when input becomes enabled */}
                              {chatFlow.length &&
                              !chatFlow[chatFlow.length - 1]?.messages?.some((msg) => msg.next_level_exists) &&
                              !chatFlow.some((entry) => entry.botMessage === "Thank you! Our team will follow up if needed.") && (
                                // <div className="bg-white px-4 py-2 border-t border-gray-200 text-left">
                                  <NonButtonMessage msg={{ id: "provide-comment", text: "Provide your comment" }} onAutoTrigger={() => {}} />
                                // </div>
                              )}

                            </div>
                          )}

                          {entry.botMessage && (
                            <div className="text-left">
                              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-e-full rounded-ss-full inline-block">
                                {entry.botMessage}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>



            {/* Input Area - Always at Bottom */}
            <div className="bg-white px-4 py-3 border-t border-gray-300">
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                {/* Send a Message */}
              </label>
              <div className="flex items-center gap-2">
                {/* Refresh Button - Page Refresh */}
                <button
                  onClick={() => window.location.reload()} // Refresh the page
                  className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition text-red-600"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCommentSubmit();  // Trigger the comment submission
                    }
                  }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2"
                  placeholder="Type here..."
                  disabled={
                    chatFlow.length === 0 ||
                    chatFlow[chatFlow.length - 1]?.messages?.some((msg) => msg.next_level_exists) ||
                    chatFlow.some((entry) => entry.botMessage === "Thank you! Our team will follow up if needed.")
                  }
                />

                {/* Send Button */}
                <button
                  onClick={handleCommentSubmit}  // Trigger the comment submission
                  className={`p-2 rounded-full transition ${
                    chatFlow.length &&
                    !chatFlow[chatFlow.length - 1]?.messages?.some((msg) => msg.next_level_exists) &&
                    !chatFlow.some((entry) => entry.botMessage === "Thank you! Our team will follow up if needed.")
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={
                    chatFlow.length === 0 ||
                    chatFlow[chatFlow.length - 1]?.messages?.some((msg) => msg.next_level_exists) ||
                    chatFlow.some((entry) => entry.botMessage === "Thank you! Our team will follow up if needed.")
                  }
                >
                  <SendHorizonal className="w-5 h-5" />
                </button>
              </div>
            </div>
              </>
            )}


          </div>

        </div>
      </div>
    </div>
  );
};

export default Support;
