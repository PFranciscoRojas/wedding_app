const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const photosRoutes = require('./routes/photos');
const generateQR = require('./utils/generateQR');

const app = express();
app.use(cors());
app.use(express.json());

// Asegúrate de que este path sea correcto
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/photos', photosRoutes);

// Generar código QR
const APP_URL = 'http://localhost:3000';  // Cambia esto a la URL de tu aplicación en producción
generateQR(APP_URL).then(qrPath => {
  app.get('/qr', (req, res) => {
    res.json({ qrPath });
  });
}).catch(console.error);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));