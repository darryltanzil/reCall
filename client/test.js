const axios = require('axios');
const fs = require('fs');
const path = require('path');

const serverUrl = 'http://localhost:3001';
const vercelUrl = 'https://recall-lpykgnofi-skyleapas-projects.vercel.app';
const waterbottle_table_path = path.join(__dirname, 'waterbottle_table.png');
const waterbottle_floor_path = path.join(__dirname, 'waterbottle_floor.png');

const waterbottle_table = fs.readFileSync(waterbottle_table_path, { encoding: 'base64' });
const waterbottle_floor = fs.readFileSync(waterbottle_floor_path, { encoding: 'base64' });

// Mock data for POST /frame
const mockFrameData1 = {
  transcript: 'sitting at a table. moves white waterbottle from the left side of a wooden table to the right side of the table',
  timestamp: new Date().toISOString(),
  context: {
      objects: ['table', 'water bottle'],
      actions: 'move water bottle ahhhh',
      location: "table",
      image: "waterbottle_table"
  }
};

const mockFrameData2 = {
  transcript: 'sitting at a table. moves white waterbottle from the right side of a wooden table to the floor',
  timestamp: new Date().toISOString(),
  context: {
      objects: ['table', 'water bottle', 'floor'],
      actions: 'move water bottle',
      location: "floor",
      image: "waterbottle_floor"
  }
};

// Mock data for GET /find
const mockFindQuery = {
  object: 'water bottle'
};

const mockFindQuery2 = {
  object: 'mouse'
};

const mockActionQuery = {
  question: 'did I leave my water bottle on the table?'
};

// Function to test POST /frame
const testPostFrame = async () => {
  try {
    const response = await axios.post(`${serverUrl}/frame`, mockFrameData1);
    console.log('POST /frame response 1:', response.data);

    const response2 = await axios.post(`${serverUrl}/frame`, mockFrameData2);
    console.log('POST /frame response 2:', response.data);
  } catch (error) {
    console.error('Error during POST /frame request:', error.response ? error.response.data : error.message);
  }
};

// Function to test GET /find
const testGetFind = async () => {
  try {
    const response = await axios.get(`${serverUrl}/find`, { params: mockFindQuery2 });
    console.log('GET /find response:', response.data);
  } catch (error) {
    console.error('Error during GET /find request:', error.response ? error.response.data : error.message);
  }
};

// Function to test GET /action
const testGetAction = async () => {
  try {
    const response = await axios.get(`${serverUrl}/action`, { params: mockActionQuery });
    console.log('GET /action response:', response.data);
  } catch (error) {
    console.error('Error during GET /action request:', error.response ? error.response.data : error.message);
  }
};

// Run tests
const runTests = async () => {

  // axios.post(vercelUrl, mockFrameData1)
  // .then(response => {
  //   console.log('Response:', response.data);
  // })
  // .catch(error => {
  //   console.error('Error:', error);
  // });
  const mockActionQuery3 = {
    question: 'where did i put my wallet?'
  };
  
  axios.get(vercelUrl, {
    params: mockActionQuery3  // Send query parameters properly
  })
  .then(response => {
    // Assuming response.data contains an object with a "response" field
    console.log('Response:', response.data.response);
  })
  .catch(error => {
    console.error('Error:', error);
  });

  //console.log('Running tests...');
  
  // await testPostFrame();
  // await testGetFind();
  // await testGetAction();
};

// Execute the test functions
runTests();
