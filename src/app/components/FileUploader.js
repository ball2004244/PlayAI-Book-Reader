"use client";

import { useState } from "react";

export default function FileUploader({ onFileUploaded }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  function handleFileChange(event) {
    const file = event.target.files[0];
    processFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }

  function processFile(file) {
    if (file && file.type === "application/pdf") {
      setIsUploading(true);
      // Create a URL for the file
      const fileURL = URL.createObjectURL(file);
      onFileUploaded({...file, url: fileURL});
      setIsUploading(false);
    } else if (file) {
      alert("Please upload a PDF file.");
    }
  }

  return (
    <div className="w-full max-w-xl">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 
          ${isDragging 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
            : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"}`}
      >
        <label
          htmlFor="pdf-upload"
          className="flex flex-col items-center justify-center w-full cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <svg
                className="w-10 h-10 text-blue-600 dark:text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="mb-2 text-lg font-medium text-gray-700 dark:text-gray-300">
              {isUploading ? "Uploading..." : "Upload your PDF"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {isDragging 
                ? "Drop your file here" 
                : "Drag your file here"}
            </p>
          </div>
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
}
