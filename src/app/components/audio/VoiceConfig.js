"use client";
import { useState } from "react";
import {
  defaultVoice,
  VoicesList,
  defaultSpeed,
  defaultTemperature,
} from "@/app/constants";

const VoiceConfig = ({ onVoiceSelect }) => {
  const [selectedVoice, setSelectedVoice] = useState(
    defaultVoice || VoicesList[0]
  );
  const [speed, setSpeed] = useState(selectedVoice.speed || defaultSpeed);
  const [temperature, setTemperature] = useState(
    selectedVoice.temperature || defaultTemperature
  );

  // Update voice config in parent component
  const updateVoiceConfig = (
    voiceData,
    newSpeed = speed,
    newTemperature = temperature
  ) => {
    const completeVoiceConfig = {
      ...voiceData,
      speed: newSpeed,
      temperature: newTemperature,
    };

    if (onVoiceSelect) {
      onVoiceSelect(completeVoiceConfig);
    }
  };

  const handleVoiceChange = (e) => {
    const value = e.target.value;
    const selectedVoiceObject = VoicesList.find(
      (voice) => voice.value === value
    );

    if (selectedVoiceObject) {
      setSelectedVoice(selectedVoiceObject);

      // Reset speed and temperature to the new voice's defaults or global defaults
      const newSpeed = selectedVoiceObject.speed || defaultSpeed;
      const newTemperature =
        selectedVoiceObject.temperature || defaultTemperature;

      setSpeed(newSpeed);
      setTemperature(newTemperature);

      // Update parent with complete config
      updateVoiceConfig(selectedVoiceObject, newSpeed, newTemperature);
    }
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    updateVoiceConfig(selectedVoice, newSpeed, temperature);
  };

  const handleTemperatureChange = (e) => {
    const newTemperature = parseFloat(e.target.value);
    setTemperature(newTemperature);
    updateVoiceConfig(selectedVoice, speed, newTemperature);
  };

  return (
    <div className="voice-selector bg-background text-foreground p-4 rounded-md">
      <div className="mb-4">
        <label
          htmlFor="voice-select"
          className="mb-2 block text-lg font-medium"
        >
          Select Voice:
        </label>
        <select
          id="voice-select"
          value={selectedVoice.value}
          onChange={handleVoiceChange}
          className="w-full rounded px-2 py-1 text-lg bg-background text-foreground border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {VoicesList.map((voice) => (
            <option key={voice.value} value={voice.value}>
              {voice.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="voice-speed" className="mb-2 block text-lg font-medium">
          Speed: {speed.toFixed(1)}
        </label>
        <input
          id="voice-speed"
          type="range"
          min="0.0"
          max="5.0"
          step="0.1"
          value={speed}
          onChange={handleSpeedChange}
          className="w-full"
        />
      </div>

      <div className="mb-2">
        <label
          htmlFor="voice-temperature"
          className="mb-2 block text-lg font-medium"
        >
          Temperature: {temperature.toFixed(1)}
        </label>
        <input
          id="voice-temperature"
          type="range"
          min="0.0"
          max="2.0"
          step="0.1"
          value={temperature}
          onChange={handleTemperatureChange}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default VoiceConfig;
