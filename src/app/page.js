"use client";

import { useState } from "react";
import PDFViewer from "./components/PDFViewer";
import FileUploader from "./components/FileUploader";

export default function Home() {
  const [pdfFile, setPdfFile] = useState(null);

  function handleFileUploaded(fileURL) {
    setPdfFile(fileURL);
  }

  return (
    <>
      <div className="flex flex-col items-center w-full mb-8">
        <FileUploader onFileUploaded={handleFileUploaded} />
      </div>
      <PDFViewer pdfFile={pdfFile} />
    </>
  );
}