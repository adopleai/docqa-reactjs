import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const Context = createContext();

const ContextProvider = ({ children }) => { // Change props to children for proper usage
  const [input, setInput] = useState('');
  const [recentPrompt, setRecentPrompt] = useState('');
  const [resultData, setResultData] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);  
  // Added a state for previous prompts if you intend to use it
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [parentProducts, setParentProducts] = useState([]); // New state for Parent Product list
  const [selectedProducts, setSelectedProducts] = useState([]); // New state for selected checkboxes
  
  // Fetch Parent Products from Flask API
  const fetchParentProducts = async (image) => {
    try {
      console.log("Sending image as application:", image);
      
      const response = await axios.post('http://localhost:5000/products', {
        application: image,  // Sending the image as the 'application' field
      });
      
      if (response && response.data) {
        setParentProducts(response.data); // Set Parent Product list
        console.log("Fetched parent products:", response.data); // Log the response
      } else {
        console.error("No data received from server.");
      }
      
    } catch (error) {
      console.error("Error fetching Parent Products:", error.message || error);
    }
  };

  // Submit selected checkboxes back to Flask
  const submitFile = async () => {
    try {
      await axios.post('http://localhost:5000/file-upload', {
        fileObject // Send the selected products to Flask
      });
      
      
      console.log("Selected products submitted:", selectedProducts);
    } catch (error) {
      console.error("Error submitting selected products:", error);
    } 
  };  
  // useEffect(() => {
  //   fetchParentProducts(); // Fetch parent products when component mounts
  // }, []);

  const onSent = async (newEntry) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/get-response', {
        prompt: newEntry.question // Use the question from the passed object
      });
  
      // Set the result data based on the response structure
      if (response.data.table) {
        setResultData(JSON.parse(response.data.table)); // Parse the JSON string
      } else {
        setResultData(response.data.message);
      }
  
      setRecentPrompt(newEntry); // Set recentPrompt with both id and question
      setShowResults(true);
  
      // Update previous prompts
      setPrevPrompts((prev) => [...prev, newEntry.question]);
    } catch (error) {
      console.error("Error fetching data from the Flask API:", error);
      setResultData("Error fetching data. Please try again.");
    } finally {
      setLoading(false); // Ensure loading state is reset after try/catch
    }
  };
  
  
  // You may want to define a function to reset chat or handle new chat
  const newChat = () => {
    setInput('');
    setRecentPrompt('');
    setResultData(null);
    setShowResults(false);
    setPrevPrompts([]);
  };

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    input,
    setInput,
    showResults,
    loading,
    resultData,
    newChat,
    parentProducts, // Expose parent products in the context
    selectedProducts,
    setSelectedProducts, // Expose setter for selected products
    submitFile, // Expose the submit function 
    fetchParentProducts   
  };

  return (
    <Context.Provider value={contextValue}>{children}</Context.Provider>
  );
};

export default ContextProvider;
