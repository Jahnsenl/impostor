import { useGame } from '../context/GameContext';

const PLAYER_EMOJIS = ['👑', '🤖', '🧙‍♂️', '🕵️', '🦊', '🐺', '🦁', '🐉'];

export function Voting() {
  const { gameState, currentUserId, submitVote } = useGame();
  const currentPlayer = gameState.players.find(p => p.id === currentUserId);

  if (!currentPlayer) return null;

  const votedCount = gameState.players.filter(p => p.hasVoted).length;
  const totalCount = gameState.players.length;

  const displayName = (playerId: string, username: string) => {
    const idx = gameState.players.findIndex(p => p.id === playerId);
    const emoji = PLAYER_EMOJIS[idx] ?? '👤';
    const name = username || `Jugador ${idx + 1}`;
    return { emoji, name };
  };

  return (
    <div className="voting">
      <h1>🗳️ Votación</h1>
      <p className="progress">Votos: {votedCount}/{totalCount}</p>

      {currentPlayer.hasVoted ? (
        <div className="vote-submitted">
          <h2>✅ Has votado</h2>
          <p>Esperando a que los demás jugadores voten...</p>
        </div>
      ) : (
        <div className="vote-options">
          <h2>¿Quién es el impostor?</h2>
          <div className="players-grid">
            {gameState.players
              .filter(p => !p.isEliminated && p.id !== currentUserId)
              .map(player => {
                const { emoji, name } = displayName(player.id, player.username);
                return (
                  <button
                    key={player.id}
                    className="vote-card"
                    onClick={() => submitVote(player.id)}
                  >
                    {player.avatar
                      ? <img src={player.avatar} alt={name} className="vote-avatar" />
                      : <span className="vote-emoji">{emoji}</span>
                    }
                    <span className="vote-name">{name}</span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      <div className="vote-status">
        <h3>Estado de votación:</h3>
        {gameState.players.map(player => {
          const { emoji, name } = displayName(player.id, player.username);
          return (
            <div key={player.id} className="vote-item">
              <span>{emoji} {name}</span>
              <span className={player.isEliminated ? 'eliminated' : player.hasVoted ? 'voted' : 'pending'}>
                {player.isEliminated ? '💀 Eliminado' : player.hasVoted ? '✅ Votado' : '⏳ Pendiente'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
