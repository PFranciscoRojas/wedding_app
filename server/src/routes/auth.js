const express = require('express');
const { getAuthUrl, getTokensWithCode } = require('../services/googlePhotos');

const router = express.Router();

router.get('/google', (req, res) => {
  console.log('Iniciando autenticación con Google');
  const authUrl = getAuthUrl();
  console.log('URL de autenticación:', authUrl);
  res.redirect(authUrl);
});

router.get('/google/callback', async (req, res) => {
  console.log('Callback de Google recibido');
  const { code } = req.query;
  console.log('Código recibido:', code);
  try {
    const tokens = await getTokensWithCode(code);
    console.log('Tokens obtenidos:', tokens);
    
    // Redirige al usuario a la página de carga de fotos con los tokens como parámetros de consulta
    const redirectUrl = `${process.env.CLIENT_URL}/upload?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`;
    console.log('Redirigiendo a:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error en la autenticación:', error);
    res.redirect(`${process.env.CLIENT_URL}/error?message=${encodeURIComponent('Error en la autenticación')}`);
  }
});

module.exports = router;