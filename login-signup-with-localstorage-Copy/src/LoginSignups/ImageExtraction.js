import React, { useState } from 'react';
import './ImageExtraction.css';

function ImageUploadAndResult() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [result, setResult] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadStatus('Please select an image file');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image. Please try again.');
      }

      const data = await response.json();
      setResult(data); // Display result
      setUploadStatus('Image processed successfully');
    } catch (error) {
      console.error(error.message);
      setUploadStatus(error.message);
    }
  };

  // Handle PDF download on the same page without redirecting
  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/download-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          heading: result.heading,
          extractedText:result.extractedText,
          summary: result.summary,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF. Please try again.');
      }

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'result.pdf'; // Name of the downloaded file
      link.click(); // Trigger the download
    } catch (error) {
      console.error(error.message);
      setUploadStatus('Error generating PDF');
    }
  };

  return (
    <div className="container">
      <h1>Upload Image and Get Results</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit">Upload </button>
      </form>
      <p className="uploadStatus">{uploadStatus}</p>
      {result && (
        <div className="result">
          <h2>Result:</h2>
          <p><strong>Heading:</strong> {result.heading}</p>
          <p><strong>Extracted Text:</strong> {result.extractedText}</p>
          <p><strong>Summary:</strong> {result.summary}</p>
          <button onClick={handleDownloadPDF}>Download PDF</button>
        </div>
      )}
    </div>
  );
  
}

export default ImageUploadAndResult;