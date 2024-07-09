const { google } = require('googleapis');
const axios = require('axios');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/photoslibrary.appendonly'];

function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
}

async function getTokensWithCode(code) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

async function uploadPhoto(fileBuffer, albumTitle = 'Fotos de Boda', uploaderName = 'Anónimo', accessToken) {
  try {
    console.log('Subiendo archivo a Google Photos...');
    const uploadResponse = await axios.post('https://photoslibrary.googleapis.com/v1/uploads', fileBuffer, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
        'X-Goog-Upload-Protocol': 'raw',
      },
    });

    const uploadToken = uploadResponse.data;
    console.log('Upload token recibido:', uploadToken);

    console.log('Creando nuevo elemento multimedia...');
    const createResponse = await axios.post('https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate', {
      newMediaItems: [
        {
          description: `Foto subida por ${uploaderName}`,
          simpleMediaItem: {
            uploadToken: uploadToken,
          },
        },
      ],
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Respuesta de creación:', JSON.stringify(createResponse.data, null, 2));
    return createResponse.data;
  } catch (error) {
    console.error('Error detallado al subir la foto:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    throw error;
  }
}

module.exports = { getAuthUrl, getTokensWithCode, uploadPhoto };