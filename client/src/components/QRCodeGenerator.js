import React from 'react';
import { Container, Paper, Typography } from '@mui/material';
import QRCode from 'qrcode.react';

function QRCodeGenerator() {
  const appUrl = process.env.REACT_APP_FRONTEND_URL || 'https://wedding-photo-app-c2vxztagma-uc.a.run.app';

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, backgroundColor: 'background.paper', borderRadius: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Código QR para Subir Fotos
        </Typography>
        <Typography variant="body1" gutterBottom>
          Escanea este código QR con tu smartphone para acceder a la aplicación de fotos de boda.
        </Typography>
        <QRCode value={appUrl} size={256} />
      </Paper>
    </Container>
  );
}

export default QRCodeGenerator;