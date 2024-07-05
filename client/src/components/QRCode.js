// client/src/components/QRCode.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import axios from 'axios';

function QRCode() {
  const [qrPath, setQrPath] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5001/qr')
      .then(response => {
        setQrPath(`http://localhost:5001${response.data.qrPath}`);
      })
      .catch(error => {
        console.error('Error al obtener el código QR:', error);
      });
  }, []);

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, backgroundColor: 'background.paper', borderRadius: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Comparte tus fotos de nuestra boda
        </Typography>
        <Typography variant="body1" gutterBottom>
          Escanea este código QR con tu smartphone para acceder a nuestra aplicación de fotos de boda.
        </Typography>
        <Box sx={{ mt: 3 }}>
          {qrPath && <img src={qrPath} alt="QR Code" style={{ maxWidth: '100%', height: 'auto' }} />}
        </Box>
      </Paper>
    </Container>
  );
}

export default QRCode;