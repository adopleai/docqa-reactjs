import { useContext, useState, useEffect, useRef } from "react";
import { assets } from "../../assets/assets";
import "./Main.css";
import {useNavigate} from 'react-router-dom'
import { Context } from "../../context/Context";

const Home = () => {
    const { fetchParentProducts } = useContext(Context);
    const [selectedImage, setSelectedImage] = useState(null); // To track clicked image
    const [showForm, setShowForm] = useState(false); // To show form after image click
    const navigate = useNavigate();

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
    //   setSelectedImage(image);   
      fetchParentProducts(image.alt)
    //   setShowForm(true);
      navigate('/main');

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
        </div>
        </div>
        )
    }

export default Home;