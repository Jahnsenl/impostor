import { useGame } from '../context/GameContext';

export function Revealing() {
  const { gameState, currentUserId, startDebate } = useGame();
  const currentPlayer = gameState.players.find(p => p.id === currentUserId);

  if (!currentPlayer) return null;

  return (
    <div className="revealing">
      <h1>Tu rol</h1>

      {currentPlayer.isImpostor ? (
        <div className="role-card impostor">
          <h2>🎭 Eres el IMPOSTOR</h2>
          <p>No conoces la palabra secreta.</p>
          {currentPlayer.impostorHint && (
            <p className="hint">Tu pista: {currentPlayer.impostorHint}</p>
          )}
          <p className="instruction">
            Debes fingir que conoces la palabra y evitar ser descubierto.
            Escucha las pistas de los demás para deducir la palabra.
          </p>
        </div>
      ) : (
        <div className="role-card innocent">
          <h2>👤 Eres un JUGADOR</h2>
          <p className="secret-word">Palabra secreta:</p>
          <h2 className="word">{gameState.secretWord}</h2>
          <p className="instruction">
            Debes dar una pista que demuestre que conoces la palabra,
            pero sin revelarla directamente.
          </p>
        </div>
      )}

      <button className="continue-button" onClick={startDebate}>
        ¡Listo!
      </button>
    </div>
  );
}
