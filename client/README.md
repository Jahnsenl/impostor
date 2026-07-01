# 🎭 Impostor - Discord Activity

Juego de deducción social para Discord donde los jugadores deben descubrir quién es el impostor.

## 🎮 Cómo jugar

**Objetivo:**
- **Jugadores normales:** Conocen una palabra secreta y deben descubrir quién no la conoce.
- **Impostor:** No conoce la palabra y debe fingir que sí, evitando ser descubierto mientras intenta deducirla.

**Desarrollo del juego:**
1. **Reparto de roles:** Un jugador es elegido aleatoriamente como impostor. Los demás conocen la palabra secreta.
2. **Fase de pistas:** Cada jugador dice una pista sobre la palabra (suficientemente clara pero sin revelarla).
3. **Debate:** Los jugadores analizan las pistas y discuten quién sospechan que es el impostor.
4. **Votación:** Todos votan simultáneamente al sospechoso.
5. **Resolución:**
   - Si eliminan al impostor: Tiene una última oportunidad para adivinar la palabra.
   - Si eliminan a un inocente: El impostor gana automáticamente.

**Sistema de puntuación:**
- Impostor sobrevive sin ser descubierto: +3 puntos
- Impostor es descubierto pero adivina la palabra: +2 puntos
- Jugadores descubren al impostor y este no adivina: +1 punto para cada jugador normal
- Se expulsa a un inocente: +3 puntos para el impostor

## 🚀 Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd Impostor/client
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   Edita `.env` y añade tu Client ID de Discord:
   ```
   VITE_DISCORD_CLIENT_ID=tu_client_id_aqui
   ```

## 🛠️ Desarrollo

**Iniciar servidor de desarrollo:**
```bash
npm run dev
```

**Construir para producción:**
```bash
npm run build
```

**Previsualizar build:**
```bash
npm run preview
```

## 📝 Configuración de Discord Activity

Para usar este juego como Discord Activity, necesitas:

1. **Crear una aplicación en Discord Developer Portal:**
   - Ve a https://discord.com/developers/applications
   - Crea una nueva aplicación
   - Habilita "Activity"

2. **Configurar la aplicación:**
   - Añade el Client ID en tu archivo `.env`
   - Configura las URLs de tu aplicación desplegada
   - Añade los permisos necesarios

3. **Desplegar la aplicación:**
   - Despliega el build a un hosting (Vercel, Netlify, etc.)
   - Configura la URL en Discord Developer Portal

## 📁 Estructura del proyecto

```
src/
├── components/       # Componentes UI de cada fase del juego
│   ├── Lobby.tsx
│   ├── Revealing.tsx
│   ├── Clues.tsx
│   ├── Debate.tsx
│   ├── Voting.tsx
│   ├── Resolution.tsx
│   └── GameEnded.tsx
├── context/          # Contexto del juego
│   └── GameContext.tsx
├── hooks/            # Hooks personalizados
│   └── useDiscordSDK.ts
├── types/            # Definiciones de tipos TypeScript
│   └── game.ts
├── App.tsx           # Componente principal
├── App.css           # Estilos globales
└── main.tsx          # Punto de entrada
```

## 🎨 Tecnologías

- **React 19** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **@discord/embedded-app-sdk** - SDK de Discord Activities

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
