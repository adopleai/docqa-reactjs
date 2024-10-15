import { useContext, useState, useEffect, useRef } from "react";
import { assets } from "../../assets/assets";
import { AgGridReact } from "ag-grid-react";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import "./Main.css";
import { Context } from "../../context/Context";
import {LicenseManager} from "ag-grid-enterprise";

LicenseManager.setLicenseKey("CompanyName=Broadridge Financial Solutions, Inc.,LicensedGroup=Sam Patel,LicenseType=MultipleApplications,LicensedConcurrentDeveloperCount=15,LicensedProductionInstancesCount=5,AssetReference=AG-024562,ExpiryDate=7_February_2025_[v2]_MTczODg4NjQwMDAwMA==7709d1fa285969de1a690bdc577a9991");

// Form Container to display checkbox form
const FormContainer = ({ selectedImage }) => {
  const { parentProducts, selectedProducts, setSelectedProducts, submitSelectedProducts } = useContext(Context);

  // Handle checkbox change
  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedProducts([...selectedProducts, value]);
    } else {
      setSelectedProducts(selectedProducts.filter((product) => product !== value));
    }
  };

  // Handle form submission
  const handleSubmit = () => {

    submitSelectedProducts(); // Submit selected checkboxes
  };

  return (
    <div className="bot-result-check">
               
      <div className="checkbox-form">
        {parentProducts.map((product, index) => (
          <label key={index}>
            <input
              type="checkbox"
              value={product}
              checked={selectedProducts.includes(product)}
              onChange={handleCheckboxChange}
            />
            {product}
          </label>
        ))}
        <br />
        {/* <button onClick={handleSubmit}>Submit</button> */}
      </div>
    </div> 
  );
};

// const defaultColDef = {
//   sortable : true,
//   filter: true,
//   resizable: true,
//   enablePivot: false,
//   enableValue: false,
//   filter: true,
//   filterParams: {
//     buttons: [
//     'apply',
//     'reset'
//     ],
//     closeOnApply: true
//   },
//   menuTabs: ['filterMenuTab'],
//   resizable: true  
// };

// const ExpandableCellRender = (props) => {
//   const [expanded, setExpanded] = useState(false);

//   const toggleExpand = () =>{
//     setExpanded(!expanded);
//   };

//   return (
//     <div onClick={toggleExpand} style={{{cursor}}}></div>
//   )
// };

// Result history component to display conversation history
const ResultHistory = ({ history, exportToCsv, gridRef, resultContainerRef, selectedImage }) => (
  <div className="result" ref={resultContainerRef} style={{ overflowY: 'auto' }}>
    <FormContainer selectedImage={selectedImage} />
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
                <span className="loader"> </span>
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
                  rowData={entry.response} // Set row data  
                  defaultColDef={defaultColDef}
                  pagination={true}
                  paginationPageSize={10}
                  animateRows={true}
                  enableAdvancedFilter={true}
                  // enableRangeSelection={true}
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



const Main = () => {
  const { onSent, recentPrompt, showResults, resultData, setInput, input, fetchParentProducts } = useContext(Context);
  
  const [history, setHistory] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // To track clicked image
  const [showForm, setShowForm] = useState(false); // To show form after image click
  const resultContainerRef = useRef(null);
  const gridRef = useRef(null);

  // Effect to update history with response data
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

  // Scroll to bottom when history updates
  useEffect(() => {
    if (resultContainerRef.current) {
      resultContainerRef.current.scrollTo({
        top: resultContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [history]);

  // Function to handle user input submission
  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (trimmedInput === "") return;

    const newEntry = { id: Date.now(), question: trimmedInput, loading: true };
    setHistory(prevEntries => [...prevEntries, newEntry]);
    setInput("");
    await onSent(newEntry); // Send input to context API
  };

  // Export grid data to CSV
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

  // Images for the carousel
  const images = [
    { src: assets.bps, alt: "BPS" },
    { src: assets.impact, alt: "Impact" },
    { src: assets.shadow, alt: "Shadow" },
    { src: assets.acendis, alt: "Acendis" },
  ];

  const [currentImage, setCurrentImage] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const questions = [
    { query: "Give me steps to setup the B1’s in QA region.", text: "Give me steps to setup the B1’s in QA region." },
    { query: "What should be done once a contract/SOW is signed?", text: "What should be done once a contract/SOW is signed?" },
    { query: "What are the steps involved in the BPS Environment setup?", text: "What are the steps involved in the BPS Environment setup?" },
    // Add more questions as needed
  ];
  
// Function to show three images based on current index
const showImage = (index) => {
  // Use modulo to wrap the indices infinitely
  return [
    images[(index) % images.length],
    images[(index + 1) % images.length],
    images[(index + 2) % images.length]
  ];
};

// Handle next set of images with infinite loop
const handleNext = () => {
  // Increment the current index, and wrap it using modulo
  setCurrentImage((currentImage + 1) % images.length);
};

// Handle previous set of images with infinite loop
const handlePrev = () => {
  // Decrement the current index, and wrap it around using modulo
  // Adding images.length ensures no negative values
  setCurrentImage((currentImage - 1 + images.length) % images.length);
};


  // Handle image click to show form
  const handleImageClick = (image) => {
    setSelectedImage(image);
    fetchParentProducts(image.alt)
    setShowForm(true);
  };

  
// Function to show the current set of questions based on current index
const showQuestions = (index) => {
  const totalQuestions = questions.length;
  return [
    questions[index % totalQuestions],
    questions[(index + 1) % totalQuestions],
    questions[(index + 2) % totalQuestions]
  ];
};

  // Handle next question with infinite loop
  const handleNextQues = () => {
    setCurrentQuestion((currentQuestion + 1) % questions.length);
  };

  // Handle previous question with infinite loop
  const handlePrevQues = () => {
    setCurrentQuestion((currentQuestion - 1 + questions.length) % questions.length);
  };

  const handleHomeClick = () =>{
    if (showForm){
      setShowForm(false);
    }else{
      window.location.href = 'http://localhost:3000/';
    }
  };

  return (
    <div className="main">
      <header>
        <img src={assets.broadridge_logo} alt="Broadridge Logo" />
        <h1 className="heading">Onboarding Setup Assist</h1>
        <i className="fa fa-home" style={{ fontSize: '30px' }} onClick={handleHomeClick}></i>
      </header>

      <div className="main-container">
        {!showForm ? (
          <>
            {/* Greeting and Carousel Section */}
            <div className="greet">
              <p><span>Welcome User! </span></p>
              <p>How Can I Help You today?</p>
              <p className="text">This is a generative AI-based chatbot to streamline the client onboarding process. 
                Provides a smart platform to accelerate the environment setup for new client onboarding. 
                Reduce overall onboarding timeline, improving quality and enhance client experience.</p>
            </div>

            <div className="carousel">
              <div className="imagesHolder-text">
                <p style={{ fontSize: '18px' }}>Integrated Products</p>
              </div>
              <div className="imagesHolder">
                <div className="image-buttons" onClick={handlePrev}>
                  <img src={assets.left} alt="Previous" id="prev-btn-image" />
                </div>
                <div className="image-viewer">
                  <div className="images-holder">
                    {showImage(currentImage).map((image, index) => (
                      <img
                        key={index}
                        src={image.src}
                        alt={image.alt}
                        className="item"
                        onClick={() => handleImageClick(image)}
                      />
                    ))}
                  </div>
                </div>
                <div className="image-buttons" onClick={handleNext}>
                  <img src={assets.right} alt="Next" id="next-btn-image" />
                </div>
              </div>
            </div>

          <div className="carousel">
            <div className="imagesHolder-text">
              <p style={{ fontSize: '18px' }}>Recommendation</p>
            </div>
            <div className="questionContainer">
              <div className="question-buttons" onClick={handlePrevQues}>
                <img src={assets.left} alt="Previous" id="prev-btn-image" />
              </div>
              <div className="question-viewer">
                <div className="question-holder">
                {showQuestions(currentQuestion).map((question, index) => (
                  <div className="question-box" key={index} data-query={question.query}>
                    {/* <div className="question-box"> */}
                      <p className="question">{question.text}</p>
                      <center><p className="seperator">~</p></center>
                      <center><p style={{fontWeight:"bold"}}>BPS</p></center>
                    </div>
                  // </div>
                  ))}
                </div>
              </div>
              <div className="question-buttons" onClick={handleNextQues}>
                <img src={assets.right} alt="Next" id="next-btn-image" />
              </div>
            </div>
          </div>
         
          </>
        ) : (
          <>
            <ResultHistory history={history} exportToCsv={exportToCsv} gridRef={gridRef} resultContainerRef={resultContainerRef} />
            {/* Search Box */}
        <div className="main-bottom">
          <div className="search-box">
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
        </div>
        </>
                )}
      </div>

    </div>
  );
};

export default Main;
