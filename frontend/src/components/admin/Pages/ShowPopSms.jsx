import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../constants';
import { useSound } from "use-sound";
import notificationSound from "../../../assests/sound.wav";


const ShowPopSms = ({ loggedInUserId }) => {
  const [popSms, setPopSms] = useState([]);
  const [selectedSender, setSelectedSender] = useState('');
  const [selectedSenderName, setSelectedSenderName] = useState('');
  const [showPopSms, setShowPopSms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playNotificationSound] = useSound(notificationSound);

  const fetchPopSms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/api/getNotification/${loggedInUserId}`);
      const data = response.data;
      console.log("Admin Notification Data:", data);
      setPopSms(data);
      if (data.length > 0) {
        const senderId = data[0].sender;
        setSelectedSender(senderId);
        setShowPopSms(true);
        
        playNotificationSound();
      } else {
        setShowPopSms(false);
      }
    } catch (error) {
      console.error("Error fetching pop SMS:", error);
      setError("Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchPopSms, 2000);
    return () => clearInterval(interval);
  }, [loggedInUserId]);

  const handleModalClose = async (senderId) => {
    try {
      await axios.delete(`${BASE_URL}/api/deleteNotification/${senderId}`);
      setShowPopSms(false);
      setSelectedSender('');
      setSelectedSenderName('');
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return (
    <div className={`fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 ${showPopSms ? 'block' : 'hidden'}`}>
      <div className="bg-blue-100 p-4 rounded-lg shadow-lg w-[80vw] md:w-[50vw] lg:w-[30vw] animate-pop-up">
        {loading && <p>Loading notifications...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {popSms
          .filter((sms) => sms.sender === selectedSender)
          .map((sms) => (
            <div
              key={sms.id}
              className="border border-[#5443c3] rounded-lg p-2 mb-2 shadow-sm relative"
            >
              <div className="flex items-center gap-5 mb-1">
                <i className="fas fa-bell text-yellow-500 text-sm mr-2"></i>
                <h1 className="text-2xl font-bold text-green-600 text-center">
                  {sms.senderName}
                </h1>
              </div>
              <p className="text-base font-bold mb-1 relative break-words whitespace-pre-wrap">{sms.content.text}</p>
              <p className="text-sm text-gray-500 my-4">
                {new Date(sms.createdAt).toLocaleDateString()}{" "}
                {new Date(sms.createdAt).toLocaleTimeString()}
              </p>
              <button
                className="absolute top-2 right-2 text-red-500 hover:text-gray-700"
                onClick={() => handleModalClose(sms.sender)}
                aria-label="Close notification"
              >
                Close
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ShowPopSms;
