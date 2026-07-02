import { useGame } from '../context/GameContext';

const PLAYER_EMOJIS = ['👑', '🤖', '🧙‍♂️', '🕵️', '🦊', '🐺', '🦁', '🐉'];
const MAX_PLAYERS = 8;

export function Lobby() {
  const { gameState, startGame, setImpostorCount, setDebateTime, setGiveImpostorHint, authStep } = useGame();
  const maxImpostors = Math.max(1, Math.floor(gameState.players.length / 2));

  const handleImpostorChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(maxImpostors, gameState.impostorCount + delta));
    setImpostorCount(newCount);
  };

  const handleTimeChange = (delta: number) => {
    const newTime = Math.max(1, Math.min(30, gameState.debateTime + delta));
    setDebateTime(newTime);
  };

  const slots = Array.from({ length: MAX_PLAYERS }, (_, i) => ({
    player: gameState.players[i] || null,
    emoji: PLAYER_EMOJIS[i],
    slot: i + 1,
  }));

  const canStart = gameState.players.length >= 3;

  return (
    <div className="lobby">
      <h1>🎭 Impostor</h1>
      <p>Juego de deducción social para Discord</p>
      <p style={{ fontSize: '0.6rem', opacity: 0.5, margin: '-8px 0 4px', letterSpacing: '0.02em' }}>
        auth: {authStep}
      </p>

      <div className="players-list">
        <h2>Jugadores ({gameState.players.length}/{MAX_PLAYERS})</h2>
        <ul className="player-slots">
          {slots.map(({ player, emoji, slot }) => (
            <li key={slot} className={player ? 'slot filled' : 'slot empty'}>
              {player?.avatar
                ? <img src={player.avatar} alt={player.username} className="slot-avatar" />
                : <span className="slot-emoji">{emoji}</span>
              }
              <span className="slot-name">
                {player ? player.username : `Jugador ${slot}`}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="settings-container">
        <div className="impostor-selector">
          <h3>Número de impostores:</h3>
          <div className="counter-control">
            <button
              className="counter-btn"
              onClick={() => handleImpostorChange(-1)}
              disabled={gameState.impostorCount <= 1}
            >
              -
            </button>
            <span className="counter-value">{gameState.impostorCount}</span>
            <button
              className="counter-btn"
              onClick={() => handleImpostorChange(1)}
              disabled={gameState.impostorCount >= maxImpostors}
            >
              +
            </button>
          </div>
          <p className="setting-info">{gameState.impostorCount} impostor(es)</p>
        </div>

        <div className="time-selector">
          <h3>Tiempo de debate:</h3>
          <div className="counter-control">
            <button
              className="counter-btn"
              onClick={() => handleTimeChange(-1)}
              disabled={gameState.debateTime <= 1}
            >
              -
            </button>
            <span className="counter-value">{gameState.debateTime} min</span>
            <button
              className="counter-btn"
              onClick={() => handleTimeChange(1)}
              disabled={gameState.debateTime >= 30}
            >
              +
            </button>
          </div>
          <p className="setting-info">Tiempo para debatir antes de votar</p>
        </div>

        <div className="hint-selector">
          <h3>Pista del impostor:</h3>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={gameState.giveImpostorHint}
              onChange={(e) => setGiveImpostorHint(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">
              {gameState.giveImpostorHint ? 'Activada' : 'Desactivada'}
            </span>
          </label>
          <p className="setting-info">
            {gameState.giveImpostorHint
              ? 'Los impostores recibirán una pista sobre la palabra'
              : 'Los impostores no recibirán ninguna pista'}
          </p>
        </div>
      </div>

      <button
        className="start-button"
        onClick={startGame}
        disabled={!canStart}
      >
        {canStart
          ? 'Comenzar partida'
          : `Necesitas ${3 - gameState.players.length} jugador(es) más`}
      </button>
    </div>
  );
}
