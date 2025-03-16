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
  const [expanded, setExpanded] = useState(false);

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
    <div className="voice-selector rounded-md">
      <div className="mb-4">
        <label
          htmlFor="voice-select"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Voice
        </label>
        <select
          id="voice-select"
          value={selectedVoice.value}
          onChange={handleVoiceChange}
          className="w-full rounded-md px-3 py-2 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {VoicesList.map((voice) => (
            <option key={voice.value} value={voice.value}>
              {voice.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <span>Advanced settings</span>
          <svg
            className={`ml-1 w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <label htmlFor="voice-speed" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Speed
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{speed.toFixed(1)}x</span>
            </div>
            <input
              id="voice-speed"
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={handleSpeedChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between mb-1">
              <label htmlFor="voice-temperature" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Temperature
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{temperature.toFixed(1)}</span>
            </div>
            <input
              id="voice-temperature"
              type="range"
              min="0.0"
              max="2.0"
              step="0.1"
              value={temperature}
              onChange={handleTemperatureChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceConfig;
