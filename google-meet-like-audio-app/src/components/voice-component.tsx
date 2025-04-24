"use client";

import React, { useEffect, useState } from "react";
import { useConversation } from "@11labs/react";
import { Button, Card, Space, Typography, message } from "antd";
import { StopOutlined, PhoneOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface VoiceChatProps {
    onSpeakingChange?: (isSpeaking: boolean) => void; 
  }

  const VoiceChat = ({ onSpeakingChange }: VoiceChatProps) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      message.success("Connected to ElevenLabs");
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
      message.info("Disconnected from ElevenLabs");
    },
    onMessage: (message) => {
      console.log("Received message:", message);
    },
    onError: (error: string | Error) => {
      const msg = typeof error === "string" ? error : error.message;
      setErrorMessage(msg);
      message.error(msg);
      console.error("Error:", error);
    },
    onUserSpeaking: (speaking: boolean) => {
        if (onSpeakingChange) {
          onSpeakingChange(!speaking); 
        }
      },
  });

  const { status, isSpeaking } = conversation;

  useEffect(() => {
    if (onSpeakingChange) {
      onSpeakingChange(isSpeaking);
    }
  }, [isSpeaking, onSpeakingChange]);

  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasPermission(true);
      } catch (error) {
        setErrorMessage("Microphone access denied");
        message.error("Microphone access denied");
        console.error("Error accessing microphone:", error);
      }
    };

    requestMicPermission();
  }, []);

  const handleStartConversation = async () => {
    try {
      const conversationId = await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
      });
      console.log("Started conversation:", conversationId);
    } catch (error) {
      setErrorMessage("Failed to start conversation");
      message.error("Failed to start conversation");
      console.error("Error starting conversation:", error);
    }
  };

  const handleEndConversation = async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      setErrorMessage("Failed to end conversation");
      message.error("Failed to end conversation");
      console.error("Error ending conversation:", error);
    }
  };


  return (
    <div className="w-full flex justify-center p-5">
      <Card
        className="w-full max-w-md backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg"
        title={
          <span className="text-white text-xl font-semibold">Voice Chat</span>
        }
        headStyle={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
        bodyStyle={{ padding: '20px' }}
      >
        <Space direction="vertical" className="w-full text-center">
          {status === "connected" ? (
            <Button
              type="primary"
              danger
              onClick={handleEndConversation}
              className="w-full bg-red-500 hover:bg-red-600 border-none h-12"
              icon={<StopOutlined />}
            >
              End Conversation
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={handleStartConversation}
              disabled={!hasPermission}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 border-none h-12"
              icon={<PhoneOutlined />}
            >
              Start Conversation
            </Button>
          )}

          {status === "connected" && (
            <Text className="text-white/80">
              {isSpeaking ? "Alexis is speaking..." : "Listening..."}
            </Text>
          )}
          {errorMessage && (
            <Text className="text-red-400">{errorMessage}</Text>
          )}
          {!hasPermission && (
            <Text className="text-yellow-400">
              Please allow microphone access to use voice chat
            </Text>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default VoiceChat;