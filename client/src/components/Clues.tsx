import { useState } from 'react';
import { useGame } from '../context/GameContext';

export function Clues() {
  const { gameState, currentUserId, submitClue } = useGame();
  const [clue, setClue] = useState('');
  const currentPlayer = gameState.players.find(p => p.id === currentUserId);

  if (!currentPlayer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clue.trim()) {
      submitClue(clue.trim());
    }
  };

  const submittedCount = gameState.players.filter(p => p.clue).length;
  const totalCount = gameState.players.length;

  return (
    <div className="clues">
      <h1>Fase de Pistas</h1>
      <p className="progress">Jugadores que han dado su pista: {submittedCount}/{totalCount}</p>

      {currentPlayer.clue ? (
        <div className="clue-submitted">
          <h2>✅ Tu pista ha sido enviada</h2>
          <p>Esperando a que los demás jugadores den sus pistas...</p>
        </div>
      ) : (
        <form className="clue-form" onSubmit={handleSubmit}>
          <h2>Escribe tu pista</h2>
          <p className="instruction">
            {currentPlayer.isImpostor 
              ? 'No conoces la palabra. Intenta decir algo coherente basándote en la pista.'
              : 'Da una pista clara pero sin revelar la palabra directamente.'}
          </p>
          <input
            type="text"
            value={clue}
            onChange={(e) => setClue(e.target.value)}
            placeholder="Ej: Italia, Queso, Compartir..."
            maxLength={100}
            autoFocus
          />
          <button type="submit" disabled={!clue.trim()}>
            Enviar pista
          </button>
        </form>
      )}

      <div className="clues-list">
        <h3>Pistas enviadas:</h3>
        {gameState.players.filter(p => p.clue).map(player => (
          <div key={player.id} className="clue-item">
            <span className="player-name">{player.username}:</span>
            <span className="clue-text">{player.clue}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
