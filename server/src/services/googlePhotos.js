const { google } = require('googleapis');
const axios = require('axios');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Configura el token de actualización
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const SCOPES = [
  'https://www.googleapis.com/auth/photoslibrary',
  'https://www.googleapis.com/auth/photoslibrary.sharing'
];

async function getAccessToken() {
  const { token } = await oauth2Client.getAccessToken();
  return token;
}

async function uploadPhoto(fileBuffer, albumTitle = 'Fotos de Boda', uploaderName = 'Anónimo') {
  try {
    const accessToken = await getAccessToken();

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
    try {
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

      const mediaItemId = createResponse.data.newMediaItemResults[0].mediaItem.id;

      console.log('Buscando álbum existente...');
      let albumId;
      try {
        const albumsResponse = await axios.get('https://photoslibrary.googleapis.com/v1/albums', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        
        const existingAlbum = albumsResponse.data.albums.find(album => album.title === albumTitle);
        
        if (existingAlbum) {
          albumId = existingAlbum.id;
          console.log('Álbum existente encontrado:', albumId);
        } else {
          console.log('Álbum no encontrado, creando uno nuevo...');
          const newAlbumResponse = await axios.post('https://photoslibrary.googleapis.com/v1/albums', {
            album: { title: albumTitle }
          }, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          albumId = newAlbumResponse.data.id;
          console.log('Nuevo álbum creado:', albumId);
        }
      } catch (error) {
        console.error('Error al buscar o crear álbum:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        throw error;
      }

      console.log('Añadiendo foto al álbum...');
      await axios.post(`https://photoslibrary.googleapis.com/v1/albums/${albumId}:batchAddMediaItems`, {
        mediaItemIds: [mediaItemId]
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return createResponse.data;
    } catch (error) {
      console.error('Error al crear elemento multimedia:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
      throw error;
    }
  } catch (error) {
    console.error('Error detallado al subir la foto:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    throw error;
  }
}

module.exports = { uploadPhoto };