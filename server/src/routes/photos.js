const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadPhoto } = require('../services/googlePhotos');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }

    const albumTitle = req.body.albumTitle || 'Fotos de Boda';
    const uploaderName = req.body.uploaderName || 'Anónimo';
    const result = await uploadPhoto(req.file.path, albumTitle, uploaderName);
    res.json({ message: 'Foto subida con éxito al álbum', result });
  } catch (error) {
    console.error('Error en la ruta de subida:', error);
    res.status(500).json({ message: 'Error al subir la foto', error: error.message });
  }
});

module.exports = router;