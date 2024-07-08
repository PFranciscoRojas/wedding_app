const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const axios = require('axios');

const SCOPES = ['https://www.googleapis.com/auth/photoslibrary'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');


async function createAlbum(accessToken, albumTitle) {
  try {
    const response = await axios.post('https://photoslibrary.googleapis.com/v1/albums', 
      { album: { title: albumTitle } },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.id;
  } catch (error) {
    console.error('Error al crear el álbum:', error.response ? error.response.data : error.message);
    throw error;
  }
}
async function getOrCreateAlbum(accessToken, albumTitle) {
  try {
    // Primero, intentamos encontrar el álbum existente
    const albumsResponse = await axios.get('https://photoslibrary.googleapis.com/v1/albums', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    
    const existingAlbum = albumsResponse.data.albums.find(album => album.title === albumTitle);
    
    if (existingAlbum) {
      return existingAlbum.id;
    }
    
    // Si no existe, creamos uno nuevo
    return await createAlbum(accessToken, albumTitle);
  } catch (error) {
    console.error('Error al obtener o crear el álbum:', error.response ? error.response.data : error.message);
    throw error;
  }
}
async function addPhotoToAlbum(accessToken, albumId, mediaItemId) {
  try {
    await axios.post(`https://photoslibrary.googleapis.com/v1/albums/${albumId}:batchAddMediaItems`,
      { mediaItemIds: [mediaItemId] },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error al añadir la foto al álbum:', error.response ? error.response.data : error.message);
    throw error;
  }
}

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    // Verificar si el token ha expirado y renovarlo si es necesario
    if (client.credentials && client.credentials.expiry_date < Date.now()) {
      try {
        await client.refreshAccessToken();
        await saveCredentials(client);
      } catch (err) {
        console.error('Error al renovar el token:', err);
        client = null;
      }
    }
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

// ... (importaciones y funciones existentes)

async function uploadPhoto(filePath, albumTitle = 'Fotos de Boda', uploaderName = 'Anónimo') {
  const auth = await authorize();
  let accessToken = auth.credentials.access_token;

  const refreshAccessToken = async () => {
    try {
      await auth.refreshAccessToken();
      await saveCredentials(auth);
      accessToken = auth.credentials.access_token;
    } catch (err) {
      console.error('Error al renovar el token de acceso:', err);
      throw err;
    }
  };

  try {
    console.log('Leyendo archivo...');
    const fileContent = await fs.readFile(filePath);

    console.log('Subiendo archivo a Google Photos...');
    let uploadResponse;
    try {
      uploadResponse = await axios.post('https://photoslibrary.googleapis.com/v1/uploads', fileContent, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/octet-stream',
          'X-Goog-Upload-Protocol': 'raw',
        },
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await refreshAccessToken();
        uploadResponse = await axios.post('https://photoslibrary.googleapis.com/v1/uploads', fileContent, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/octet-stream',
            'X-Goog-Upload-Protocol': 'raw',
          },
        });
      } else {
        throw error;
      }
    }

    const uploadToken = uploadResponse.data;
    console.log('Upload token recibido:', uploadToken);

    console.log('Creando nuevo elemento multimedia...');
    let createResponse;
    try {
      createResponse = await axios.post('https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate', {
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
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await refreshAccessToken();
        createResponse = await axios.post('https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate', {
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
      } else {
        throw error;
      }
    }

    console.log('Respuesta de creación:', createResponse.data);

    const mediaItemId = createResponse.data.newMediaItemResults[0].mediaItem.id;

    console.log('Obteniendo o creando álbum...');
    const albumId = await getOrCreateAlbum(accessToken, albumTitle);

    console.log('Añadiendo foto al álbum...');
    await addPhotoToAlbum(accessToken, albumId, mediaItemId);

    return createResponse.data;
  } catch (error) {
    console.error('Error detallado al subir la foto:', error.response ? error.response.data : error.message);
    throw error;
  }
}
module.exports = { uploadPhoto };
