import { useEffect, useState } from 'react';
import { DiscordSDK } from '@discord/embedded-app-sdk';

const CLIENT_ID = '1521711785466531851';

const isInDiscord = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();

export function useDiscordSDK() {
  const [roomId, setRoomId] = useState('dev-room');

  const [userId, setUserId] = useState(() => {
    const s = sessionStorage.getItem('impostor-userId');
    if (s) return s;
    const id = 'player-' + Math.random().toString(36).slice(2, 8);
    sessionStorage.setItem('impostor-userId', id);
    return id;
  });

  const [username, setUsername] = useState(() => {
    const s = sessionStorage.getItem('impostor-username');
    if (s) return s;
    const name = 'Jugador-' + Math.random().toString(36).slice(2, 5).toUpperCase();
    sessionStorage.setItem('impostor-username', name);
    return name;
  });

  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (!isInDiscord) return;

    let sdk: DiscordSDK;
    try {
      sdk = new DiscordSDK(CLIENT_ID);
      setRoomId(sdk.instanceId);
    } catch {
      return;
    }

    sdk.ready().then(async () => {
      try {
        const { code } = await sdk.commands.authorize({
          client_id: CLIENT_ID,
          response_type: 'code',
          state: '',
          prompt: 'consent' as 'none',
          scope: ['identify'],
        });

        const res = await fetch('/api/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        const { access_token } = await res.json() as { access_token: string };
        const auth = await sdk.commands.authenticate({ access_token });

        if (auth?.user) {
          const u = auth.user;
          const name = u.global_name ?? u.username ?? username;
          const uid = u.id ?? userId;
          setUserId(uid);
          setUsername(name);
          sessionStorage.setItem('impostor-userId', uid);
          sessionStorage.setItem('impostor-username', name);
          if (u.avatar) {
            setAvatar(`https://cdn.discordapp.com/avatars/${uid}/${u.avatar}.png`);
          }
        }
      } catch (e) {
        console.error('[Discord Auth]', e);
      }
    }).catch(e => console.error('[Discord ready]', e));
  }, []);

  return { roomId, userId, username, avatar };
}
