"use client";
import { useState } from "react";
import VoiceComponent from "@/components/voice-component";
import Image from "next/image";
import styles from "@/styles/animations.module.css";

export default function Home() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute -z-10 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-[100px] animate-pulse" />

      <div className="flex items-center justify-center gap-16 mb-12">
        {/* User Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40 mb-2">
          <Image
              src="/user.png"
              alt="User"
              layout="fill"
              objectFit="contain"
              className={`${userSpeaking ? styles.animateBounceSpeak : styles.animateFloat}`}
            />
          </div>
          <h2 className="text-xl font-semibold">User</h2>
        </div>

        {/* Bot Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40 mb-2">
            <Image
              src="/bot.png"
              alt="AI Bot Alexis"
              layout="fill"
              objectFit="contain"
              className={`${isSpeaking ? styles.animateBounceSpeak : styles.animateFloat}`}
            />
          </div>
          <h2 className="text-xl font-semibold">Alexis</h2>
        </div>
      </div>

      <h1 className="text-4xl font-bold mb-6">Voice Chat</h1>

      <VoiceComponent
        onSpeakingChange={(speaking) => {
          setIsSpeaking(speaking);
          setUserSpeaking(!speaking);
        }}
      />

    </main>
  );
}