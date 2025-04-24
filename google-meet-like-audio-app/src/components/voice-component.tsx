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
    <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
      <Card
        title="Voice Chat"
        style={{ maxWidth: 400, width: "100%" }}

      >
        <Space
          direction="vertical"
          style={{ width: "100%", textAlign: "center" }}
        >
          {status === "connected" ? (
            <Button
              type="primary"
              danger
              onClick={handleEndConversation}
              style={{ width: "100%" }}
              icon={<StopOutlined />}
            >
              End Conversation
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={handleStartConversation}
              disabled={!hasPermission}
              style={{ width: "100%" }}
              icon={<PhoneOutlined />}
            >
              Start Conversation
            </Button>
          )}

          {status === "connected" && (
            <Text type="success">
              {isSpeaking ? "Agent is speaking..." : "Listening..."}
            </Text>
          )}
          {errorMessage && <Text type="danger">{errorMessage}</Text>}
          {!hasPermission && (
            <Text type="warning">
              Please allow microphone access to use voice chat
            </Text>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default VoiceChat;
