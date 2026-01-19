import "./Sidebar.scss";
import { useState, useEffect } from "react";
import moment from "moment-timezone";
import { WifiOff, Wifi } from "lucide-react";

const DateTimeNetworkWidget = () => {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDaytime, setIsDaytime] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = moment().tz("America/Los_Angeles"); // Pacific Time
      setTime(now.format("HH:mm"));
      setDate(now.format("dddd, YYYY-MM-DD"));

      const hour = now.hour();
      setIsDaytime(hour >= 6 && hour < 18);
    };

    const updateNetworkStatus = (isOnline) => {
      setIsOnline(isOnline);
    };

    const intervalId = setInterval(updateTime, 1000);
    const connectivityMonitor = window.connectivityMonitor;
    connectivityMonitor.subscribe(updateNetworkStatus);

    updateTime();
    updateNetworkStatus(connectivityMonitor.getIsOnline());

    return () => {
      clearInterval(intervalId);
      connectivityMonitor.unsubscribe(updateNetworkStatus);
    };
  }, []);

  return (
    <div className="date-time-network-container">
      <div className="sun-moon-container">
        <div className={`sun-moon-icon ${isDaytime ? "sun" : "moon"}`} />
      </div>

      <div className="time">{time}</div>

      <div className="date">{date}</div>

      <div className="network-icon">
        {isOnline ? (
          <Wifi size={25} color="white" />
        ) : (
          <WifiOff size={25} color="red" />
        )}
      </div>
    </div>
  );
};

export default DateTimeNetworkWidget;
