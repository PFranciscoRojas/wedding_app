import React from 'react';
import { Button, Container, Typography, Box } from '@mui/material';

function Home() {
  const handleLogin = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'https://wedding-photo-app-c2vxztagma-uc.a.run.app';
    const loginUrl = `${apiUrl}/auth/google`;
    console.log('Login URL:', loginUrl);
    window.location.href = loginUrl;
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Álbum de Fotos de Boda
        </Typography>
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Iniciar sesión con Google
        </Button>
      </Box>
    </Container>
  );
}

export default Home;