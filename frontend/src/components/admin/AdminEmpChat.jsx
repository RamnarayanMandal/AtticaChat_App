import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { AiOutlineSearch, AiOutlineDown } from "react-icons/ai";
import { useSound } from "use-sound";
import notificationSound from "../../assests/sound.wav";
import { BASE_URL } from "../../constants";
import Sidebar from "./Sidebar";
import { FaArrowLeft, FaCamera } from "react-icons/fa";
import { IoIosDocument, IoMdSend } from "react-icons/io";
import ForwardModalAllUsers from "../AllUsers/ForwardModalAllUsers";
import AllUsersFileModel from "../AllUsers/AllUsersFileModel";
import ReplyModel from "../ReplyModel";
import FetchAllEmpDeteails from "./Pages/FetchAllEmpDeteails";
import ShowPopSms from "./Pages/ShowPopSms";
import { FaLocationDot } from "react-icons/fa6";
import GoogleMapsuper from "../SuperAdmin/GoogleMapsuper";
import AdminFordWardModel from "./Pages/AdminFordWardModel";
import Camera from "../Camera/Camera";
import EditModel from "../utility/EditModel";
import ScrollToBottomButton from "../utility/ScrollToBottomButton";
const senderName = localStorage.getItem("email");
import { FaVideo } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import GPSTracker from "../manager/Gps";

function AdminEmpChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const loggedInUserId = localStorage.getItem("CurrentUserId");
  const [recipient, setRecipient] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [attachment, setAttachment] = useState(null);
  const messagesEndRef = useRef(null);
  const [unreadUsers, setUnreadUsers] = useState([]);
  const [selectedSenderName, setSelectedSenderName] = useState("");
  const [playNotificationSound] = useSound(notificationSound);
  const [showDropdown, setShowDropdown] = useState(null);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [isChatSelected, setIsChatSelected] = useState(false);
  const [selectedChatUserId, setSelectedChatUserId] = useState("");
  const [replyMessage, setReplyMessage] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [imageForEditing, setImageForEditing] = useState("");

  const navagite = useNavigate();

  // Debugging logs
  console.log("location: ", location);
  console.log("selectedSenderName: ", selectedSenderName);

  const handleClick = (id, name) => {
    setRecipient(id);
    setRecipientName(name);
    setIsChatSelected(true);
    setSelectedChatUserId(id);
    fetchMessages(loggedInUserId, id);
  };

  const fetchMessages = async (sender, recipient) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/empadminsender/getadminmessages/${recipient}/${sender}`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/employeeRegistration/`)
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
      () => fetchMessages(loggedInUserId, recipient),
      2000
    );
    return () => clearInterval(intervalId);
  }, [recipient]);

  const handleSendMessage = () => {
    if (!newMessage.trim() && !attachment) return;

    const messageData = {
      sender: loggedInUserId,
      recipient,
      senderName: localStorage.getItem("AdminId"),
      text: newMessage,
      image: attachment?.type.startsWith("image/") ? attachment.url : null,
      document: attachment?.type.startsWith("application/")
        ? attachment.url
        : null,
      video: attachment?.type.startsWith("video/") ? attachment.url : null,
    };

    axios
      .post(`${BASE_URL}/api/empadminsender/createMessage`, messageData)
      .then((response) => {
        setMessages([...messages, response.data.data]);
        setNewMessage("");
        setAttachment(null);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    if (users.length > 0) {
      const fetchUnreadMessages = async () => {
        try {
          const unreadUsersData = await Promise.all(
            users.map(async (user) => {
              const response = await axios.get(
                `${BASE_URL}/api/empadminsender/mark-messages-read/${user._id}`
              );
              return { userId: user._id, data: response.data };
            })
          );
          setUnreadUsers(unreadUsersData);
        } catch (error) {
          console.error(error);
        }
      };
    }
  }, [users]);

  const handleHover = (index) => {
    setHoveredMessage(index);
  };

  const handleLeave = () => {
    setHoveredMessage(null);
  };

  const handleDropdownClick = (index) => {
    setShowDropdown(showDropdown === index ? null : index);
  };

  const handleReply = (message) => {
    setReplyMessage(message);
    setShowReplyModal(true);
  };

  const handleForward = (message) => {
    setForwardMessage(message);
    setShowForwardModal(true);
    setShowDropdown(null);
  };

  const handleCancelForward = () => {
    setShowForwardModal(false);
    setForwardMessage(null);
    setShowDropdown(null);
  };

  const handleConfirmForward = () => {
    setShowForwardModal(false);
    setForwardMessage(null);
    setShowDropdown(null);
  };

  const handleBackToUserList = () => {
    setIsChatSelected(false);
    setSelectedChatUserId("");
    setRecipient("");
    setRecipientName("");
    setMessages([]);
  };

  const handleLocationClick = (latitude, longitude) => {
    let loc = [{ latitude, longitude }];
    setLocation(loc);
    setShowMap(true);
  };

  const handleCapture = (imageSrc) => {
    setAttachment({ url: imageSrc, type: "image/jpeg" });
    setShowCamera(false);
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
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
      .delete(`${BASE_URL}/api/empadminsender/delmessages/${message._id}`)
      .then((response) => {
        setMessages(messages.filter((m) => m._id !== message._id));
        setShowDropdown("null");
      })

      .catch((error) => {
        console.error(error);
      });
  };

  const handleVideoCall = () => {
    navagite(`/videoCall/${recipient}`);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen relative">
      <GPSTracker managerId={loggedInUserId} path={"te-location"} />
      <Sidebar />

      <div className="flex-1 flex flex-col lg:flex-row   ">
        <div
          className={`flex flex-col bg-white text-black p-4  w-full border shadow shadow-blue-500/65 lg:w-1/4 ${
            isChatSelected ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="flex items-center justify-between lg:mb-4">
            <span className="lg:text-2xl md:text-2xl sm:text-xl font-bold mb-4 text-[#5443c3]">
              Employee Chat
            </span>
          </div>
          <FetchAllEmpDeteails handleClick={handleClick} />
        </div>

        {isChatSelected && (
          <div className="flex-1 flex flex-col justify-between bg-[#f6f5fb]">
            <div className="text-[#5443c3]  sm:text-white sm:bg-[#5443c3] md:text-white md:bg-[#5443c3] bg-white p-2 flex flex-row items-center justify-between">
              {isChatSelected && (
                <div className="text-2xl p-4 flex gap-2 items-center justify-between">
                  <button
                    className="w-20 text-[#5443c3] sm:text-white md:text-white text-2xl mt-2"
                    onClick={handleBackToUserList}
                  >
                    <FaArrowLeft />
                  </button>
                </div>
              )}
              <h2 className="text-2xl font-semibold">{recipientName}</h2>
              <FaVideo className="text-2xl" onClick={handleVideoCall} />
            </div>

            <div
              className="flex flex-col flex-1 px-4 pt-4 relative overflow-y-auto "
              style={{ maxHeight: "80vh" }}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex  relative break-words whitespace-pre-wrap ${
                    message.sender === loggedInUserId
                      ? "justify-end"
                      : "justify-start "
                  } mb-2`}
                  onMouseEnter={() => handleHover(index)}
                  onMouseLeave={() => handleLeave()}
                >
                  <div
                    className={`relative lg:text-3xl md:text-xl text-sm font-bold  ${
                      message.sender === loggedInUserId
                        ? " self-end bg-[#e1dff3] text-[#5443c3] border border-[#5443c3] rounded-tr-3xl rounded-bl-3xl"
                        : " self-start bg-[#ffffff] text-[#5443c3] border border-[#5443c3] rounded-tl-3xl rounded-br-3xl"
                    } py-2 px-4 rounded-lg lg:max-w-2xl max-w-[50%]`}
                  >
                    {message.content && message.content.originalMessage && (
                      <div className="mb-2">
                        <span className="bg-green-300 px-2 py-1 text-xs text-black rounded">
                          {message.content.originalMessage}
                        </span>
                      </div>
                    )}
                    {message.content && message.content.text && (
                      <p className="text-sm">{message.content.text}</p>
                    )}
                    {message.content && message.content.image && (
                      <img
                        src={message.content.image}
                        alt="Image"
                        className="rounded-lg lg:h-96 lg:w-72 md:h-96 md:w-64 h-40 w-32"
                      />
                    )}
                    {message.content && message.content.imageWithLocation && (
                      <>
                        <img
                          src={
                            JSON.parse(message.content.imageWithLocation).url
                          }
                          alt="Image"
                          className="max-w-xs rounded"
                        />
                      </>
                    )}
                    {message.content && message.content.imageWithLocation && (
                      <div
                        className="text-5xl flex justify-center content-center items-center my-4 cursor-pointer"
                        onClick={() =>
                          handleLocationClick(
                            JSON.parse(message.content.imageWithLocation)
                              .latitude,
                            JSON.parse(message.content.imageWithLocation)
                              .longitude
                          )
                        }
                      >
                        <FaLocationDot />
                      </div>
                    )}
                    {message.content && message.content.document && (
                      <a
                        href={message.content.document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:underline"
                      >
                        <IoIosDocument className="text-9xl" />
                      </a>
                    )}
                    {message.content && message.content.camera && (
                      <img
                        src={message.content.camera}
                        alt="Image"
                        className="rounded-lg lg:h-96 lg:w-72 md:h-96 md:w-64 h-40 w-32"
                      />
                    )}
                    {message.content && message.content.video && (
                      <video
                        controls
                        className="max-w-xs text-orange-600 rounded-lg lg:h-96 lg:w-72 md:h-96 md:w-64 h-40 w-32"
                      >
                        <source src={message.content.video} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                    <span className="text-xs font-base  text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                    {hoveredMessage === index && (
                      <>
                        <AiOutlineDown
                          className="absolute top-2 right-2 cursor-pointer font-bold"
                          onClick={() => handleDropdownClick(index)}
                        />
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
                            {(message.content.image ||
                              message.content.camera) && (
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
                      </>
                    )}
                  </div>
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
                    admin={"admin"}
                  />
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-center items-center">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-grow p-2 border rounded-lg mr-2 border-[#5443c3]"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowCamera(true)}
                  className="mr-2 text-xl"
                >
                  <FaCamera />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    className="bg-[#5443c3] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
                    onClick={handleSendMessage}
                  >
                    <IoMdSend />
                  </button>
                  <AllUsersFileModel
                    sender={loggedInUserId}
                    recipient={recipient}
                    admin="admin"
                    senderName={senderName}
                    className="bg-[#5443c3] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
                  />
                </div>
                <ScrollToBottomButton messagesEndRef={messagesEndRef} />
              </div>
            </div>
          </div>
        )}
      </div>
      {showForwardModal && (
        <AdminFordWardModel
          users={users}
          forwardMessage={forwardMessage}
          onForward={handleConfirmForward}
          onCancel={handleCancelForward}
          value="admin"
        />
      )}
      {replyMessage && (
        <ReplyModel
          message={replyMessage}
          sender={loggedInUserId}
          recipient={recipient}
          isVisible={showReplyModal}
          onClose={() => setShowReplyModal(false)}
          value={"Admin"}
        />
      )}
      {showMap && location.length >= 1 && (
        <div className="w-full lg:w-1/2 p-4">
          <GoogleMapsuper
            locations={location}
            onClose={() => setShowMap(false)}
            className="w-full"
          />
        </div>
      )}
      {showImageEditor && (
        <EditModel
          imageUrl={imageForEditing}
          handleModalClose={handleModalClose}
          recipient={recipient}
          admin="admin"
        />
      )}
    </div>
  );
}

export default AdminEmpChat;
