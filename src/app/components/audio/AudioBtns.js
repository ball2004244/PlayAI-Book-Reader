"use client";

export default function AudioBtns({
  isProcessing,
  isSpeaking,
  isPaused,
  pageText,
  onPlay,
  onPause,
  onStop,
  progress = { current: 0, total: 0 },
}) {
  if (isProcessing) {
    // Calculate progress percentage
    const progressPercentage =
      progress.total > 0
        ? Math.round((progress.current / progress.total) * 100)
        : 0;

    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            disabled
            className="px-4 py-2 bg-yellow-500 text-white rounded-md flex items-center justify-center"
          >
            <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            Processing Audio...
          </button>
        </div>

        {progress.total > 0 && (
          <div className="w-full mt-2">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <span>
                Processing chunk {progress.current} of {progress.total} (
                {progressPercentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isSpeaking) {
    return (
      <div className="flex flex-col gap-2">
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
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className="flex flex-col gap-2">
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
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={onPlay}
          disabled={!pageText}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          Read Aloud
        </button>
      </div>
    </div>
  );
}
