const request = require('request');

function chatGPT(req, res) {
    // Request body containing the data to be sent
    const requestBody = req.body;


  // Options for the external API call
  const options = {
      method: 'POST',
      url: 'https://chatgpt-api8.p.rapidapi.com/',
      headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': '0f376ee3a1msh35eb8d384d222e9p136bb8jsncaa1998c71f8',
          'X-RapidAPI-Host': 'chatgpt-api8.p.rapidapi.com'
      },
      body: requestBody,
      json: true
  };

  // Make the external API call using the request library
  request(options, (error, response, body) => {
      if (error) {
          console.error('Error sending request:', error);
          res.status(500).json({ error: 'Internal Server Error' });
      } else {
          res.json(body);
      }
  });
}
// openai.js

module.exports = { chatGPT };