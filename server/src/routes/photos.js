const express = require('express');
const multer = require('multer');
const { uploadPhoto } = require('../services/googlePhotos');

const router = express.Router();
const upload = multer({ memory: true });

router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }

    const { albumTitle, uploaderName, accessToken } = req.body;
    
    console.log('Iniciando carga de foto...');
    const result = await uploadPhoto(req.file.buffer, albumTitle, uploaderName, accessToken);
    console.log('Foto cargada exitosamente:', result);
    
    res.json({ message: 'Foto subida con éxito al álbum', result });
  } catch (error) {
    console.error('Error en la ruta de subida:', error);
    res.status(500).json({ message: 'Error al subir la foto', error: error.message });
  }
});

module.exports = router;