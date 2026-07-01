import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';

export function Debate() {
  const { gameState, currentUserId, startVoting } = useGame();
  const currentPlayer = gameState.players.find(p => p.id === currentUserId);
  const [timeLeft, setTimeLeft] = useState(gameState.debateTime * 60);
  const startVotingRef = useRef(startVoting);
  startVotingRef.current = startVoting;

  useEffect(() => {
    const totalSeconds = gameState.debateTime * 60;

    if (gameState.debateStartTime) {
      const elapsed = Math.floor((Date.now() - gameState.debateStartTime) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0) {
        startVotingRef.current();
        return;
      }
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          startVotingRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.debateStartTime, gameState.debateTime]);

  if (!currentPlayer) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="debate">
      {currentPlayer.isImpostor ? (
        <div className="role-card impostor">
          <h2>🎭 Eres el IMPOSTOR</h2>
          <p>No conoces la palabra secreta.</p>
          {currentPlayer.impostorHint && (
            <p className="hint">Tu pista: <strong>{currentPlayer.impostorHint}</strong></p>
          )}
          <p className="instruction">Finge que conoces la palabra y evita ser descubierto.</p>
        </div>
      ) : (
        <div className="role-card innocent">
          <h2>👤 Eres un JUGADOR</h2>
          <p className="secret-word">Palabra secreta:</p>
          <h2 className="word">{gameState.secretWord}</h2>
          <p className="instruction">Da una pista sin revelar la palabra directamente.</p>
        </div>
      )}

      <div className="timer-display">
        <div className={`timer ${timeLeft <= 60 ? 'warning' : ''} ${timeLeft <= 30 ? 'danger' : ''}`}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
        <p className="timer-label">Tiempo de debate</p>
      </div>

      <button className="vote-button" onClick={startVoting}>
        Votar
      </button>
    </div>
  );
}
