import { useContext, useState, useEffect, useRef } from "react";
import { assets } from "../../assets/assets";
import { AgGridReact } from "ag-grid-react";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import "./Main.css";
import { Context } from "../../context/Context";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const ResultHistory = ({ history, exportToCsv, gridRef, resultContainerRef }) => (
  <div className="result" ref={resultContainerRef} style={{ overflowY: 'auto' }}>
    {history.map((entry) => (
      <div key={entry.id}>
        <div className="user-input">
          <img src={assets.user_icon} alt="User" className="user-img" />
          <p>{entry.question}</p>
        </div>
        <div className="bot-result">
          <img src={assets.bot_icon} alt="Bot" className="bot-img" />

          {entry.loading ? (
            <div className="loader-div">
              <span className="loader"></span>
              <p>Please wait for it...</p>
            </div>
          ) : Array.isArray(entry.response) ? (
            <div id="table-container" className={"ag-theme-quartz"} style={{ width: '100%' }}>
              <div className="download-icon">
                <img src={assets.download} alt="Download CSV" onClick={exportToCsv} className="download-csv" />
              </div>
              <div id="table" style={{ height: '350px' }}>
                <AgGridReact
                  ref={gridRef}
                  rowData={entry.response}
                  defaultColDef={defaultColDef}
                  pagination={true}
                  paginationPageSize={10}
                  animateRows={true}
                  enableAdvancedFilter={true}
                  columnDefs={Object.keys(entry.response[0] || {}).map(key => ({
                    headerName: key,
                    field: key
                  }))} 
                />
              </div>
            </div>
          ) : (
            <p dangerouslySetInnerHTML={{ __html: entry.response }}></p>
          )}
        </div>
      </div>
    ))}
  </div>
);

const ChatPage = () => {
  const { onSent, recentPrompt, showResults, resultData, setInput, input } = useContext(Context);
  const [history, setHistory] = useState([]);
  const resultContainerRef = useRef(null);
  const gridRef = useRef(null);
  const navigate = useNavigate();
   
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null); 
  const [uploadStatus, setUploadStatus] = useState(''); // State for upload status

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Store the selected file in state
    if (e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleIconClick = () => {
    fileInputRef.current.click(); // Trigger file input click when icon is clicked
  };

  const handleFileUpload = async (file) => {
    if (!file) {
      alert("No file selected!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true); // Set loading state to true
    setUploadStatus(''); // Reset upload status message before upload

    try {
      const response = await axios.post("http://127.0.0.1:3000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("File uploaded successfully", response.data);
      setUploadStatus('Uploaded!'); // Update upload status message

      // Update history with the response data if needed
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus('Error uploading file.'); // Update upload status message on error

    } finally {
      setLoading(false); // Reset loading state after upload completes
    }
  };

  const goToHome = () => {
    navigate('/');
  };

  useEffect(() => {
    if (resultData && recentPrompt) {
      setHistory(prevEntries =>
        prevEntries.map(entry =>
          entry.id === recentPrompt.id && entry.loading
            ? { ...entry, loading: false, response: resultData }
            : entry
        )
      );
    }
  }, [resultData, recentPrompt]);

  useEffect(() => {
    if (resultContainerRef.current) {
      resultContainerRef.current.scrollTo({
        top: resultContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [history]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (trimmedInput === "") return;

    if (!file) {
      setInput('');
      setHistory(prevEntries => [...prevEntries, { id: Date.now(), question: "", loading: false, response: "Please upload a file" }]);
    } else {
      const newEntry = { id: Date.now(), question: trimmedInput, loading: true };
      setHistory(prevEntries => [...prevEntries, newEntry]);
      
      await onSent(newEntry); // Send the prompt only after the file is uploaded
      setInput('');
    }
  };

  const exportToCsv = () => {
    const gridApi = gridRef.current.api;
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: 'ag-grid-export.csv',
        columnSeparator: ',',
        processCellCallback: (params) => params.value,
      });
    }
  };

  return (
    <div className="main">
      <header>
        {/* <img src={assets.broadridge_logo} alt="Broadridge Logo" /> */}
        <h2>Adolpe AI</h2>
        <h1 className="heading">Multi Document QA Assistant</h1>
        <i className="fa fa-home" style={{ fontSize: '30px' }} onClick={goToHome}></i>
      </header>

      <div className="main-container">
        <ResultHistory history={history} exportToCsv={exportToCsv} gridRef={gridRef} resultContainerRef={resultContainerRef} />
        
        <div className="main-bottom">

          <div className="search-box">
            {/* Display upload status message */}
            {uploadStatus && (
              <div className="upload-status">
                <p>{uploadStatus}</p>
              </div>
            )}              
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}  // Hide the input
              onChange={handleFileChange}
              accept=".pdf,.json"
              multiple
            />
            <div onClick={handleIconClick}>
              <img src={assets.attachment_icon} alt="attachment" className="attachment" />
            </div>

            <input
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
              value={input}
              type="text"
              placeholder="Enter a Prompt Here"
            />
            <div>
              <img src={assets.mic_icon} alt="mic" className="mic" />
            </div>
            <div>
              <img
                src={assets.send_icon}
                alt="Send"
                onClick={handleSend}
                className="btn"
              />
            </div>
          </div>
          {loading && (
            <div className="file-upload-loader">
            <span className="loader"></span>
            <p>Please wait for file upload...</p>
          </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ChatPage;
