import { useState, useCallback } from "react";
import { kazdara_cdn_backend } from "declarations/kazdara_cdn_backend";
import Home from "./Home";
import UploadFile from "./UploadFile";
import ListFiles from "./ListFiles";

function App() {
  const [files, setFiles] = useState([]);
  const refreshFiles = useCallback(async () => {
    try {
      const fileList = await kazdara_cdn_backend.listFiles();
      setFiles(fileList);
    } catch (error) {
      console.error("Error listing files:", error);
    }
  }, []);
  return (
    <main>
      <Home />
      <UploadFile onFileUploaded={refreshFiles} />
      <ListFiles files={files} refreshFiles={refreshFiles} />
    </main>
  );
}

export default App;
