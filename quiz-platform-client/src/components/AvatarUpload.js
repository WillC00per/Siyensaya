import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import AdminNavbar from './AdminNavbar';
import './AdminActivity.css'; // Import your CSS file here for styling

const AvatarUpload = () => {
  const [avatar, setAvatar] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null); // To display the uploaded avatar

  const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

  // Handle avatar file selection
  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  // Handle avatar upload
  const handleUpload = async () => {
    if (!avatar) {
      setError('Please select an avatar image to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', avatar);

    try {
      setUploading(true);
      setError(null);

      console.log('Uploading avatar...');

      const response = await axios.post(`${BASE_URL}/api/upload-avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Avatar uploaded successfully:', response.data);

      // Store the uploaded avatar URL
      setAvatarUrl(response.data.avatarUrl); // Display the uploaded avatar
      setUploading(false);
    } catch (error) {
      setUploading(false);
      
      console.error('Error uploading avatar:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      
      setError('Failed to upload avatar. Please try again.');
    }
  };

  // Function to refresh the page
  const handleAddAnotherPhoto = () => {
    window.location.reload();
  };

  return (
    <div className="d-flex vh-100"> {/* Full-height flex container */}
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column"> {/* Flex-grow for the main content */}
        <div className="container-fluid flex-grow-1 d-flex flex-column align-items-center justify-content-center">
          <AdminNavbar />
          <h2 className="upload-header mb-4">Upload Avatar</h2>
          <p className="mb-4 text-muted">Upload guideline approved avatars that the students will use.</p> {/* Instruction message */}
          
          <div className="form-group">
            <input 
              type="file" 
              accept="image/*" 
              className="form-control file-input" 
              onChange={handleFileChange} 
            />
          </div>
          <button className="btn btn-primary upload-button mt-3" onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Avatar'}
          </button>

          {error && <p className="text-danger error-message mt-3">{error}</p>}

          {/* Display the uploaded avatar */}
          {avatarUrl && (
            <div className="uploaded-avatar-container mt-4 border p-3">
              <h3>Uploaded Avatar:</h3>
              <img 
                src={`${BASE_URL}${avatarUrl}`} // Using BASE_URL for the avatar path
                alt="Uploaded Avatar" 
                className="uploaded-avatar" 
              />
            </div>
          )}

          <button 
            className="btn btn-secondary mt-3" 
            onClick={handleAddAnotherPhoto} // Call refresh function
          >
            Add Another Photo
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;
