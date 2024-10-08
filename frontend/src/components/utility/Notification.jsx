import React, { useEffect } from 'react';
import Notification_tone from "../../assests/notification_ding.mp3";

const Notification = () => {
  useEffect(() => {
    // Request Notification permission on component mount
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted");
        }
      }).catch((error) => {
        console.error("Error requesting notification permission:", error);
      });
    }
  }, []);

  const showNotifications = (newMessages) => {
    if (Notification.permission === "granted") {
      newMessages.forEach((message) => {
        const notification = new Notification("New Message", {
          body: `${message.employeeId}: ${message.message}`,
        });
        notification.onclick = () => {
          window.focus();
        };
        notifications.push(notification); // Push each notification to the array

        // Play notification sound
        playNotificationSound();
      });
    }
  };

  const playNotificationSound = () => {
    const notificationSound = new Audio(Notification_tone);
    notificationSound.play();
  };

  // Array to store references to notifications
  let notifications = [];

  // Example usage or integration with your application
  // Replace with your actual data or use case
  const newMessages = [
    { employeeId: '001', message: 'Hello from John' },
    { employeeId: '002', message: 'New update available' },
    // Add more messages here as needed
  ];

  return (
    <div>
      <h1>Notification Example</h1>
      <button onClick={() => showNotifications(newMessages)}>
        Show Notifications
      </button>
    </div>
  );
};

export default Notification;
