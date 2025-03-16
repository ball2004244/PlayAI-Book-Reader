"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

export default function PDFViewer({
  pdfFile,
  pageNumber,
  setPageNumber,
  setPageText,
}) {
  const [numPages, setNumPages] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();

    if (pdfFile) {
      setPageNumber(1);
    }
  }, [pdfFile, setPageNumber]);

  useEffect(() => {
    async function extractTextFromPage() {
      if (!pdfFile) return;

      try {
        const pdf = await pdfjs.getDocument(pdfFile).promise;
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item) => item.str).join(" ");
        setPageText(text);
      } catch (error) {
        console.error("Error extracting text from PDF:", error);
      }
    }

    if (pdfFile && pageNumber) {
      extractTextFromPage();
    }
  }, [pageNumber, pdfFile, setPageText]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setIsLoading(false);
  }

  function nextPage() {
    setPageNumber((prevPageNumber) => Math.min(prevPageNumber + 1, numPages));
  }

  function prevPage() {
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
  }

  function zoomIn() {
    setScale((prev) => Math.min(prev + 0.25, 5));
  }

  function zoomOut() {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  }

  // Calculate the width based on the scale and screen size
  const baseWidth = Math.min(600, window.innerWidth * 0.8);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden w-full">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {numPages && (
              <button
                onClick={prevPage}
                disabled={pageNumber <= 1}
                className="p-1 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
              </button>
            )}
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {numPages
                ? `Page ${pageNumber} of ${numPages}`
                : "Loading PDF..."}
            </div>
            {numPages && (
              <button
                onClick={nextPage}
                disabled={pageNumber >= numPages}
                className="p-1 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Zoom out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Zoom in"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="h-[70vh] w-fit mx-auto max-w-full sm:max-w-[90vw] md:max-w-[60vw] lg:max-w-[60vw] overflow-auto justify-center flex">
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
              </div>
            }
            className="pdf-document w-full flex flex-col justify-center my-auto"
          >
            <Page
              pageNumber={pageNumber}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={baseWidth}
              scale={scale}
              className="pdf-page mx-auto"
            />
          </Document>
        </div>
      </div>
    </div>
  );
}
