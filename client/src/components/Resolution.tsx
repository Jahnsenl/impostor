import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export function Resolution() {
  const { gameState, currentUserId, submitImpostorGuess } = useGame();
  const [guess, setGuess] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const currentPlayer = gameState.players.find(p => p.id === currentUserId);

  useEffect(() => {
    if (!gameState.resolutionStartTime) return;
    const calc = () => Math.max(0, 30 - Math.floor((Date.now() - gameState.resolutionStartTime!) / 1000));
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 500);
    return () => clearInterval(interval);
  }, [gameState.resolutionStartTime]);

  if (!currentPlayer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim() && !submitted) {
      setSubmitted(true);
      submitImpostorGuess(guess.trim());
    }
  };

  if (!currentPlayer.isImpostor) {
    const eliminatedImpostors = gameState.players.filter(p => p.isImpostor && p.isEliminated);
    return (
      <div className="resolution">
        <h1>⏳ Esperando a los impostores</h1>
        <p>Todos los impostores han sido descubiertos y tienen una última oportunidad...</p>

        <div className="eliminated-info">
          <h2>Impostores eliminados:</h2>
          <ul>
            {eliminatedImpostors.map(player => (
              <li key={player.id}>{player.username}</li>
            ))}
          </ul>
        </div>

        <p>Los impostores están intentando adivinar la palabra secreta.</p>
      </div>
    );
  }

  return (
    <div className="resolution">
      <h1>🎯 Última oportunidad</h1>
      <p>¡Te han descubierto! Pero aún puedes ganar si adivinas la palabra.</p>
      <div className={`timer ${timeLeft <= 10 ? 'danger' : timeLeft <= 20 ? 'warning' : ''}`}>
        {timeLeft}s
      </div>

      <div className="eliminated-info">
        <h2>Has sido eliminado</h2>
        <p>Eras el impostor.</p>
      </div>

      {submitted ? (
        <div className="vote-submitted">
          <h2>✅ Respuesta enviada</h2>
          <p>Esperando resultado...</p>
        </div>
      ) : (
        <form className="guess-form" onSubmit={handleSubmit}>
          <h2>¿Cuál es la palabra secreta?</h2>
          {currentPlayer.impostorHint && (
            <p className="hint">Tu pista: {currentPlayer.impostorHint}</p>
          )}
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Escribe tu respuesta..."
            autoFocus
          />
          <button type="submit" disabled={!guess.trim()}>
            Adivinar
          </button>
        </form>
      )}
    </div>
  );
}
