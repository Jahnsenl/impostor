import { useGame } from '../context/GameContext';

export function GameEnded() {
  const { gameState, nextRound, resetGame } = useGame();

  const impostors = gameState.players.filter(p => p.isImpostor);
  const eliminatedPlayer = gameState.players.find(p => p.id === gameState.eliminatedPlayer);

  return (
    <div className="game-ended">
      <h1>
        {gameState.winner === 'impostor' ? '🎭 ¡Los impostores ganan!' : '👥 ¡Los inocentes ganan!'}
      </h1>

      <div className="result-details">
        {gameState.winner === 'impostor' ? (
          <div className="impostor-win">
            {eliminatedPlayer?.isImpostor ? (
              <>
                <p>Los impostores adivinaron la palabra:</p>
                <h2>"{gameState.impostorGuessedWord}"</h2>
                <p>La palabra era: <strong>{gameState.secretWord}</strong></p>
              </>
            ) : (
              <>
                <p>Eliminaron a un inocente:</p>
                <h2>{eliminatedPlayer?.username}</h2>
                <p>{impostors.length === 1 ? 'El impostor era:' : 'Los impostores eran:'}</p>
                <ul>
                  {impostors.map(player => (
                    <li key={player.id}>{player.username}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ) : (
          <div className="innocents-win">
            <p>Descubrieron a todos los impostores:</p>
            <ul>
              {impostors.map(player => (
                <li key={player.id}>{player.username}</li>
              ))}
            </ul>
            <p>Los impostores no pudieron adivinar la palabra.</p>
            <p>La palabra era: <strong>{gameState.secretWord}</strong></p>
            <p>Intento: "{gameState.impostorGuessedWord}"</p>
          </div>
        )}
      </div>

      <div className="scores">
        <h2>Puntuación</h2>
        <table>
          <thead>
            <tr>
              <th>Jugador</th>
              <th>Puntos</th>
            </tr>
          </thead>
          <tbody>
            {gameState.players
              .sort((a, b) => b.score - a.score)
              .map(player => (
                <tr key={player.id}>
                  <td>
                    {player.avatar && <img src={player.avatar} alt={player.username} />}
                    {player.username}
                    {player.isImpostor && ' 🎭'}
                  </td>
                  <td>{player.score}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="actions">
        <button className="next-round" onClick={nextRound}>
          Siguiente ronda
        </button>
        <button className="reset-game" onClick={resetGame}>
          Nueva partida
        </button>
      </div>
    </div>
  );
}
