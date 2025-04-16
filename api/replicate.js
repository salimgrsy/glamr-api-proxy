const axios = require('axios');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sadece POST isteklerine izin ver
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // API key'i environment variable'dan al
  const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
  if (!REPLICATE_API_KEY) {
    return res.status(500).json({ error: 'API key is not configured' });
  }

  try {
    console.log('Request body:', JSON.stringify(req.body));
    
    // Replicate API'ye istek
    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      req.body,
      {
        headers: {
          'Authorization': `Token ${REPLICATE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Replicate response:', JSON.stringify(response.data));
    
    // Sonucu döndür
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error details:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({ 
      error: 'Error making API request',
      details: error.response?.data || error.message 
    });
  }
};