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
    
    // Replicate API'sine gönderilecek istek gövdesini oluştur
    let apiRequestBody;
    
    // version formatını kontrol et - doğru format: tam hash (d1d6ea8c8be89d664a07a45726f7128109dee7030fdac424788d762c71ed111)
    if (req.body.version && req.body.version.includes('/')) {
      // Eğer version "owner/model:version" veya "owner/model" formatındaysa düzelt
      const parts = req.body.version.split(':');
      if (parts.length > 1) {
        // owner/model:version formatı
        apiRequestBody = {
          version: parts[1], // Sadece version kısmını al
          input: req.body.input
        };
      } else {
        // Muhtemelen model ID'si veriliyor, kullanıcıdan hash istememiz gerekiyor
        return res.status(400).json({ 
          error: 'Invalid version format', 
          details: 'Please provide the full version hash, not just the model name' 
        });
      }
    } else if (req.body.model && req.body.version) {
      // Eğer model ve version ayrı ayrı verilmişse
      apiRequestBody = {
        version: req.body.version, // Direkt versiyon hash'i
        input: req.body.input
      };
    } else {
      // Sadece version hash'i verilmişse
      apiRequestBody = {
        version: req.body.version,
        input: req.body.input
      };
    }
    
    console.log('Sending to Replicate API:', JSON.stringify(apiRequestBody));
    
    // Replicate API'ye istek
    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      apiRequestBody,
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