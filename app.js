const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const SCOPES = ['https://www.googleapis.com/auth/photoslibrary.appendonly'];

app.get('/auth', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    res.redirect(authUrl);
});

app.get('/oauth2callback', async (req, res) => {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    // Guarda el token en una sesión, base de datos, etc.
    req.session.tokens = tokens;
    res.redirect('/');
});

app.post('/upload', async (req, res) => {
    const token = req.body.token;
    oauth2Client.setCredentials({ access_token: token });

    const photos = google.photoslibrary({ version: 'v1', auth: oauth2Client });

    // Aquí puedes manejar la lógica para subir la foto a Google Photos
    res.json({ message: 'Upload successful' });
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
