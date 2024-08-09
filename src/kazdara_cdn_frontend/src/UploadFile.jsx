// FileUpload.js
import React, { useState } from "react";
import { kazdara_cdn_backend } from "declarations/kazdara_cdn_backend";

function FileUpload({ onFileUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [isImage, setIsImage] = useState(false);
  const [isVideo, setIsVideo] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    if (file) {
      const fileType = file.type;
      if (fileType.startsWith("image/")) {
        setIsImage(true);
        setIsVideo(false);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } else if (fileType.startsWith("video/")) {
        setIsImage(false);
        setIsVideo(true);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setIsImage(false);
        setIsVideo(false);
        setFilePreviewUrl("");
      }
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = new Uint8Array(e.target.result);
      try {
        const fileId = await kazdara_cdn_backend.uploadFile(
          selectedFile.name,
          content
        );
        alert(`File uploaded successfully. File ID: ${fileId}`);
        setSelectedFile(null);
        setFilePreviewUrl("");
        setIsImage(false);
        setIsVideo(false);
        onFileUploaded();
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Error uploading file. Please try again.");
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div>
      <h2>Upload File</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadFile}>Upload</button>
      {filePreviewUrl && (
        <div>
          <h2>File Preview</h2>
          {isImage && (
            <img
              src={filePreviewUrl}
              alt="Preview"
              style={{ maxWidth: "300px", maxHeight: "300px" }}
            />
          )}
          {isVideo && (
            <video
              src={filePreviewUrl}
              controls
              style={{ maxWidth: "300px", maxHeight: "300px" }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
