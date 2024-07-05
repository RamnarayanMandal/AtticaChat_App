import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { IoMdDocument, IoMdSend } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5";
import { BASE_URL } from "../../constants";

const EmpMessage = () => {
  const [employees, setEmployees] = useState([]);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const currentUserId = localStorage.getItem("CurrentUserId");
  const currentUserName = "AMMU BABU"; // Assuming the current user is "AMMU BABU"

  // Fetch employees from the API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/employee/`);
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  // Fetch messages from the API based on the selected employee
  useEffect(() => {
    if (employees.length > 0) {
      const selectedEmployee = employees.find((emp) => emp._id === currentUserId);
      if (selectedEmployee) {
        const fetchMessages = async () => {
          try {
            const response = await axios.get(`${BASE_URL}/api/messages`, {
              params: {
                group: selectedEmployee.group,
                grade: selectedEmployee.grade,
              },
            });
            setMessages(response.data.messages);
          } catch (error) {
            console.error("Error fetching messages:", error);
          }
        };

        fetchMessages();

        // Set up polling for new messages
        const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds

        return () => clearInterval(interval); // Clean up the interval
      }
    }
  }, [employees, currentUserId]);

  // Scroll to the bottom of the messages list
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleFileDownload = (url) => {
    window.open(url, "_blank");
  };

  const sendMessage = async () => {
    try {
      const selectedEmployee = employees.find((emp) => emp._id === currentUserId);
      if (!selectedEmployee) {
        console.error("No employee found for current user.");
        return;
      }

      await axios.post(`${BASE_URL}/api/messages`, {
        employeeId: selectedEmployee.name, // Use _id of the employee
        message: newMessage,
        group: selectedEmployee.group,
        grade: selectedEmployee.grade,
      });

      setNewMessage(""); // Clear the input field
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="flex h-screen w-full">
      {/* Chat Section */}
      <div className="flex-1 flex flex-col w-full bg-[#f6f5fb]">
        <div className="text-[#ffffff] bg-[#5443c3] lg:text-2xl text-sm p-4 flex gap-2 items-center justify-between lg:mx-2">
          <IoArrowBack
            className="mr-2 cursor-pointer"
            onClick={() => setMessages([])}
          />
          {employees.length > 0 && (
            <>
              <h2 className="text-xl font-bold">Group: {employees[0].group}</h2>
              <h2 className="text-xl font-bold">Grade: {employees[0].grade}</h2>
            </>
          )}
        </div>

        <div className="flex flex-col flex-1 px-4 pt-4 overflow-y-auto">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex relative break-words whitespace-pre-wrap ${msg.employeeId === currentUserName ? "justify-start" : "justify-end"} mb-2`}
              >
                <div
                  className={`relative ${
                    msg.employeeId === currentUserName
                      ? "bg-white text-[#5443c3] rounded-br-3xl rounded-tl-3xl" 
                      : "bg-[#5443c3] text-white rounded-tr-3xl rounded-bl-3xl"
                  } py-2 px-4 rounded-lg max-w-4xl`}
                >
                  {msg.message && (
                    <p className="text-sm mb-1">
                      <span className="font-bold">{msg.employeeId}:</span> {msg.message}
                    </p>
                  )}
                  {msg.Document && (
                    <div className="text-2xl my-2">
                      <button className="focus:outline-none" onClick={() => handleFileDownload(msg.Document)}>
                        <IoMdDocument />
                      </button>
                    </div>
                  )}
                  {msg.Image && (
                    <div className="my-2">
                      <img src={msg.Image} alt="" className="rounded-lg" />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No messages yet.</p>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-[#f6f5fb] shadow-md">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <input
              type="text"
              className="flex-1 py-2 px-4 rounded-l-lg border-t border-b border-l text-gray-800 border-gray-200 bg-white w-full focus:outline-none placeholder-[#5443c3]"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              className="bg-[#5443c3] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-lg"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
            >
              <IoMdSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpMessage;
