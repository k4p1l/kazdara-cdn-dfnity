import { kazdara_cdn_backend } from "declarations/kazdara_cdn_backend";
import { useState, useEffect } from "react";

function ListFiles({ files, refreshFiles }) {
  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

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
    try {
      const success = await kazdara_cdn_backend.deleteFile(fileId);
      if (success) {
        alert("File deleted successfully.");
        refreshFiles();
      } else {
        alert("Error: File not found or could not be deleted.");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file. Please try again.");
    }
  };

  return (
    <>
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
                <button onClick={() => downloadFile(id, name)}>Download</button>
                <button onClick={() => deleteFile(id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default ListFiles;
