import React, { useState, useCallback } from 'react';
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
  TextField,
  Paper
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';

const ALBUM_TITLE = 'Fotos de Boda';

function PhotoUploader() {
  const [files, setFiles] = useState([]);
  const [uploaderName, setUploaderName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

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

    setUploading(true);
    setMessage('');
    setProgress(0);

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('photo', files[i]);
      formData.append('albumTitle', ALBUM_TITLE);
      formData.append('uploaderName', uploaderName);

      try {
        await axios.post('http://localhost:5001/api/photos/upload', formData, {
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
      <Paper elevation={3} sx={{ p: 4, mt: 4, backgroundColor: 'background.paper', borderRadius: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          Fotos Boda Marcela y Pacho
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
          {ALBUM_TITLE}
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
            border: '2px dashed',
            borderColor: 'primary.main',
            borderRadius: 4,
            p: 2,
            mt: 2,
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(212, 165, 165, 0.1)'
            }
          }}
        >
          <input {...getInputProps()} />
          {
            isDragActive ?
              <Typography color="primary">Suelta las fotos aquí ...</Typography> :
              <Typography color="text.secondary">Arrastra y suelta algunas fotos aquí, o haz clic para seleccionar fotos</Typography>
          }
        </Box>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {files.map((file, index) => (
            <Grid item xs={4} key={index}>
              <Card sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={URL.createObjectURL(file)}
                  alt={`Preview ${index}`}
                />
                <IconButton 
                  size="small" 
                  onClick={() => removeFile(file)}
                  sx={{ 
                    position: 'absolute', 
                    top: 5, 
                    right: 5, 
                    color: 'white', 
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.5)'
                    }
                  }}
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
      </Paper>
    </Container>
  );
}

export default PhotoUploader;