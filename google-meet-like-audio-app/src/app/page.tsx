"use client";
import { useState } from "react";
import VoiceComponent from "@/components/voice-component";
import Image from "next/image";
import styles from "@/styles/animations.module.css";

export default function Home() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute -z-10 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-[100px] animate-pulse" />

      <div className="relative w-48 h-48 mb-6">
        <Image
          src="/bot.png"
          alt="Cute AI Bot"
          layout="fill"
          objectFit="contain"
          className={`${
            isSpeaking ? styles.animateBounceSpeak : styles.animateFloat
          } transition-all duration-300`}
        />
      </div>

      <h1 className="text-4xl font-bold mb-6">Alexis</h1>

      <VoiceComponent
        onSpeakingChange={(speaking) => setIsSpeaking(speaking)}
      />

      <small className="text-xs text-gray-500 my-6">
        The app requires microphone access to work.
      </small>

    </main>
  );
}
