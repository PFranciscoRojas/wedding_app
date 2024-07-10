const express = require('express');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const photosRoutes = require('./routes/photos');
const QRCode = require('qrcode');

const app = express();

app.use(cors());
app.use(express.json());

// Sirve los archivos estáticos de React
app.use(express.static(path.join(__dirname, '../../client/build')));

app.use('/api/auth', authRoutes);
app.use('/api/photos', photosRoutes);

// Maneja cualquier solicitud que no coincida con las rutas anteriores
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
});


app.get('/api/qr', async (req, res) => {
  console.log('Received request for QR code');
  try {
    const appUrl = process.env.APP_URL || 'https://tu-app-url.com';
    console.log('Generating QR code for URL:', appUrl);
    const qrCodeBuffer = await QRCode.toBuffer(appUrl);
    console.log('QR code generated successfully, buffer length:', qrCodeBuffer.length);
    res.type('image/png').send(qrCodeBuffer);
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).send('Error generating QR code');
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));