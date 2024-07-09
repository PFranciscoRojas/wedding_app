const express = require('express');
const path = require('path');
const authRoutes = require('./routes/auth');
const photosRoutes = require('./routes/photos');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Sirve los archivos estáticos del build de React
app.use(express.static(path.join(__dirname, '../../client/build')));

app.use('/auth', authRoutes);
app.use('/api/photos', photosRoutes);

// Maneja cualquier solicitud que no coincida con las rutas anteriores
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));