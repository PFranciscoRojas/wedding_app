import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';

function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (name) => {
    setLoggedIn(true);
    navigate('/upload');
  };

  return (
    <div>
      <h1>Boda de Marcela y Pacho</h1>
      {!loggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <button onClick={() => navigate('/upload')}>Subir fotos</button>
      )}
    </div>
  );
}

export default Home;