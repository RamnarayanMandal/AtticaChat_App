import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { AiOutlineSearch, AiOutlineDown } from "react-icons/ai";
import { Link } from "react-router-dom";
import { IoIosDocument } from "react-icons/io";
import { FaImage, FaCamera } from "react-icons/fa";
import { BASE_URL } from "../../constants";
import { FaArrowLeft } from "react-icons/fa";
import ForwardMsgAllUsersToAdmin from "../AllUsers/ForwardMsgAllUsersToAdmin";
import Sidebar from "../AllUsers/UserSidebar";
import ReplyModel from "../ReplyModel"; //--------------->
import AllUsersFileModel from "../AllUsers/AllUsersFileModel";
import { IoMdSend } from "react-icons/io";
import Camera from "../Camera/Camera";
import EditModel from "../utility/EditModel";
import ScrollToBottomButton from "../utility/ScrollToBottomButton";
import ScrollingNavbar from "../admin/ScrollingNavbar";
import { FaVideo } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import GPSTracker from "../manager/Gps";

function SoftwareToAdminChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const loggedInUserId = localStorage.getItem("CurrentUserId");
  const [recipient, setRecipient] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const [admins, setAdmins] = useState([]);
  const [unreadUsers, setUnreadUsers] = useState([]);
  const [unreadUsersAdmin, setUnreadUsersAdmin] = useState([]);
  const [showMessages, setShowMessages] = useState({});
  const [showDropdown, setShowDropdown] = useState(null);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [replyMessage, setReplyMessage] = useState(null); //--------------->
  const [showReplyModal, setShowReplyModal] = useState(false); //--------------->
  const [isChatSelected, setIsChatSelected] = useState(false);
  const [selectedChatUserId, setSelectedChatUserId] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [imageForEditing, setImageForEditing] = useState("");
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));

  // Function to handle click on admin or employee to initiate chat
  const [newAdminCountMessage, setNewAdminCountMessage] = useState(() =>
    JSON.parse(localStorage.getItem("newAdminCountMessage") || "[]")
  );
  const [lastAdminMessageCounts, setLastAdminMessageCounts] = useState(() =>
    JSON.parse(localStorage.getItem("lastAdminMessageCounts") || "[]")
  );
  const [currentAdminCountMessage, setCurrentAdminCountMessage] = useState(() =>
    JSON.parse(localStorage.getItem("currentAdminCountMessage") || "[]")
  );

  const navagite = useNavigate();
  useEffect(() => {
    const intervalId = setInterval(() => {
      setLastAdminMessageCounts(
        JSON.parse(localStorage.getItem("lastAdminMessageCounts") || "[]")
      );
      setNewAdminCountMessage(
        JSON.parse(localStorage.getItem("newAdminCountMessage") || "[]")
      );
      setCurrentAdminCountMessage(
        JSON.parse(localStorage.getItem("currentAdminCountMessage") || "[]")
      );
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Clean up on component unmount
  }, []);

  const handleAdminClick = (id, name) => {
    console.log("hi................");
    console.log("id, name ", id, name);
    const currentAdminCountMessage = JSON.parse(
      localStorage.getItem("currentAdminCountMessage") || "[]"
    );
    const lastAdminMessageCounts = JSON.parse(
      localStorage.getItem("lastAdminMessageCounts") || "[]"
    );

    const updatedLastAdminMessageCounts = lastAdminMessageCounts.map(
      (admin) => {
        if (admin.userId === id) {
          return {
            userId: admin.userId,
            count:
              currentAdminCountMessage.find((u) => u.userId === id)?.count || 0,
          };
        }
        return admin;
      }
    );

    if (!updatedLastAdminMessageCounts.some((admin) => admin.userId === id)) {
      const currentCount =
        currentAdminCountMessage.find((u) => u.userId === id)?.count || 0;
      updatedLastAdminMessageCounts.push({ userId: id, count: currentCount });
    }

    localStorage.setItem(
      "lastAdminMessageCounts",
      JSON.stringify(updatedLastAdminMessageCounts)
    );
    setLastAdminMessageCounts(updatedLastAdminMessageCounts);
    setRecipient(id);
    setRecipientName(name);
    setIsChatSelected(true);
    setSelectedChatUserId(id);
    fetchMessages(loggedInUserId, id);
  };

  const getUnreadCountForAdmin = (adminId) => {
    const currentAdminCountMessage = JSON.parse(
      localStorage.getItem("currentAdminCountMessage") || "[]"
    );
    const lastAdminMessageCounts = JSON.parse(
      localStorage.getItem("lastAdminMessageCounts") || "[]"
    );

    const currentCount =
      currentAdminCountMessage.find((admin) => admin.userId === adminId)
        ?.count || 0;
    const lastCount =
      lastAdminMessageCounts.find((admin) => admin.userId === adminId)?.count ||
      0;
    console.log("currentCount - lastCount  ", currentCount - lastCount);
    return currentCount - lastCount;
  };

  // Function to fetch messages between two users
  const fetchMessages = (sender, recipient) => {
    axios
      .get(
        `${BASE_URL}/api/empadminsender/getadminmessages/${recipient}/${sender}`
      )
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Fetch all admins except the logged-in user
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/admin/getAllAdmin`)
      .then((response) => {
        const filteredAdmins = response.data.filter(
          (admin) => admin._id !== loggedInUserId
        );
        setAdmins(filteredAdmins);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  // Fetch initial messages between logged-in user and selected recipient
  useEffect(() => {
    const intervalId = setInterval(
      () => fetchMessages(loggedInUserId, recipient),
      2000
    );
    return () => clearInterval(intervalId);
  }, [recipient]);

  // Automatically scroll to bottom when new messages are received

  // Function to send a new message
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      sender: loggedInUserId,
      recipient,
      senderName: userDetails.name,
      text: newMessage,
      image: attachment?.type?.startsWith("image/") ? attachment.url : null,
      video: attachment?.type?.startsWith("video/") ? attachment.url : null,
      document: attachment?.type === "application/pdf" ? attachment.url : null,
    };

    axios
      .post(`${BASE_URL}/api/empadminsender/createMessage`, messageData)
      .then((response) => {
        setMessages([...messages, response.data]);
        setNewMessage("");
        setAttachment(null);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Function to handle file attachment change
  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachment({
          url: reader.result,
          type: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtered list of admins based on search query
  const filteredAdmins = admins.filter((admin) =>
    admin.email.toLowerCase().includes(adminSearchQuery.toLowerCase())
  );

  // Fetch unread messages for all users at regular intervals
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

      // Initial fetch and set interval to fetch every 3 seconds
      fetchUnreadMessages();
      const intervalId = setInterval(fetchUnreadMessages, 3000);

      // Clear interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [users]);

  // Fetch unread messages for all admins at regular intervals
  useEffect(() => {
    if (admins.length > 0) {
      const fetchUnreadMessages = async () => {
        try {
          const unreadUsersData = await Promise.all(
            admins.map(async (admin) => {
              const response = await axios.get(
                `${BASE_URL}/api/empadminsender/mark-messages-read/${admin._id}`
              );
              return { userId: admin._id, data: response.data };
            })
          );
          setUnreadUsersAdmin(unreadUsersData);
        } catch (error) {
          console.error(error);
        }
      };

      // Initial fetch and set interval to fetch every 3 seconds
      fetchUnreadMessages();
      const intervalId = setInterval(fetchUnreadMessages, 3000);

      // Clear interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [admins]);

  // Toggle display of messages for each user or admin
  const handleShowMessage = (userId) => {
    setShowMessages((prevShowMessages) => ({
      ...prevShowMessages,
      [userId]: !prevShowMessages[userId],
    }));
  };

  // Fetch pop-up SMS notifications for logged-in user

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
    setReplyMessage(message); //--------------->
    setShowReplyModal(true); //--------------->
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
    // Perform forward action here, then close modal
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

  const sortedAdmins = filteredAdmins
    .map((admin) => ({
      ...admin,
      unreadCount: getUnreadCountForAdmin(admin._id),
    }))
    .sort((a, b) => b.unreadCount - a.unreadCount);

  const handleVideoCall = () => {
    navagite(`/videoCall/${recipient}`);
  };
  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden relative mt-20 lg:mt-0">
      <GPSTracker managerId={loggedInUserId} path={"te-location"} />
      <ScrollingNavbar />
      <Sidebar value="SOFTWARE" />

      <div
        className={`sticky top-0 bg-white  z-10 w-full lg:w-1/4 p-4 overflow-y-auto  lg:mt-20 border border-purple-100 flex flex-col  text-black shadow ${
          isChatSelected ? "hidden lg:flex" : "flex"
        }`}
      >
        <h1 className="lg:text-2xl text-xl font-bold mb-4 text-[#5443c3] lg:m-4">
          All Admins
        </h1>
        <div className="relative flex items-center mb-5">
          <input
            type="text"
            value={adminSearchQuery}
            onChange={(e) => setAdminSearchQuery(e.target.value)}
            className="w-full h-10 p-2 text-base text-gray-700 rounded-xl pl-10 bg-white border-2 border-[#5443c3] shadow-lg "
            placeholder="Search by email..."
          />
          <AiOutlineSearch className="absolute top-3 left-3 text-gray-500 text-2xl" />
        </div>
        <div className="h-5/6 overflow-y-auto">
          {sortedAdmins.map((admin) => (
            <div key={admin._id}>
              <div
                className="w-full lg:text-xl md:text-2xl text-sm h-auto font-medium rounded-md bg-[#eef2fa] text-[#5443c3] mb-4 flex justify-between items-center p-4 cursor-pointer"
                onClick={() => handleAdminClick(admin._id, admin.email)}
              >
                <h1>{admin.email}</h1>
                {admin.unreadCount > 0 && (
                  <p className="text-red-500 font-bold">{admin.unreadCount}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isChatSelected && (
        <div className="w-full h-screen lg:w-4/5 flex flex-col justify-between bg-[#f6f5fb] ">
          {isChatSelected && (
            <div className="text-[#5443c3] sm:text-white sm:bg-[#5443c3] md:text-white md:bg-[#5443c3] h-12 bg-white p-2 flex flex-row justify-between border border-[#5443c3] lg:mt-20">
              <button
                className="text-[#5443c3] sm:text-white md:text-white lg:text-2xl text-lg mt-2"
                onClick={handleBackToUserList}
              >
                <FaArrowLeft />
              </button>

              <h1 className="lg:text-2xl text-base font-bold flex-grow text-center">
                Chat with {recipientName}
              </h1>

              <FaVideo
                className="text-2xl ml-4" // Adds margin-left to create gap from the name
                onClick={handleVideoCall}
              />
              <Link
                to={"/"}
                className="group relative flex items-center justify-end font-extrabold text-2xl rounded-full p-3 md:p-5"
              >
                {/* <BiLogOut /> */}
              </Link>
            </div>
          )}

          <div
            className="flex flex-col flex-1 px-4 pt-4 relative overflow-y-auto"
            style={{ maxHeight: "80vh" }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex  relative break-words whitespace-pre-wrap ${
                  message.sender === loggedInUserId
                    ? "justify-end"
                    : "justify-start"
                } mb-2  `}
                onMouseEnter={() => handleHover(index)}
                onMouseLeave={() => handleLeave()}
              >
                <div
                  className={`relative lg:text-2xl md:text-xl text-sm ${
                    message.sender === loggedInUserId
                      ? " bg-[#9184e9] text-white self-end rounded-tr-3xl rounded-bl-3xl border-2 border-[#5443c3] "
                      : "bg-white text-[#5443c3] border-2 border-[#5443c3]  self-start rounded-tl-3xl rounded-br-3xl relative"
                  } py-2 px-4 rounded-lg lg:max-w-2xl max-w-[50%]`}
                >
                  {/* //---------------> */}
                  {message.content && message.content.originalMessage && (
                    <div className="mb-2">
                      <span className="bg-green-900 px-2 py-1 text-xs text-white rounded">
                        {message.content.originalMessage}
                      </span>
                    </div>
                  )}
                  {/* //---------------> */}
                  {message.content && message.content.text && (
                    <p className="text-sm">{message.content.text}</p>
                  )}
                  {message.content && message.content.image && (
                    <>
                      <img
                        src={message.content.image}
                        alt="Image"
                        className="rounded-lg lg:h-96 lg:w-72 md:h-96 md:w-64 h-40 w-32"
                      />
                    </>
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
                      className="max-w-xs text-orange-600 hover:underline"
                    >
                      <source src={message.content.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  <span className="text-xs text-black">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                  {hoveredMessage === index && (
                    <>
                      <AiOutlineDown
                        className="absolute top-2 right-2 cursor-pointer"
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
          <div className="flex items-center p-4 bg-[#f6f5fb]  bottom-0 lg:static w-full relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow p-2 rounded-lg mr-2 border-2 border-[#5443c3]"
              placeholder="Type a message..."
            />
            <input
              type="file"
              onChange={handleAttachmentChange}
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
              admin={"admin"}
              senderName={userDetails.name}
            />
          </div>
          <ScrollToBottomButton messagesEndRef={messagesEndRef} />
        </div>
      )}

      {showForwardModal && (
        <ForwardMsgAllUsersToAdmin
          users={admins}
          forwardMessage={forwardMessage}
          onForward={handleConfirmForward}
          onCancel={handleCancelForward}
        />
      )}
      {replyMessage && ( ////--------------------->
        <ReplyModel
          message={replyMessage}
          sender={loggedInUserId}
          recipient={recipient}
          isVisible={showReplyModal}
          onClose={() => setShowReplyModal(false)}
          value={"Admin"}
        />
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

export default SoftwareToAdminChat;
