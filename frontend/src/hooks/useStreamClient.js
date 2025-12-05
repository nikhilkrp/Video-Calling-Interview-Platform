import { useState, useEffect,useRef } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";



function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

  const videoCall = useRef(null);
  const chatClientInstance = useRef(null);
  

  useEffect(() => {

    const initCall = async () => {

    setIsInitializingCall(true);

      // Early return checks - but set loading to false
      if (!session?.callId) {
        console.log("No callId in session");
        setIsInitializingCall(false);
        return;
      }
      
      if (!isHost && !isParticipant) {
        console.log("User is not host or participant");
        setIsInitializingCall(false);
        return;
      }
      
      if (session.status === "completed") {
        console.log("Session is completed");
        setIsInitializingCall(false);
        return;
      }

    

      try {
        const { token, userId, userName, userImage } = await sessionApi.getStreamToken();
        

        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );

        setStreamClient(client);



        videoCall.current = client.call("default", session.callId);
        await videoCall.current.join({ create: true });
        setCall(videoCall.current);

        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        chatClientInstance.current = StreamChat.getInstance(apiKey);

        await chatClientInstance.current.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );
        setChatClient(chatClientInstance.current);

        const chatChannel = chatClientInstance.current.channel("messaging", session.callId);
        await chatChannel.watch();
        setChannel(chatChannel);
      } catch (error) {
        toast.error("Failed to join video call");
        console.error("Error init call", error);
      } finally {
        setIsInitializingCall(false);
      }
    };

    if (session && !loadingSession) initCall();

    return () => {
      (async () => {
        try {
          if (videoCall.current) await videoCall.current.leave();
          if (chatClientInstance.current) await chatClientInstance.current.disconnectUser();
          await disconnectStreamClient();
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      })();
    };
  }, [session, loadingSession, isHost, isParticipant]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useStreamClient;


