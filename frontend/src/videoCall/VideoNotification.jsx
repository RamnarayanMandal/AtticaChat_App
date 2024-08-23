import React, { useState, useEffect } from 'react';
import { getVideoCallRequests, acceptVideoCall, rejectVideoCall } from './api'; // Adjust import path as needed
import ringtoneFile from "../assests/ringtone.mp3";
import { FcVideoCall } from "react-icons/fc"; // Import your ringtone file
import "./style.css";

const VideoNotification = () => {
    const [requests, setRequests] = useState([]);
    const [hasPlayedRingtone, setHasPlayedRingtone] = useState(false);
    const userId = localStorage.getItem("CurrentUserId");
    const ringtone = new Audio(ringtoneFile);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await getVideoCallRequests(userId);

                // Filter out requests where senderId is the same as userId (i.e., the user is calling themselves)
                const filteredRequests = data.videoCallRequests.filter(request => request.senderId !== userId);

                // Filter out duplicate requests from the same sender
                const newRequests = filteredRequests.filter((request, index, self) =>
                    index === self.findIndex(r => r.senderId === request.senderId)
                );

                // Play ringtone only once when new requests arrive
                if (newRequests.length > 0 && !hasPlayedRingtone) {
                    ringtone.play();
                    setHasPlayedRingtone(true); // Set the flag to true after playing ringtone
                }

                setRequests(newRequests);

                // Set timeout to auto-reject calls after 1 minute
                newRequests.forEach(request => {
                    setTimeout(() => handleReject(request._id), 60000); // 60000 ms = 1 minute
                });

            } catch (error) {
                console.error("Failed to fetch video call requests:", error);
            }
        };

        fetchRequests();

        // Fetch requests periodically to check for new calls
        const interval = setInterval(fetchRequests, 5000); // Adjust the interval as needed
        return () => clearInterval(interval);
    }, [userId, hasPlayedRingtone]);

    const handleAccept = async (id, link) => {
        try {
            await acceptVideoCall(id);
            setRequests(requests.filter(request => request._id !== id));
            stopRingtone();
            window.location.href = link; // Use window.location.href for absolute URLs
        } catch (error) {
            console.error("Failed to accept video call", error);
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectVideoCall(id);
            setRequests(requests.filter(request => request._id !== id));
            stopRingtone();
        } catch (error) {
            console.error("Failed to reject call");
        }
    };

    const stopRingtone = () => {
        if (ringtone) {
            ringtone.pause();
            setHasPlayedRingtone(false); // Reset the flag to allow the ringtone to play again for new requests
        }
    };

    return (
        <div className="fixed bottom-4 right-10 space-y-4 z-50">
            {requests.map(request => (
                <div key={request._id} className="border p-4 rounded-md shadow-lg bg-white flex justify-between items-center flex-col">
                    <p className="text-lg font-semibold ">{`${request.senderName} is Calling`}</p>
                    <FcVideoCall className='text-3xl my-4 animate-vibrate' />
                    <div className='flex justify-center content-center items-center gap-5 '>
                        <button
                            onClick={() => handleAccept(request._id, request.link)}
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => handleReject(request._id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 ml-2"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VideoNotification;
