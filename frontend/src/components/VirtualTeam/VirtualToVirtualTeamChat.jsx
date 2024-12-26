import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { AiOutlineSearch, AiOutlineDown } from "react-icons/ai";
import { IoIosDocument } from "react-icons/io";
import { BASE_URL } from "../../constants";
import ReplyModel from "../ReplyModel";
import AllUsersFileModel from "../AllUsers/AllUsersFileModel";
import ForwardModalAllUsers from "../AllUsers/ForwardModalAllUsers";
import Sidebar from "../AllUsers/UserSidebar";
import { FaArrowLeft, FaCamera } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import Camera from "../Camera/Camera";
import ScrollingNavbar from "../admin/ScrollingNavbar";
import EditModel from "../utility/EditModel";
import ScrollToBottomButton from "../utility/ScrollToBottomButton";
import { FaVideo } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import GPSTracker from "../manager/Gps";

function VirtualToVirtualTeamChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const loggedInUserId = localStorage.getItem("CurrentUserId");
  const [recipient, setRecipient] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [sender, setSender] = useState(loggedInUserId);
  const [attachment, setAttachment] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const [unreadUsers, setUnreadUsers] = useState([]);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [imageForEditing, setImageForEditing] = useState("");

  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  const [newCountMessage, setNewCountMessage] = useState(() =>
    JSON.parse(localStorage.getItem("newCountMessage") || "[]")
  );
  const [lastUserMessageCounts, setLastUserMessageCounts] = useState(() =>
    JSON.parse(localStorage.getItem("lastUserMessageCounts") || "[]")
  );
  const [currentCountMessage, setCurrentCountMessage] = useState(() =>
    JSON.parse(localStorage.getItem("currentCountMessage") || "[]")
  );

  const navigate = useNavigate();

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLastUserMessageCounts(
        JSON.parse(localStorage.getItem("lastUserMessageCounts") || "[]")
      );
      setNewCountMessage(
        JSON.parse(localStorage.getItem("newCountMessage") || "[]")
      );
      setCurrentCountMessage(
        JSON.parse(localStorage.getItem("currentCountMessage") || "[]")
      );
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Clean up on component unmount
  }, []);

  const handleClick = (id, name) => {
    // Get the current count message and last user message counts from local storage
    const currentCountMessage = JSON.parse(
      localStorage.getItem("currentCountMessage") || "[]"
    );
    const lastUserMessageCounts = JSON.parse(
      localStorage.getItem("lastUserMessageCounts") || "[]"
    );

    // Update lastUserMessageCounts with currentCountMessage for the clicked user
    const updatedLastUserMessageCounts = lastUserMessageCounts.map((user) => {
      if (user.userId === id) {
        return {
          userId: user.userId,
          count: currentCountMessage.find((u) => u.userId === id)?.count || 0,
        };
      }
      return user;
    });

    // If the user is not in lastUserMessageCounts, add them
    if (!updatedLastUserMessageCounts.some((user) => user.userId === id)) {
      const currentCount =
        currentCountMessage.find((u) => u.userId === id)?.count || 0;
      updatedLastUserMessageCounts.push({ userId: id, count: currentCount });
    }

    // Store the updated lastUserMessageCounts in local storage
    localStorage.setItem(
      "lastUserMessageCounts",
      JSON.stringify(updatedLastUserMessageCounts)
    );

    // Set the state and fetch messages
    setSender(loggedInUserId);
    setRecipient(id);
    setRecipientName(name);
    fetchMessages(loggedInUserId, id);
    setShowChat(true);
  };

  // Function to get the count for a user
  const getCountForUser = (userId) => {
    const newCountMessage = JSON.parse(
      localStorage.getItem("newCountMessage") || "[]"
    );
    const user = newCountMessage.find((item) => item.userId === userId);
    return user ? user.count : 0;
  };

  // Function to get the unread count for a user
  const getUnreadCountForUser = (userId) => {
    const currentCountMessage = JSON.parse(
      localStorage.getItem("currentCountMessage") || "[]"
    );
    const lastUserMessageCounts = JSON.parse(
      localStorage.getItem("lastUserMessageCounts") || "[]"
    );

    const currentCount =
      currentCountMessage.find((user) => user.userId === userId)?.count || 0;
    const lastCount =
      lastUserMessageCounts.find((user) => user.userId === userId)?.count || 0;

    return currentCount - lastCount;
  };

  const fetchMessages = (sender, recipient) => {
    axios
      .get(`${BASE_URL}/api/getmessages/${recipient}/${sender}`)
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/allUser/getAllVirtualTeam`)
      .then((response) => {
        const filteredUsers = response.data.filter(
          (user) => user._id !== loggedInUserId
        );
        setUsers(filteredUsers);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [loggedInUserId]);

  useEffect(() => {
    const intervalId = setInterval(
      () => fetchMessages(sender, recipient),
      2000
    );
    return () => clearInterval(intervalId);
  }, [sender, recipient]);

  const handleSendMessage = () => {
    if (!newMessage.trim() && !attachment) return;

    const messageData = {
      sender: loggedInUserId,
      recipient: recipient,
      senderName: userDetails.name,
      text: newMessage,
      image: attachment?.type.startsWith("image/") ? attachment.url : null,
      document: attachment?.type.startsWith("application/")
        ? attachment.url
        : null,
      video: attachment?.type.startsWith("video/") ? attachment.url : null,
    };

    axios
      .post(`${BASE_URL}/api/postmessages`, messageData)
      .then((response) => {
        setMessages([...messages, response.data.data]);
        setNewMessage("");
        setAttachment(null);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        url: reader.result,
        type: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = (imageSrc) => {
    setAttachment({ url: imageSrc, type: "image/jpeg" });
    setShowCamera(false);
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
  };

  useEffect(() => {
    if (users.length > 0) {
      const fetchUnreadMessages = async () => {
        try {
          const unreadUsersData = await Promise.all(
            users.map(async (user) => {
              const response = await axios.get(
                `${BASE_URL}/api/mark-messages-read/${user._id}`
              );
              return { userId: user._id, data: response.data };
            })
          );
          setUnreadUsers(unreadUsersData.filter((u) => u.data.length > 0));
        } catch (error) {
          console.error(error);
        }
      };
      fetchUnreadMessages();
      const intervalId = setInterval(fetchUnreadMessages, 3 * 1000);
      return () => clearInterval(intervalId);
    }
  }, [users]);

  const handleBackToEmployees = () => {
    setShowChat(false);
    setRecipient("");
    setRecipientName("");
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleHover = (index) => {
    setHoveredMessage(index);
  };

  const handleDropdownClick = (index) => {
    setShowDropdown(showDropdown === index ? null : index);
  };

  const handleReply = (message) => {
    setReplyMessage(message);
    setShowReplyModal(true);
  };

  const handleForward = (message) => {
    console.log(message);
    setForwardMessage(message);
    setShowForwardModal(true);
    setShowDropdown(null);
  };

  const handleForwardMessage = () => {
    setShowForwardModal(false);
    setShowDropdown(null);
  };

  const handleCancelForward = () => {
    setShowForwardModal(false);
  };
  const handleModalClose = () => {
    setImageForEditing(""); // Close the modal and reset selected image
    setShowImageEditor(false); // Close edit modal
  };
  const handleEditImage = (message) => {
    setShowImageEditor(true);
    setImageForEditing(message.content.image || message.content.camera);
    // console.log("*******",imageForEditing)
  };

  const handleDelete = (message) => {
    axios
      .delete(`${BASE_URL}/api/delmessages/${message._id}`)
      .then((response) => {
        setMessages(messages.filter((m) => m._id !== message._id));
        setShowDropdown("null");
      })

      .catch((error) => {
        console.error(error);
      });
  };

  const sortedUsers = users
    .filter((user) =>
      user.name.toLowerCase().includes(userSearchQuery.toLowerCase())
    )
    .map((user) => ({
      ...user,
      unreadCount: getUnreadCountForUser(user._id),
    }))
    .sort((a, b) => b.unreadCount - a.unreadCount);

  const handleVideoCall = () => {
    navigate(`/videoCall/${recipient}`);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden ">
      <GPSTracker managerId={loggedInUserId} path={"te-location"} />
      {!showChat && (
        <span className="mt-20">
          <ScrollingNavbar />
        </span>
      )}
      <Sidebar value="VIRTUAL" />
      {showChat ? (
        <div className="w-full mb-20 lg:mb-0 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between p-4 lg:bg-[#5443c3] lg:text-white text-[#5443c3] bg-white sticky top-0 z-10 border border-[#5443c3]">
            <button
              onClick={handleBackToEmployees}
              className="lg:text-2xl p-2 rounded-md lg:bg-[#5443c3] lg:text-white text-[#5443c3] bg-white"
            >
              <FaArrowLeft />
            </button>

            <h1 className="lg:text-2xl text-xl font-bold">{recipientName}</h1>
            <FaVideo className="text-2xl" onClick={handleVideoCall} />
          </div>
          <div className="flex-grow overflow-y-auto p-4 flex flex-col bg-[#eef2fa] mb-20 lg:mb-0 h-screen">
            {messages.map((message, index) => (
              <div
                key={message._id}
                className={`mb-4 p-4 rounded-lg max-w-[50%] relative break-words whitespace-pre-wrap ${
                  message.sender === loggedInUserId
                    ? " self-end bg-[#9184e9] text-white border-2 border-[#5443c3] rounded-tr-3xl rounded-bl-3xl"
                    : "self-start bg-[#ffffff] text-[#5443c3] border-2 border-[#5443c3] rounded-tl-3xl rounded-br-3xl"
                }`}
                onMouseEnter={() => handleHover(index)}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                {message.content && message.content.originalMessage && (
                  <div className="mb-2">
                    <span className="bg-green-300 px-2 py-1 text-xs text-white rounded">
                      {message.content.originalMessage}
                    </span>
                  </div>
                )}
                {message.content && message.content.text && (
                  <p className="font-bold lg:text-base text-xs ">
                    {message.content.text}
                  </p>
                )}
                {message.content && message.content.image && (
                  <img
                    src={message.content.image}
                    alt="Image"
                    className="rounded-lg lg:h-96 lg:w-72 md:h-96 md:w-64 h-40 w-32"
                  />
                )}
                {message.content && message.content.camera && (
                  <img
                    src={message.content.camera}
                    alt="Image"
                    className="rounded-lg lg:h-96 lg:w-72 md:h-96 md:w-64 h-40 w-32"
                  />
                )}

                {message.content && message.content.camera && (
                  <img
                    src={message.content.camera}
                    alt="Image"
                    className="rounded-lg lg:h-96 lg:w-72 md:h-96 md:w-64 h-40 w-32"
                  />
                )}
                {message.content && message.content.document && (
                  <a
                    href={message.content.document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:underline"
                  >
                    <IoIosDocument className="text-9xl" />
                  </a>
                )}
                {message.content && message.content.video && (
                  <video controls className="max-w-xs">
                    <source src={message.content.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
                <span className="text-xs text-black">
                  {new Date(message.createdAt).toLocaleString()}
                </span>

                {hoveredMessage === index && (
                  <AiOutlineDown
                    className="absolute top-2 right-2 cursor-pointer"
                    onClick={() => handleDropdownClick(index)}
                  />
                )}

                {showDropdown === index && (
                  <div className="absolute top-8 right-2 bg-white border rounded shadow-lg z-10">
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleReply(message)}
                    >
                      Reply
                    </button>
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleForward(message)}
                    >
                      Forward
                    </button>
                    {(message.content.image || message.content.camera) && (
                      <button
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleEditImage(message)}
                      >
                        Edit Image
                      </button>
                    )}
                    {message.sender === loggedInUserId && (
                      <button
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleDelete(message)}
                      >
                        delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
            {showCamera && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                <Camera
                  onCapture={handleCapture}
                  onClose={handleCloseCamera}
                  loggedInUserId={loggedInUserId}
                  recipient={recipient}
                />
              </div>
            )}
          </div>
          <div className="flex items-center p-4 bg-white border-t border-gray-200 fixed bottom-0 w-full lg:static">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow p-2 border-2 rounded-lg mr-2 border-[#5443c3]"
            />
            <input
              type="file"
              onChange={(e) => handleFileUpload(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />
            <button
              onClick={() => setShowCamera(true)}
              className="mr-2 text-xl"
            >
              <FaCamera />
            </button>

            <button
              onClick={handleSendMessage}
              className="bg-[#5443c3] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              <IoMdSend />
            </button>
            <AllUsersFileModel
              sender={loggedInUserId}
              recipient={recipient}
              senderName={userDetails.name}
            />
          </div>
          <ScrollToBottomButton messagesEndRef={messagesEndRef} />
        </div>
      ) : (
        <div className="w-full lg:w-1/4 bg-white p-4 overflow-y-auto sticky lg:mt-20 border border-purple-100 top-0  z-10">
          <h1 className="lg:text-2xl text-xl font-bold mb-4 text-[#5443c3] lg:m-4">
            All Employees
          </h1>
          <div className=" relative flex items-center mb-5">
            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full h-10 p-2 text-base text-gray-700 rounded-xl pl-10 bg-white border-2 border-[#5443c3] shadow-lg"
            />
            <AiOutlineSearch className="absolute top-3 left-3 text-gray-500 text-2xl" />
          </div>
          <ul>
            {sortedUsers.map((user) => (
              <li
                key={user._id}
                className={`p-4 mb-2 rounded-lg cursor-pointer flex justify-between text-[#5443c3] text-sm font-medium ${
                  unreadUsers.some(
                    (unreadUser) => unreadUser.userId === user._id
                  )
                    ? "bg-blue-200"
                    : "bg-gray-200"
                } ${recipient === user._id ? "bg-green-200" : ""}`}
                onClick={() => handleClick(user._id, user.name)}
              >
                <span>{user.name}</span>
                <span>
                  {user.unreadCount > 0 && (
                    <span className="text-red-500 font-bold">
                      {user.unreadCount}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {showForwardModal && (
        <ForwardModalAllUsers
          users={users}
          forwardMessage={forwardMessage}
          onForward={handleForwardMessage}
          onCancel={handleCancelForward}
          senderName={userDetails.name}
        />
      )}

      {replyMessage && (
        <ReplyModel
          message={replyMessage}
          sender={loggedInUserId}
          recipient={recipient}
          isVisible={showReplyModal}
          senderName={userDetails.name}
          onClose={() => setShowReplyModal(false)}
        />
      )}
      {showImageEditor && (
        <EditModel
          imageUrl={imageForEditing}
          handleModalClose={handleModalClose}
          recipient={recipient}
        />
      )}
    </div>
  );
}

export default VirtualToVirtualTeamChat;
