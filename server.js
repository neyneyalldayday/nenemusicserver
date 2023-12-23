import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let accessToken = '';

app.post('/get-token', async (req, res) => {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const tokenEndpoint = "https://accounts.spotify.com/api/token";

  const requestBody = new URLSearchParams();
  requestBody.append('grant_type', 'client_credentials');
  requestBody.append('client_id', clientId);
  requestBody.append('client_secret', clientSecret);

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: requestBody
    });

    if (response.ok) {
      const data = await response.json();
      accessToken = data.access_token; 
      res.json(data); // Sending token data back to the client
    } else {
      throw new Error('Failed to fetch token');
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get("/search", async (req,res) => {
    const searchQuery = req.query.q;
    const searchType = req.query.type || 'artist'
    if(!accessToken) {
        return res.status(401).json({error: "no access token available"})
    }

    const endpoint = `https://api.spotify.com/v1/search?q=${searchQuery}&type=${searchType}`
   
    try {
     const response = await fetch(endpoint,  {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
     });
     if(response.ok){
        const data = await response.json();
        res.json(data)
     } else {
        throw new Error('Failed to fetch')
     }  
    } catch (err) {
        console.error(err)
        res.status(500).json({error: err.message})
        
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
