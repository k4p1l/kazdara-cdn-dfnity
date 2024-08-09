import bg from "../public/bg.png";
import "./Home.css";
import "./ListFiles.css";

import { kazdara_cdn_backend } from "declarations/kazdara_cdn_backend";
import { useEffect, useState } from "react";

function Home() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [isImage, setIsImage] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    listFiles();
  }, []);

  const listFiles = async () => {
    try {
      const fileList = await kazdara_cdn_backend.listFiles();
      setFiles(fileList);
    } catch (error) {
      console.error("Error listing files:", error);
    }
  };

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



    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = new Uint8Array(e.target.result);
      try {
        const fileId = await kazdara_cdn_backend.uploadFile(
          selectedFile.name,
          content
        );
        alert(`File uploaded successfully. File ID: ${fileId}`);
        listFiles();

        const fileInput = document.querySelector(".file-input");
        if (fileInput) {
          fileInput.value = "";
        }
        setSelectedFile(null);
        setFilePreviewUrl("");
        setIsImage(false);
        setIsVideo(false);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Error uploading file. Please try again.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const downloadFile = async (fileId, fileName) => {
    try {
      const fileContent = await kazdara_cdn_backend.getFile(fileId);
      if (fileContent) {
        const blob = new Blob([fileContent]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert("File not found");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file. Please try again.");
    }
  };

  const deleteFile = async (fileId) => {
    setIsDeleting((prev) => ({ ...prev, [fileId]: true }));
    try {
      const success = await kazdara_cdn_backend.deleteFile(fileId);
      if (success) {
        alert("File deleted successfully.");
        listFiles();
      } else {
        alert("Error: File not found or could not be deleted.");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file. Please try again.");
    } finally {
      setIsDeleting((prev) => ({ ...prev, [fileId]: false }));
    }
  };
  return (
    <>
      <header>
        <h1>Kazdara CDN</h1>
        <img className="bg" src={bg} alt="background" />
      </header>
      <section className="upload-section">
        <div className="file-upload">
          <h2>Upload File</h2>
          <div>
            <p className="upload-label">Choose File</p>
            <input
              type="file"
              className="file-input"
              onChange={handleFileChange}
            />
            <button
              onClick={uploadFile}
              disabled={isUploading || !selectedFile}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          {isUploading && <div className="loader">Loading...</div>}
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
      </section>
      <section className="uploaded-files">
        <h3>Uploaded Files</h3>

        <table>
          <thead>
            <tr>
              <th>File Name</th>
              <th>Upload Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map(([id, name, uploadDate]) => (
              <tr key={id}>
                <td>{name}</td>
                <td>{uploadDate.toLocaleString()}</td>
                <td>
                  <button onClick={() => downloadFile(id, name)}>
                    Download
                  </button>
                  <button
                    onClick={() => deleteFile(id)}
                    disabled={isDeleting[id]}
                  >
                    {isDeleting[id] ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

export default Home;
