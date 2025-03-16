"use client";
import { useState } from "react";
import { PDFViewer, AudioControl, FileUploader } from "./components";

export default function Home() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageText, setPageText] = useState("");

  function handleFileUploaded(fileURL) {
    setPdfFile(fileURL);
  }

  return (
    <>
      <div className="flex flex-col items-center w-full mb-8">
        <FileUploader onFileUploaded={handleFileUploaded} />
      </div>

      <PDFViewer
        pdfFile={pdfFile}
        pageNumber={pageNumber}
        setPageNumber={setPageNumber}
        setPageText={setPageText}
      />

      {pdfFile && (
        <div className="flex justify-center mt-4">
          <AudioControl
            pageText={pageText}
            pdfFile={pdfFile}
            pageNumber={pageNumber}
          />
        </div>
      )}
    </>
  );
}
