import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import AdminNavbar from './AdminNavbar';
import './AdminActivity.css'; // Import your CSS file here

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

const GameUpload = () => {
  const [gameFile, setGameFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null); // State for thumbnail
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [gamePath, setGamePath] = useState(null); // Path to display the uploaded game
  const [gameUrl, setGameUrl] = useState(''); // Store the game URL
  const [gameDetails, setGameDetails] = useState({
    title: '',
    grade: [], // Initially, grade is an empty array
    description: '',
    createdBy: ''
  });
  const [teachersAndAdmins, setTeachersAndAdmins] = useState([]);

  // Grade range options
  const gradeRanges = [
    { label: '1-3', value: [1, 2, 3] },
    { label: '4-6', value: [4, 5, 6] },
    { label: '1-6', value: [1, 2, 3, 4, 5, 6] },
  ];

  // Fetch teachers and admins on component mount
  useEffect(() => {
  const fetchTeachersAndAdmins = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/teachers-and-admins`);
      setTeachersAndAdmins(response.data);
    } catch (error) {
      console.error('Error fetching teachers and admins:', error);
      setError('Failed to load teacher/admin list.');
    }
  };
  fetchTeachersAndAdmins();
}, []);


  // Handle game file selection
const handleFileChange = (e) => {
  const file = e.target.files[0];
  setGameFile(file);

  if (file) {
    const gamePath = `/games/${file.name}`;
    setGamePath(gamePath);

    // Set the game URL dynamically before uploading
    setGameUrl(`${process.env.REACT_APP_API_BASE_URL}${gamePath}`);
  }
};


  // Handle thumbnail file selection
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setThumbnailFile(file); // Set the selected thumbnail file
  };

  // Handle game detail changes (title, grade, etc.)
  const handleGameDetailChange = (e) => {
    const { name, value } = e.target;
    setGameDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Handle grade range selection and convert it to an array of grades
  const handleGradeChange = (e) => {
    const value = e.target.value;
    let grades = [];
    if (value === 'primary') {
      grades = [1, 2, 3];
    } else if (value === 'secondary') {
      grades = [4, 5, 6];
    } else if (value === 'all') {
      grades = [1, 2, 3, 4, 5, 6];
    }
    setGameDetails((prevDetails) => ({
      ...prevDetails,
      grade: grades
    }));
  };

  

// Handle game upload
const handleUpload = async () => {
  if (!gameFile || !thumbnailFile) {
    setError('Please select both a game file and a thumbnail.');
    return;
  }

  const fileExtension = gameFile.name.split('.').pop().toLowerCase();
  if (fileExtension !== 'zip' && fileExtension !== 'rar') {
    setError('Invalid file format. Please upload a .zip or .rar file.');
    return;
  }

  const formData = new FormData();
  formData.append('gameFile', gameFile);
  formData.append('gameThumbnail', thumbnailFile); // Append thumbnail file
  formData.append('title', gameDetails.title);
  // Serialize the grade array into a JSON string
  formData.append('grade', JSON.stringify(gameDetails.grade)); // Serialize the grade array
  formData.append('description', gameDetails.description);
  formData.append('createdBy', gameDetails.createdBy);
  formData.append('gameUrl', gameUrl); // Append gameUrl as a string

  try {
    setUploading(true);
    setError(null);

    const response = await axios.post(`${BASE_URL}/upload-game`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    console.log('Game uploaded successfully:', response.data);

    // Store the uploaded game path and automatically set the gameUrl
    setGamePath(response.data.gamePath);
    setGameUrl(`${process.env.REACT_APP_API_BASE_URL}${response.data.gamePath}`); // Set the game URL dynamically
    setUploading(false);
  } catch (error) {
    setUploading(false);
    console.error('Error uploading game:', error);

    // Log detailed error response for debugging
    if (error.response) {
      console.error('Server Response:', error.response.data); // Log the error message from the server
      setError(`Failed to upload game: ${error.response.data.message || error.response.statusText}`);
    } else {
      setError('Failed to upload game. Please try again.');
    }
  }
};


  return (
    <div className="d-flex flex-column vh-100">
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column">
        <AdminNavbar />
        <div className="container-fluid flex-grow-1 d-flex flex-column align-items-center justify-content-center">
          <h2 className="upload-header mb-4">Upload Unity Game</h2>
          
          <div className="form-group">
            <input 
              type="file" 
              accept=".zip,.rar" 
              className="form-control file-input" 
              onChange={handleFileChange} 
            />
          </div>

          <div className="form-group">
            <input 
              type="file" 
              accept="image/*" 
              className="form-control file-input" 
              onChange={handleThumbnailChange} 
            />
          </div>

          <div className="form-group">
            <input 
              type="text" 
              name="title"
              value={gameDetails.title}
              onChange={handleGameDetailChange}
              className="form-control"
              placeholder="Game Title"
              required 
            />
          </div>

          <div className="form-group">
            <label>Grade Level:</label>
            <select 
              name="grade"
              onChange={handleGradeChange}
              className="form-control"
              required
            >
              <option value="">Select Grade Level</option>
              <option value="primary">(Grades 1-3)</option>
              <option value="secondary">(Grades 4-6)</option>
              <option value="all">All Grades (1-6)</option>
            </select>
          </div>

          <div className="form-group">
            <textarea 
              name="description"
              value={gameDetails.description}
              onChange={handleGameDetailChange}
              className="form-control"
              placeholder="Game Description (optional)"
            />
          </div>

          <div className="form-group">
            <label>Created By</label>
            <select
              name="createdBy"
              value={gameDetails.createdBy}
              onChange={handleGameDetailChange}
              className="form-control"
              required
            >
              <option value="">Select Creator</option>
              {teachersAndAdmins.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary upload-button mt-3" onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Game'}
          </button>

          {error && <p className="text-danger error-message mt-3">{error}</p>}

          {gamePath && (
            <div className="uploaded-game-container mt-4 border p-3">
              <h3>Uploaded Game:</h3>
              <iframe
                src={gameUrl} 
                className="uploaded-game-iframe" 
                allowFullScreen
                title="Unity Game"
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameUpload;
