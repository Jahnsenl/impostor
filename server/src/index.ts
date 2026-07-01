import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { WORDS } from './words';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  path: '/api/socket.io',
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Types ────────────────────────────────────────────────────────────────────

type GamePhase = 'lobby' | 'debate' | 'voting' | 'resolution' | 'ended';

interface Player {
  id: string;
  username: string;
  avatar: string;
  isImpostor: boolean;
  impostorHint?: string;
  hasVoted: boolean;
  voteTarget?: string;
  isEliminated: boolean;
  score: number;
  socketId: string;
}

interface GameState {
  phase: GamePhase;
  players: Player[];
  secretWord: string;
  eliminatedPlayer?: string;
  impostorGuessedWord?: string;
  winner?: 'impostor' | 'innocents';
  roundNumber: number;
  impostorCount: number;
  debateTime: number;
  debateStartTime?: number;
  giveImpostorHint: boolean;
}

// ── Room store ───────────────────────────────────────────────────────────────

const rooms = new Map<string, GameState>();

function createRoom(): GameState {
  return {
    phase: 'lobby',
    players: [],
    secretWord: '',
    roundNumber: 1,
    impostorCount: 1,
    debateTime: 5,
    giveImpostorHint: true,
  };
}

function getRoom(roomId: string): GameState {
  if (!rooms.has(roomId)) rooms.set(roomId, createRoom());
  return rooms.get(roomId)!;
}

function broadcast(roomId: string) {
  io.to(roomId).emit('game_state', rooms.get(roomId));
}

// ── Vote resolution ──────────────────────────────────────────────────────────

function resolveVoting(roomId: string) {
  const room = getRoom(roomId);

  const tally = new Map<string, number>();
  room.players.forEach(p => {
    if (p.voteTarget) tally.set(p.voteTarget, (tally.get(p.voteTarget) ?? 0) + 1);
  });

  let maxVotes = 0;
  tally.forEach((count) => { if (count > maxVotes) maxVotes = count; });
  const tied = [...tally.entries()].filter(([, c]) => c === maxVotes).map(([id]) => id);
  const eliminatedId = tied[Math.floor(Math.random() * tied.length)];

  const eliminated = room.players.find(p => p.id === eliminatedId);
  room.eliminatedPlayer = eliminatedId;

  if (eliminated?.isImpostor) {
    room.players = room.players.map(p =>
      p.id === eliminatedId ? { ...p, isEliminated: true } : p
    );
    const remainingImpostors = room.players.filter(p => p.isImpostor && !p.isEliminated);

    if (remainingImpostors.length === 0) {
      room.phase = 'resolution';
    } else {
      room.phase = 'debate';
      room.debateStartTime = Date.now();
    }
  } else {
    room.players = room.players.map(p =>
      p.isImpostor ? { ...p, score: p.score + 3 } : p
    );
    room.winner = 'impostor';
    room.phase = 'ended';
  }

  broadcast(roomId);
}

// ── Socket handlers ──────────────────────────────────────────────────────────

io.on('connection', (socket: Socket) => {

  socket.on('join_room', ({ roomId, userId, username, avatar }: {
    roomId: string; userId: string; username: string; avatar: string;
  }) => {
    socket.join(roomId);
    const room = getRoom(roomId);

    const existing = room.players.find(p => p.id === userId);
    if (existing) {
      existing.socketId = socket.id;
    } else if (room.phase === 'lobby' && room.players.length < 8) {
      room.players.push({
        id: userId, username, avatar: avatar ?? '',
        isImpostor: false, hasVoted: false, isEliminated: false,
        score: 0, socketId: socket.id,
      });
    }

    broadcast(roomId);
  });

  socket.on('update_settings', ({ roomId, impostorCount, debateTime, giveImpostorHint }: {
    roomId: string; impostorCount?: number; debateTime?: number; giveImpostorHint?: boolean;
  }) => {
    const room = getRoom(roomId);
    if (room.phase !== 'lobby') return;
    if (impostorCount !== undefined) room.impostorCount = impostorCount;
    if (debateTime !== undefined) room.debateTime = debateTime;
    if (giveImpostorHint !== undefined) room.giveImpostorHint = giveImpostorHint;
    broadcast(roomId);
  });

  socket.on('start_game', ({ roomId }: { roomId: string }) => {
    const room = getRoom(roomId);
    if (room.phase !== 'lobby' || room.players.length < 3) return;

    const wordData = WORDS[Math.floor(Math.random() * WORDS.length)];
    const impostorCount = Math.min(room.impostorCount, Math.floor(room.players.length / 2));
    const shuffled = [...room.players].sort(() => Math.random() - 0.5);
    const impostorIds = shuffled.slice(0, impostorCount).map(p => p.id);
    const shuffledHints = [...wordData.hints].sort(() => Math.random() - 0.5);

    room.players = room.players.map(p => {
      const isImpostor = impostorIds.includes(p.id);
      const idx = impostorIds.indexOf(p.id);
      return {
        ...p, isImpostor,
        impostorHint: isImpostor && room.giveImpostorHint
          ? shuffledHints[idx % shuffledHints.length]
          : undefined,
        hasVoted: false, voteTarget: undefined, isEliminated: false,
      };
    });

    room.secretWord = wordData.word;
    room.phase = 'debate';
    room.debateStartTime = Date.now();
    room.eliminatedPlayer = undefined;
    room.impostorGuessedWord = undefined;
    room.winner = undefined;
    broadcast(roomId);
  });

  socket.on('start_voting', ({ roomId }: { roomId: string }) => {
    const room = getRoom(roomId);
    if (room.phase !== 'debate') return;
    room.phase = 'voting';
    broadcast(roomId);
  });

  socket.on('submit_vote', ({ roomId, userId, targetId }: {
    roomId: string; userId: string; targetId: string;
  }) => {
    const room = getRoom(roomId);
    if (room.phase !== 'voting') return;

    const player = room.players.find(p => p.id === userId);
    if (!player || player.hasVoted || player.isEliminated) return;

    player.hasVoted = true;
    player.voteTarget = targetId;

    const allVoted = room.players.every(p => p.hasVoted || p.isEliminated);
    if (allVoted) {
      resolveVoting(roomId);
    } else {
      broadcast(roomId);
    }
  });

  socket.on('submit_guess', ({ roomId, guess }: { roomId: string; guess: string }) => {
    const room = getRoom(roomId);
    if (room.phase !== 'resolution') return;

    const submitter = room.players.find(p => p.socketId === socket.id);
    if (!submitter?.isImpostor) return;

    room.impostorGuessedWord = guess;
    const correct = guess.toLowerCase().trim() === room.secretWord.toLowerCase();

    room.players = room.players.map(p => ({
      ...p,
      score: p.score + (correct && p.isImpostor ? 2 : !correct && !p.isImpostor ? 1 : 0),
    }));
    room.winner = correct ? 'impostor' : 'innocents';
    room.phase = 'ended';
    broadcast(roomId);
  });

  socket.on('next_round', ({ roomId }: { roomId: string }) => {
    const room = getRoom(roomId);
    if (room.phase !== 'ended') return;
    const scores = Object.fromEntries(room.players.map(p => [p.id, p.score]));
    const fresh = createRoom();
    fresh.players = room.players.map(p => ({
      ...p, isImpostor: false, impostorHint: undefined,
      hasVoted: false, voteTarget: undefined, isEliminated: false,
      score: scores[p.id] ?? 0,
    }));
    fresh.roundNumber = room.roundNumber + 1;
    fresh.impostorCount = room.impostorCount;
    fresh.debateTime = room.debateTime;
    fresh.giveImpostorHint = room.giveImpostorHint;
    rooms.set(roomId, fresh);
    broadcast(roomId);
  });

  socket.on('reset_game', ({ roomId }: { roomId: string }) => {
    rooms.set(roomId, createRoom());
    broadcast(roomId);
  });

  socket.on('disconnect', () => {
    rooms.forEach((room, roomId) => {
      const idx = room.players.findIndex(p => p.socketId === socket.id);
      if (idx !== -1 && room.phase === 'lobby') {
        room.players.splice(idx, 1);
        broadcast(roomId);
      }
    });
  });
});

const PORT = process.env.PORT ?? 3001;
httpServer.listen(PORT, () => console.log(`Impostor server running on :${PORT}`));
