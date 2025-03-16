"use client";
import { useState } from "react";
import { PDFViewer, AudioControl, FileUploader } from "@/app/components";

export default function Home() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageText, setPageText] = useState("");

  function handleFileUploaded(fileURL) {
    setPdfFile(fileURL);
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 max-w-6xl">
      {!pdfFile ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-center">
            Upload a PDF to get started
          </h2>
          <FileUploader onFileUploaded={handleFileUploaded} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 sm:gap-6 md:gap-8">
          <div className="pdf-container order-2 md:order-1">
            <PDFViewer
              pdfFile={pdfFile}
              pageNumber={pageNumber}
              setPageNumber={setPageNumber}
              setPageText={setPageText}
            />
          </div>

          <div className="controls-container self-start order-1 md:order-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-medium mb-4 text-gray-800 dark:text-gray-200">
                Audio Controls
              </h3>
              <AudioControl
                pageText={pageText}
                pdfFile={pdfFile}
                pageNumber={pageNumber}
              />
            </div>

            <div className="mt-4 sm:mt-6 flex justify-center">
              <button
                onClick={() => setPdfFile(null)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Upload a different PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
