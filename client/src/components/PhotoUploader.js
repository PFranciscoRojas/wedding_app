import React, { useState } from 'react';
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
  Paper,
  CardActions
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function PhotoUploader() {
  const [files, setFiles] = useState([]);
  const [uploaderName, setUploaderName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

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
    setProgress({});

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('photo', files[i]);
      formData.append('uploaderName', uploaderName);

      try {
        const response = await axios.post(`${API_URL}/photos/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(prev => ({...prev, [i]: percentCompleted}));
          }
        });
        console.log(`Foto ${i + 1} subida con éxito:`, response.data);
      } catch (error) {
        console.error(`Error al subir la foto ${i + 1}:`, error);
        setMessage(`Error al subir la foto ${files[i].name}: ${error.message}`);
      }
    }

    setUploading(false);
    setMessage('Todas las fotos han sido subidas con éxito');
    setFiles([]);
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, backgroundColor: 'background.paper', borderRadius: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          Nuestro Álbum de Boda
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
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="raised-button-file"
          multiple
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="raised-button-file">
          <Button variant="contained" component="span" fullWidth sx={{ mt: 2 }}>
            Seleccionar Fotos
          </Button>
        </label>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {files.map((file, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={URL.createObjectURL(file)}
                  alt={`Preview ${index}`}
                />
                <CardActions sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {file.name}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => removeFile(file)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
                {uploading && progress[index] !== undefined && (
                  <LinearProgress variant="determinate" value={progress[index]} />
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          startIcon={<CloudUpload />}
          fullWidth
          sx={{ mt: 2 }}
        >
          {uploading ? 'Subiendo...' : 'Subir fotos'}
        </Button>
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