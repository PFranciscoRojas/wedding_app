const { google } = require('googleapis');
const fs = require('fs');

// Asegúrate de que la ruta al archivo de credenciales sea correcta
const credentials = require('./credentials.json');

let client_secret, client_id, redirect_uris;

// Comprueba si las credenciales están en la estructura 'web' o en la raíz
if (credentials.web) {
  ({ client_secret, client_id, redirect_uris } = credentials.web);
} else {
  ({ client_secret, client_id, redirect_uris } = credentials);
}

// Si redirect_uris es un array, usa el primer elemento
const redirect_uri = Array.isArray(redirect_uris) ? redirect_uris[0] : redirect_uris;

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

const SCOPES = [
  'https://www.googleapis.com/auth/photoslibrary',
  'https://www.googleapis.com/auth/photoslibrary.sharing'
];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

console.log('Authorize this app by visiting this url:', authUrl);

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question('Enter the code from that page here: ', (code) => {
  readline.close();
  oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    console.log('Refresh token:', token.refresh_token);
    // Opcionalmente, guarda el token completo en un archivo
    fs.writeFileSync('token.json', JSON.stringify(token));
  });
});