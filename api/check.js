const axios = require('axios');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sadece GET isteklerine izin ver
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Prediction ID is required' });
  }

  // API key'i environment variable'dan al
  const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
  if (!REPLICATE_API_KEY) {
    return res.status(500).json({ error: 'API key is not configured' });
  }

  try {
    // Replicate API'ye istek
    const response = await axios.get(
      `https://api.replicate.com/v1/predictions/${id}`,
      {
        headers: {
          'Authorization': `Token ${REPLICATE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Sonucu döndür
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error details:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({ 
      error: 'Error checking prediction status',
      details: error.response?.data || error.message 
    });
  }
};