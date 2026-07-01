import { useDiscordSDK } from './hooks/useDiscordSDK';
import { GameProvider, useGame } from './context/GameContext';
import { Lobby } from './components/Lobby';
import { Debate } from './components/Debate';
import { Voting } from './components/Voting';
import { Resolution } from './components/Resolution';
import { GameEnded } from './components/GameEnded';
import './App.css';

function GameContent() {
  const { gameState, isConnected } = useGame();

  if (!isConnected) {
    return (
      <div className="loading">
        <h1>Conectando...</h1>
        <p>Estableciendo conexión con el servidor</p>
      </div>
    );
  }

  const renderPhase = () => {
    switch (gameState.phase) {
      case 'lobby':      return <Lobby />;
      case 'debate':     return <Debate />;
      case 'voting':     return <Voting />;
      case 'resolution': return <Resolution />;
      case 'ended':      return <GameEnded />;
      default:           return <Lobby />;
    }
  };

  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

  return (
    <div className="app">
      <header className="game-header">
        <div className="header-top">
          <span className="round">Ronda {gameState.roundNumber}</span>
          <span className="player-count">{gameState.players.length} jugadores</span>
        </div>
        {gameState.players.length > 0 && (
          <div className="header-scores">
            {sortedPlayers.map((p, i) => (
              <span key={p.id} className="header-score-item">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''}
                {p.username}: <strong>{p.score}</strong>
              </span>
            ))}
          </div>
        )}
      </header>
      <main className="game-main">
        {renderPhase()}
      </main>
    </div>
  );
}

function AppWithProvider() {
  const { isReady, error, roomId, userId, username, avatar } = useDiscordSDK();

  if (error) return <div className="error"><h1>Error</h1><p>{error}</p></div>;
  if (!isReady) return <div className="loading"><h1>Cargando...</h1><p>Conectando con Discord...</p></div>;

  return (
    <GameProvider roomId={roomId} currentUserId={userId} currentUsername={username} currentAvatar={avatar}>
      <GameContent />
    </GameProvider>
  );
}

export default function App() {
  return <AppWithProvider />;
}
