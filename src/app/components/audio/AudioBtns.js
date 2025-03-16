"use client";

export default function AudioBtns({
  isProcessing,
  isSpeaking,
  isPaused,
  pageText,
  onPlay,
  onPause,
  onStop,
}) {
  if (isProcessing) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-yellow-500 text-white rounded-md flex items-center justify-center"
      >
        <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
        Processing Audio...
      </button>
    );
  }

  if (isSpeaking) {
    return (
      <div className="flex gap-2">
        <button
          onClick={onPause}
          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
        >
          Pause
        </button>
        <button
          onClick={onStop}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Stop
        </button>
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className="flex gap-2">
        <button
          onClick={onPlay}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Resume
        </button>
        <button
          onClick={onStop}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Stop
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onPlay}
      disabled={!pageText}
      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
    >
      Read Aloud
    </button>
  );
}
