import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameState } from '../types/game';

const isInDiscord = window.self !== window.top;
const SERVER_URL = isInDiscord ? '' : (import.meta.env.VITE_SERVER_URL ?? '');

interface GameContextType {
  gameState: GameState;
  currentUserId: string;
  roomId: string;
  isConnected: boolean;
  setImpostorCount: (count: number) => void;
  setDebateTime: (time: number) => void;
  setGiveImpostorHint: (enabled: boolean) => void;
  startGame: () => void;
  startVoting: () => void;
  submitVote: (targetId: string) => void;
  submitImpostorGuess: (guess: string) => void;
  nextRound: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialState: GameState = {
  phase: 'lobby',
  players: [],
  secretWord: '',
  roundNumber: 1,
  impostorCount: 1,
  debateTime: 5,
  giveImpostorHint: true,
};

export function GameProvider({
  children,
  currentUserId,
  currentUsername,
  currentAvatar,
  roomId,
}: {
  children: ReactNode;
  currentUserId: string;
  currentUsername: string;
  currentAvatar: string;
  roomId: string;
}) {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const s = io(SERVER_URL, { transports: ['websocket', 'polling'] });

    s.on('connect', () => {
      setIsConnected(true);
      s.emit('join_room', { roomId, userId: currentUserId, username: currentUsername, avatar: currentAvatar });
    });

    s.on('disconnect', () => setIsConnected(false));

    s.on('game_state', (state: GameState) => {
      setGameState(state);
    });

    setSocket(s);
    return () => { s.disconnect(); };
  }, [roomId, currentUserId, currentUsername, currentAvatar]);

  const emit = (event: string, data?: object) =>
    socket?.emit(event, { roomId, ...data });

  const setImpostorCount = (impostorCount: number) => emit('update_settings', { impostorCount });
  const setDebateTime    = (debateTime: number)    => emit('update_settings', { debateTime });
  const setGiveImpostorHint = (giveImpostorHint: boolean) => emit('update_settings', { giveImpostorHint });
  const startGame   = () => emit('start_game');
  const startVoting = () => emit('start_voting');
  const submitVote  = (targetId: string) => emit('submit_vote', { userId: currentUserId, targetId });
  const submitImpostorGuess = (guess: string) => emit('submit_guess', { guess });
  const nextRound  = () => emit('next_round');
  const resetGame  = () => emit('reset_game');

  return (
    <GameContext.Provider value={{
      gameState, currentUserId, roomId, isConnected,
      setImpostorCount, setDebateTime, setGiveImpostorHint,
      startGame, startVoting, submitVote, submitImpostorGuess,
      nextRound, resetGame,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
