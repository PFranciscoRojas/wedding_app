import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { 
  Button, 
  Container, 
  Typography, 
  Box, 
  LinearProgress, 
  Grid, 
  Card, 
  CardMedia, 
  IconButton,
  TextField
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';

const ALBUM_TITLE = 'Fotos de Boda';

function PhotoUploader() {
  const [files, setFiles] = useState([]);
  const [uploaderName, setUploaderName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('access_token');
    if (token) {
      setAccessToken(token);
      localStorage.setItem('accessToken', token);
      // Opcionalmente, puedes limpiar los parámetros de la URL aquí
    }
  }, [location]);

  const onDrop = useCallback(acceptedFiles => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: 'image/*',
    multiple: true
  });

  const handleUploaderNameChange = (e) => {
    setUploaderName(e.target.value);
  };

  const removeFile = (fileToRemove) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage('Por favor, selecciona al menos una foto');
      return;
    }

    if (!uploaderName.trim()) {
      setMessage('Por favor, ingresa tu nombre');
      return;
    }

   const token = accessToken || localStorage.getItem('accessToken');
    if (!token) {
      setMessage('No hay token de acceso. Por favor, inicia sesión nuevamente.');
      return;
    }

    setUploading(true);
    setMessage('');
    setProgress(0);
    const apiUrl = process.env.REACT_APP_API_URL || 'https://wedding-photo-app-c2vxztagma-uc.a.run.app';

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('photo', files[i]);
      formData.append('albumTitle', ALBUM_TITLE);
      formData.append('uploaderName', uploaderName);
      formData.append('accessToken', accessToken);

      try {
        await axios.post(`${apiUrl}/api/photos/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        });
        setProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        console.error('Error al subir la foto:', error);
        setMessage(`Error al subir la foto ${files[i].name}: ${error.message}`);
      }
    }

    setMessage('Todas las fotos han sido subidas con éxito');
    setUploading(false);
    setFiles([]);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Sube tus fotos de boda
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom align="center">
          Álbum: {ALBUM_TITLE}
        </Typography>
        <TextField
          fullWidth
          label="Tu nombre"
          variant="outlined"
          value={uploaderName}
          onChange={handleUploaderNameChange}
          margin="normal"
          disabled={uploading}
          required
        />
        <Box 
          {...getRootProps()} 
          sx={{
            border: '2px dashed #eeeeee',
            borderRadius: 2,
            p: 2,
            mt: 2,
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#fafafa'
            }
          }}
        >
          <input {...getInputProps()} />
          {
            isDragActive ?
              <Typography>Suelta las fotos aquí ...</Typography> :
              <Typography>Arrastra y suelta algunas fotos aquí, o haz clic para seleccionar fotos</Typography>
          }
        </Box>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {files.map((file, index) => (
            <Grid item xs={4} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={URL.createObjectURL(file)}
                  alt={`Preview ${index}`}
                />
                <IconButton 
                  size="small" 
                  onClick={() => removeFile(file)}
                  sx={{ position: 'absolute', top: 0, right: 0, color: 'white', backgroundColor: 'rgba(0,0,0,0.3)' }}
                >
                  <Delete />
                </IconButton>
              </Card>
            </Grid>
          ))}
        </Grid>
        {files.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={uploading}
            startIcon={<CloudUpload />}
            fullWidth
            sx={{ mt: 2 }}
          >
            {uploading ? 'Subiendo...' : 'Subir fotos'}
          </Button>
        )}
        {uploading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}
        {message && (
          <Typography color="error" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Box>
    </Container>
  );
}

export default PhotoUploader;