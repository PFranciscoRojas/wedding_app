const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const APP_URL = process.env.APP_URL || 'http://localhost:8080';

async function generateQR() {
  const publicDir = path.join(__dirname, '../../public');
  const outputPath = path.join(publicDir, 'wedding-photos-qr.png');
  
  // Asegúrate de que la carpeta public exista
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  try {
    await QRCode.toFile(outputPath, APP_URL, {
      color: {
        dark: '#D4A5A5',  // Color palo de rosa
        light: '#FFFFFF'  // Fondo blanco
      },
      width: 300,
      margin: 1
    });
    console.log('QR Code generado con éxito');
    return '/wedding-photos-qr.png';  // Ruta relativa para acceder desde el cliente
  } catch (err) {
    console.error('Error al generar el código QR:', err);
    throw err;
  }
}

module.exports = generateQR;