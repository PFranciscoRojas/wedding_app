import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      fetch(`${process.env.REACT_APP_API_URL}/auth/google/callback?code=${code}`)
        .then(response => response.json())
        .then(data => {
          localStorage.setItem('accessToken', data.tokens.access_token);
          navigate('/upload');
        })
        .catch(error => {
          console.error('Error en la autenticación:', error);
          navigate('/');
        });
    } else {
      navigate('/');
    }
  }, [navigate]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}

export default AuthCallback;