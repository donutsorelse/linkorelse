import { Devvit, useState, useInterval, useChannel, Context, useForm } from '@devvit/public-api';

enum GamePhase {
  Lobby = 0,
  WordCollection = 1,
  Connection = 2,
  Voting = 3,
  Results = 4
}

const ROUNDS = 8;
const WORDS_PER_ROUND = 3;
const TIME_PER_ROUND = 8;
const VOTING_TIME = 300; 
const CONNECTION_TIME = 120;

function getGamePhaseFromString(phase: string): GamePhase {
  const numericPhase = parseInt(phase, 10);
  return isNaN(numericPhase) ? GamePhase.Lobby : numericPhase;
}

interface Connection {
  id: string;
  userId: string;
  words: string[];
  connection: string;
  upvotes: number;
  downvotes: number;
  score: number;
}

interface Votes {
  [connectionId: string]: {
    [uid: string]: 'up'|'down'|undefined;
  }
}

Devvit.configure({
  redis: true,
  realtime: true,
  redditAPI: true,
});
const initialWordBank = ['salmon', 'ball', 'coat', 'seal', 'orange', 'dull', 'cough', 'boost', 'dust', 'frame', 'stir', 'bench', 'yell', 'tried', 'waive', 'seat', 'mouth', 'door', 'mirror', 'image', 'blank', 'chip', 'waffle', 'never', 'apple', 'house', 'light', 'music', 'river', 'mountain', 'green', 'red', 'blue', 'circle', 'square', 'triangle', 'phone', 'computer', 'cable', 'bottle', 'desk', 'chair', 'cloud', 'rain', 'snow', 'summer', 'winter', 'moon', 'bank', 'star', 'fire', 'rock', 'spring', 'fall', 'wave', 'bark', 'plant', 'ring', 'date', 'match', 'bat', 'tie', 'pitch', 'line', 'check', 'book', 'card', 'note', 'stick', 'box', 'board', 'train', 'key', 'play', 'trip', 'face', 'point', 'watch', 'block', 'field', 'glass', 'space', 'table', 'pool', 'deck', 'bridge', 'bar', 'break', 'plane', 'ship', 'ground', 'head', 'leaf', 'root', 'branch', 'shot', 'spot', 'draft', 'draw', 'strike', 'party', 'press', 'mark', 'cut', 'class', 'race', 'track', 'wind', 'stream', 'case', 'order', 'rate', 'scale', 'top', 'cap', 'stand', 'round', 'shape', 'roll', 'pack', 'goal', 
  'catch', 'bug', 'fan', 'gate', 'charge', 'run', 'serve', 'court', 'club', 'hole', 'net', 'hit', 'pass', 'kick', 'team', 'coach', 'rule', 'score', 'win', 'loss', 'game', 'meet', 'event', 'rink', 'lane', 'trap', 'arrow', 'target', 'drill', 'fight', 'tournament', 'league', 'player', 'ref', 'spectator', 'ticket', 'uniform', 'flag', 'signal', 'clock', 'time', 'scoreboard', 'announcer', 'commentator', 'analysis', 'stat', 'record', 'streak', 'champion', 'title', 'medal', 'trophy', 'award', 'recognition', 'celebration', 'moment', 'highlight', 'replay', 'strategy', 'plan', 'move', 'adjustment', 'reaction', 'momentum', 'confidence', 'skill', 'talent', 'ability', 'effort', 'practice', 'training', 'preparation', 'focus', 'determination', 'perseverance', 'motivation', 'goal-setting', 'visualization', 'teamwork', 'chemistry', 'bell', 'sign', 'shadow', 'stone', 'water', 'coin', 'rose', 'heart', 'hand', 'iron', 'silver', 'gold', 'seed', 'anchor', 'crown', 'petal', 'shell', 'bow', 'path', 'frost', 'storm', 'flood', 'mist', 'fog', 'ice', 'heat', 'cold', 'dew', 'stem', 'trunk', 'smoke', 'ash', 'flame', 'spark', 'tide', 'flow', 'pond', 'lake', 'sea', 'ocean', 'sand', 'beach', 'shore', 'island', 'bay', 'cliff', 'hill', 'valley', 'plateau', 'cave', 'forest', 'grove', 'meadow', 'trail', 'road', 'fence', 'home', 
  'farm', 'barn', 'yard', 'garden', 'wall', 'room', 'floor', 'ceiling', 'roof', 'window', 'picture', 'shelf', 'bed', 'bag', 'cup', 'jar', 'pot', 'pan', 'spoon', 'fork', 'knife', 'plate', 'bowl', 'brush', 'comb', 'pen', 'pencil', 'paper', 'bill', 'lock', 'chain', 'rope', 'string', 'wire', 'bulb', 'hat', 'shirt', 'shoe', 'sock', 'glove', 'belt', 'button', 'bead', 'ribbon', 'pole', 'hook', 'pipe', 'clay', 'brick', 'tile', 'mat', 'screen', 'film', 'thread', 'balloon', 'bubble', 'wheel', 'cart', 'wagon', 'ladder', 'beam', 'drum', 'horn', 'flute', 'guitar', 'piano', 'violin', 'twig', 'log', 'chimney', 'stove', 'sink', 'faucet', 'mug', 'spout', 'cupboard', 'drawer', 'handle', 'hinge', 'panel', 'plank', 'railing', 'stairs', 'step', 'rung', 'knob', 'curtain', 'shade', 'vent', 'grate', 'cord', 'strap', 'buckle', 'clip', 'pin', 'hanger', 'peg', 'sheet', 'pad', 'rod', 'post', 'stake', 'spike', 'fabric', 'cloth', 'stamp', 'tag', 'label', 'banner', 'poster', 'flyer', 'badge', 'rafter', 'hedge', 'arch', 'tunnel', 'rail', 'car', 'boat', 'jet', 'bike', 'tire', 'brake', 'pedal', 'gear', 'axle', 'shaft', 'engine', 'motor', 'pump', 'tube', 'valve', 'tap', 'lever', 'switch', 'dial', 'plug', 'socket', 'lamp', 'filter', 'lens', 'grid', 'mesh', 'web', 'nail', 'screw', 'bolt', 'nut', 'washer', 'rivet', 'bracket', 'hose', 'pillar', 'tower', 'pebble', 'dirt', 'mud', 'soil', 'flower', 'bloom', 'bud', 'thorn', 'stump', 'wood', 'fruit', 'berry', 'peach', 'pear', 'grape', 'plum', 'cherry', 'lime', 'lemon', 'melon', 'corn', 'grain', 'wheat', 'oat', 'barley', 'rice', 'bean', 'pea', 'pod', 'carrot', 'beet', 'turnip', 'potato', 'onion', 'garlic', 'pepper', 'chili', 'spice', 'salt', 'sugar', 'honey', 'syrup', 'vinegar', 'oil', 'butter', 'cream', 'milk', 'cheese', 'egg', 'bread', 'toast', 'biscuit', 'cake', 'pie', 'cookie', 'cracker', 'jam', 'jelly', 'peanut', 'chocolate', 'candy', 'gum', 'soda', 'coffee', 'tea', 'juice', 'lemonade', 'shake', 'smoothie', 'soup', 'stew', 'broth', 'noodle', 'pasta', 'pizza', 'salad', 'sandwich', 'burger', 'fries', 'chicken', 'fish', 'steak', 'beef', 'pork', 'bacon', 
  'ham', 'sausage', 'turkey', 'duck', 'lamb', 'goat', 'rabbit', 'deer', 'venison', 'crab', 'shrimp', 'lobster', 'clam', 'oyster', 'scallop', 'mussel', 'tuna', 'trout', 'bass', 'cod', 'swordfish', 'shark', 'eel', 'jellyfish', 'whale', 'dolphin', 'otter', 'penguin', 'polar', 'bear', 'wolf', 'fox', 'lion', 'tiger', 'cheetah', 'leopard', 'panther', 'jaguar', 'cougar', 'lynx', 'bobcat', 'cat', 'dog', 'puppy', 'kitten', 'hare', 'squirrel', 'chipmunk', 'rat', 'mouse', 'bird', 'sparrow', 'robin', 'hawk', 'eagle', 'owl', 'falcon', 'goose', 'swan', 'peacock', 'parrot', 'flamingo', 'ostrich', 'emu', 'snake', 'lizard', 'gecko', 'iguana', 'crocodile', 'alligator', 'frog', 'toad', 'newt', 'salamander', 'turtle', 'tortoise', 'ray', 'starfish', 'coral', 'sponge', 'urchin', 'snail', 'slug', 'worm', 'ant', 'bee', 'wasp', 'hornet', 'fly', 'gnat', 'mosquito', 'beetle', 'ladybug', 'butterfly', 'moth', 'dragonfly', 'grasshopper', 'cricket', 'locust', 'spider', 'scorpion', 'tick', 'flea', 'louse', 'termite', 'cockroach', 'centipede', 'millipede', 'earthworm', 'can', 'tin', 'lid', 'knot', 'eraser', 'ruler', 'pocket', 'zip', 'snap', 'tape', 'boot', 'scarf', 'jacket', 'dress', 'skirt', 'suit', 'band', 'cloak', 'veil', 'mask', 'helmet', 'shield', 'grill', 'skewer', 'rack', 'tray', 'bin', 'basket', 'crate', 'parcel', 'blade', 'tank', 'page', 'folder', 'file', 'slab', 'duct', 'staple', 'loop', 'foil', 'glue', 'paste', 'wax', 'paint', 'stain', 'varnish', 'marker', 'sharpener', 'compass', 'tack', 'clamp', 'drop', 'current', 'flash', 'twist', 'arc', 'dot', 'dash', 'trace', 'curve', 'edge', 'corner', 'angle', 'bend', 'fold', 'crease', 'slice', 'flake', 'crack', 'split', 'gap', 'void', 'slot', 'groove', 'notch', 'ridge', 'peak', 'mount', 'route', 'way', 'course', 'lot', 'park', 'harbor', 'earth', 'column', 'pane', 'blind', 'wrap', 'glow', 'shine', 'flare', 'pulse', 'burst', 'crash', 'bang', 'boom', 'echo', 'rumble', 'whistle', 'buzz', 'hum', 'click', 'pop', 'thud', 'knock', 'clang', 'chime', 'ding', 'toll', 'beep', 'ping', 'whack', 'smack', 'slap', 'thump', 'jab', 'punch', 'push', 'pull', 'grab', 'grip', 'clasp', 'clutch', 'hold', 'spin', 'turn', 'flip', 'toss', 'throw', 'slide', 'swing', 'drag', 'lift', 'carry', 'crush', 'squeeze', 'tear', 'rip', 'trim', 'shave', 'carve', 'chop', 'dice', 'grind', 'scrape', 'peel', 'smash', 'pound', 'hammer', 'weld', 'sketch', 'write', 'scribble', 'erase', 'etch', 'print', 'mold', 'cast', 'forge', 'form', 'build', 'stack', 'pile', 'layer', 'align', 'pair', 'bind', 'open', 'close', 'shut', 'adjust', 'rotate', 'tilt', 'unfold', 'stretch', 'curl', 'straighten', 'lean', 'balance', 'shift', 'tip', 'stop', 'start', 'pause', 'wait', 'go', 'walk', 'jump', 'leap', 'climb', 'crawl', 'glide', 'dive', 'swim', 'float', 'sit', 'rest', 'lie', 'rise', 'grow', 'shrink', 'expand', 'contract', 'unlock', 'release', 'guard', 'defend', 'attack', 'chase', 'escape', 'hide', 'seek', 'find', 'lose', 'reset', 'repeat', 'save', 'load', 'delete', 'undo', 'redo', 'fix', 'repair', 'construct', 'assemble', 'disassemble', 'shatter', 'flatten', 'warp', 'bounce', 'drift', 'center', 'sphere', 'cube', 'scratch', 'dent', 'seam', 'puddle', 'slope', 'cuff', 'cover', 'pouch', 'latch', 'yarn', 'ink', 'color', 'tone', 'stroke', 'mash', 'coil', 'slam', 'clap', 'bump'];

const GameComponent = (context: Context) => {
  const { redis, userId, ui } = context;

  const [gameState, setGameState] = useState(async () => {
    const fetchedGameState = await redis.hGetAll('game_state');
    const phase = fetchedGameState.phase ? getGamePhaseFromString(fetchedGameState.phase) : GamePhase.Lobby;
    const currentRound = fetchedGameState.currentRound ? parseInt(fetchedGameState.currentRound) : 1;
    let playerWords = fetchedGameState.playerWords ? JSON.parse(fetchedGameState.playerWords) : {};
    const connections: Connection[] = fetchedGameState.connections ? JSON.parse(fetchedGameState.connections) : [];
    const currentWordIndex = fetchedGameState.currentWordIndex ? parseInt(fetchedGameState.currentWordIndex) : 0;
    const unusedWords = fetchedGameState.unusedWords ? JSON.parse(fetchedGameState.unusedWords) : initialWordBank.slice();
    const currentRoundWords = fetchedGameState.currentRoundWords ? JSON.parse(fetchedGameState.currentRoundWords) : [];
    const votes: Votes = fetchedGameState.votes ? JSON.parse(fetchedGameState.votes) : {};

    let timeLeft = 0;
    if (phase === GamePhase.WordCollection) timeLeft = TIME_PER_ROUND;
    else if (phase === GamePhase.Connection) timeLeft = CONNECTION_TIME;
    else if (phase === GamePhase.Voting) timeLeft = VOTING_TIME;

    if (userId && !playerWords[userId]) {
      playerWords[userId] = [];
      await redis.hSet('game_state', { playerWords: JSON.stringify(playerWords) });
    }

    let hostId = fetchedGameState.hostId || '';
    if (!hostId && userId) {
      hostId = userId;
      await redis.hSet('game_state', { hostId });
      console.log(`Host assigned to ${hostId}`);
    }

    return {
      isLoading: false,
      gamePhase: phase,
      currentRound,
      playerWords,
      connections,
      timeLeft,
      currentWordIndex,
      selectedWords: [] as string[],
      unusedWords,
      currentRoundWords,
      votes,
      hostId
    };
  });

  const {
    isLoading,
    gamePhase,
    currentRound,
    playerWords,
    connections,
    timeLeft,
    currentWordIndex,
    selectedWords,
    unusedWords,
    currentRoundWords,
    votes,
    hostId
  } = gameState;

  const isHost = (userId === hostId);

  const channel = useChannel({
    name: 'game_channel',
    onMessage: handleChannelMessage
  });

  useState(() => {
    channel.subscribe();
    return null;
  });

  function updateGameState(newState: Partial<typeof gameState>) {
    setGameState(prev => ({ ...prev, ...newState }));
  }

  async function saveGameState() {
    try {
      await redis.hSet('game_state', {
        phase: gamePhase.toString(),
        playerWords: JSON.stringify(playerWords),
        connections: JSON.stringify(connections),
        currentRound: currentRound.toString(),
        currentWordIndex: currentWordIndex.toString(),
        unusedWords: JSON.stringify(unusedWords),
        currentRoundWords: JSON.stringify(currentRoundWords),
        votes: JSON.stringify(votes),
        hostId: hostId
      });
    } catch (error) {
      console.error(`Error saving game state: ${error}`);
    }
  }

  async function broadcastState() {
    if (channel.status !== 3) return;
    const message = {
      type: 'stateUpdate',
      phase: gamePhase,
      playerWords,
      connections,
      currentRound,
      currentWordIndex,
      unusedWords,
      currentRoundWords,
      votes
    };
    await sendChannelMessage(message);
  }

  function log(message: string) {
    console.log(message);
    ui.showToast(message);
  }

  let transitioning = false;

  async function transitionToPhase(newPhase: GamePhase) {
    if (transitioning) return;
    transitioning = true;

    if (gamePhase === newPhase) {
      transitioning = false;
      return;
    }

    const updates: Partial<typeof gameState> = { gamePhase: newPhase };

    if (newPhase === GamePhase.WordCollection) {
      // Only host picks the initial words when starting from Lobby
      if (gamePhase === GamePhase.Lobby && isHost) {
        const newUnused = initialWordBank.slice();
        const newRoundWords = pickWordsForRound(newUnused);
        Object.assign(updates, {
          timeLeft: TIME_PER_ROUND,
          currentWordIndex: 0,
          currentRound: 1,
          selectedWords: [],
          unusedWords: newUnused,
          currentRoundWords: newRoundWords,
          votes: {}
        });
      } else {
        // If non-host or transitioning from another phase, just set timeLeft
        updates.timeLeft = TIME_PER_ROUND;
      }
    } else if (newPhase === GamePhase.Connection) {
      updates.timeLeft = CONNECTION_TIME;
    } else if (newPhase === GamePhase.Voting) {
      updates.timeLeft = VOTING_TIME;
    } else if (newPhase === GamePhase.Results) {
      updates.timeLeft = 0;
    }

    updateGameState(updates);
    if (isHost) {
      await saveGameState();
      await broadcastState();
      await sendChannelMessage({ type: 'gamePhaseChanged', phase: newPhase });
      log(`Transitioned to ${GamePhase[newPhase]} phase`);
    }
    transitioning = false;
  }

  async function handleChannelMessage(message: any) {
    console.log('Received channel message:', message);
    switch (message.type) {
      case 'gamePhaseChanged':
        if (gamePhase !== message.phase) {
          updateGameState({ gamePhase: message.phase });
        }
        break;
      case 'playerWordsUpdated':
        updateGameState({ playerWords: sanitizePlayerWords(message.playerWords) });
        break;
      case 'connectionsUpdated':
        updateGameState({ connections: message.connections || [] });
        break;
      case 'stateUpdate':
        updateGameState({
          gamePhase: message.phase,
          playerWords: sanitizePlayerWords(message.playerWords),
          connections: message.connections,
          currentRound: message.currentRound,
          currentWordIndex: message.currentWordIndex,
          unusedWords: message.unusedWords,
          currentRoundWords: message.currentRoundWords,
          votes: message.votes
        });
        break;
      case 'gameReset':
        updateGameState({
          gamePhase: GamePhase.Lobby,
          currentRound: 1,
          playerWords: {},
          connections: [],
          timeLeft: 0,
          currentWordIndex: 0,
          selectedWords: [],
          unusedWords: initialWordBank.slice(),
          currentRoundWords: [],
          votes: {}
        });
        break;
      case 'requestStartGame':
        // Only host actually starts the game by picking words and transitioning
        if (isHost && gamePhase === GamePhase.Lobby) {
          await transitionToPhase(GamePhase.WordCollection);
          await saveGameState();
          await broadcastState();
          log("Game started by a player's requestStartGame");
        }
        break;

      case 'requestClaimWord':
        if (isHost && message.userId && message.word) {
          hostHandleClaimWord(message.userId, message.word);
        }
        break;

      case 'requestSubmitConnection':
        if (isHost && message.userId && Array.isArray(message.chosenWords) && typeof message.connectionText === 'string') {
          hostHandleSubmitConnection(message.userId, message.chosenWords, message.connectionText);
        }
        break;

      case 'requestVote':
        if (isHost && message.userId && message.connectionId && typeof message.isUpvote === 'boolean') {
          hostHandleVote(message.userId, message.connectionId, message.isUpvote);
        }
        break;

      case 'requestPlayAgain':
        if (isHost) startNewGame();
        break;

      default:
        console.log(`Unknown message type received: ${message.type}`);
    }
  }

  function sanitizePlayerWords(pw: Record<string, string[]>) {
    const result: Record<string, string[]> = {};
    for (const uid in pw) {
      result[uid] = (pw[uid] || []).filter(w => typeof w === 'string' && w.trim().length > 0);
    }
    return result;
  }

  function pickWordsForRound(uWords: string[]): string[] {
    if (uWords.length < WORDS_PER_ROUND) {
      console.warn('Not enough words for a new round.');
      return ['N/A','N/A','N/A']; 
    }
    const chosen: string[] = [];
    for (let i = 0; i < WORDS_PER_ROUND; i++) {
      const idx = Math.floor(Math.random() * uWords.length);
      chosen.push(uWords[idx]);
      uWords.splice(idx, 1);
    }
    return chosen;
  }

  function getCurrentWord(): string | undefined {
    if (!currentRoundWords || currentRoundWords.length <= currentWordIndex) {
      return undefined;
    }
    return currentRoundWords[currentWordIndex];
  }

  function hasUserClaimedThisRound(): boolean {
    const userW = playerWords[userId || ''] || [];
    return userW.length >= currentRound;
  }

  let wordTimeoutInProgress = false;
  async function onWordTimeout() {
    if (wordTimeoutInProgress) return;
    wordTimeoutInProgress = true;
    const lastWordOfRound = currentWordIndex === WORDS_PER_ROUND - 1;

    if (!lastWordOfRound) {
      updateGameState({
        currentWordIndex: currentWordIndex + 1,
        timeLeft: TIME_PER_ROUND
      });
      if (isHost) {
        await saveGameState();
        await broadcastState();
      }
    } else {
      if (!hasUserClaimedThisRound()) {
        const lastW = getCurrentWord();
        if (lastW && lastW.trim() !== '') {
          const updatedPlayerWords = {
            ...playerWords,
            [userId || '']: [...(playerWords[userId || ''] || []), lastW]
          };
          updateGameState({ playerWords: updatedPlayerWords });
          if (isHost) {
            await redis.hSet('game_state', { playerWords: JSON.stringify(updatedPlayerWords) });
            await sendChannelMessage({ type: 'playerWordsUpdated', playerWords: updatedPlayerWords });
          }
          console.log(`Automatically assigned word: ${lastW}`);
        } else {
          console.warn('No last word found to assign');
        }
      }

      if (currentRound < ROUNDS) {
        const newUnused = [...unusedWords];
        const newRoundWords = pickWordsForRound(newUnused);
        updateGameState({
          currentRound: currentRound + 1,
          currentWordIndex: 0,
          timeLeft: TIME_PER_ROUND,
          unusedWords: newUnused,
          currentRoundWords: newRoundWords
        });
        if (isHost) {
          await saveGameState();
          await broadcastState();
        }
      } else {
        if (gamePhase === GamePhase.WordCollection) {
          await transitionToPhase(GamePhase.Connection);
        }
      }
    }
    wordTimeoutInProgress = false;
  }

  async function claimWord(selectedWord: string) {
    if (!userId || currentRound > ROUNDS) {
      console.log("Cannot claim word at this time");
      return;
    }

    if (hasUserClaimedThisRound()) {
      console.log("User already claimed a word this round");
      return;
    }

    if (!selectedWord || selectedWord.trim() === '') {
      console.log("Invalid word to claim");
      return;
    }

    const updatedPlayerWords = {
      ...playerWords,
      [userId || '']: [...(playerWords[userId || ''] || []), selectedWord]
    };

    updateGameState({ playerWords: updatedPlayerWords });
    if (isHost) {
      await redis.hSet('game_state', { playerWords: JSON.stringify(updatedPlayerWords) });
      await sendChannelMessage({ type: 'playerWordsUpdated', playerWords: updatedPlayerWords });
      await saveGameState();
      await broadcastState();
    } else {
      await channel.send({ type: 'requestClaimWord', userId, word: selectedWord });
    }
    console.log(`Claimed word: ${selectedWord}`);
  }

  const interval = useInterval(() => {
    if (gamePhase === GamePhase.WordCollection) {
      if (timeLeft > 0) {
        updateGameState({ timeLeft: timeLeft - 1 });
      } else {
        onWordTimeout();
      }
    } else if (gamePhase === GamePhase.Connection) {
      if (timeLeft > 0) {
        if (allConnectionsSubmitted()) {
          if (gamePhase === GamePhase.Connection) {
            transitionToPhase(GamePhase.Voting);
          }
        } else {
          updateGameState({ timeLeft: timeLeft - 1 });
        }
      } else {
        if (gamePhase === GamePhase.Connection) {
          transitionToPhase(GamePhase.Voting);
        }
      }
    } else if (gamePhase === GamePhase.Voting) {
      if (timeLeft > 0) {
        if (allVotesIn()) {
          if (gamePhase === GamePhase.Voting) {
            transitionToPhase(GamePhase.Results);
          }
        } else {
          updateGameState({ timeLeft: timeLeft - 1 });
        }
      } else {
        if (gamePhase === GamePhase.Voting) {
          transitionToPhase(GamePhase.Results);
        }
      }
    }
  }, 1000);
  interval.start();

  const connectionForm = useForm({
    fields: [
      { name: 'connection', type: 'string', label: 'Describe the connection' },
    ],
  }, async (formData) => {
    const chosenWords = selectedWords.filter(w => w && w.trim() !== '');
    if (chosenWords.length < 2) {
      log("You need at least 2 words to form a connection.");
      return;
    }
    await submitConnection(chosenWords, formData.connection || '');
  });

  async function submitConnection(chosenWords: string[], connectionText: string) {
    if (!userId || chosenWords.length < 2 || !connectionText) {
      log("Invalid connection submission");
      return;
    }

    if (isHost) {
      await hostHandleSubmitConnection(userId!, chosenWords, connectionText);
    } else {
      await channel.send({
        type: 'requestSubmitConnection',
        userId,
        chosenWords,
        connectionText
      });
    }
  }

  async function hostHandleSubmitConnection(uid: string, chosenWords: string[], connectionText: string) {
    if (gamePhase !== GamePhase.Connection) return;
    if (connections.some(c => c.userId === uid)) return;
    if (chosenWords.length < 2 || !connectionText.trim()) return;

    const newConnection: Connection = {
      id: `${uid}-${Date.now()}`,
      userId: uid,
      words: chosenWords,
      connection: connectionText,
      upvotes: 0,
      downvotes: 0,
      score: 0
    };
    const updatedConnections = [...connections, newConnection];
    updateGameState({ connections: updatedConnections });
    await saveGameState();
    await sendChannelMessage({ type: 'connectionsUpdated', connections: updatedConnections });
    await broadcastState();

    const allPlayers = Object.keys(playerWords).length;
    if (updatedConnections.length === allPlayers && gamePhase === GamePhase.Connection) {
      await transitionToPhase(GamePhase.Voting);
    }
  }

  async function vote(connectionId: string, isUpvote: boolean) {
    if (!userId || gamePhase !== GamePhase.Voting) {
      log("Voting is not allowed at this time");
      return;
    }

    if (isHost) {
      await hostHandleVote(userId!, connectionId, isUpvote);
    } else {
      await channel.send({ type: 'requestVote', userId, connectionId, isUpvote });
    }
  }

  async function hostHandleVote(uid: string, connectionId: string, isUpvote: boolean) {
    if (gamePhase !== GamePhase.Voting) return;
    const currentUserVotes = votes[connectionId] || {};
    const currentVote = currentUserVotes[uid || ''];
    let newVote: 'up'|'down'|undefined = isUpvote ? 'up' : 'down';

    if (currentVote === newVote) newVote = undefined;
    currentUserVotes[uid || ''] = newVote;
    const newVotes = { ...votes, [connectionId]: currentUserVotes };

    const {upvotes, downvotes} = calcVotesForConnection(connectionId, newVotes);
    const updatedConnections = connections.map(conn => {
      if (conn.id === connectionId) {
        return { ...conn, upvotes, downvotes };
      }
      return conn;
    });

    updateGameState({ connections: updatedConnections, votes: newVotes });
    await saveGameState();
    await sendChannelMessage({ type: 'connectionsUpdated', connections: updatedConnections });
    await broadcastState();
    log(`Vote recorded`);
    await calculateScores();
  }

  async function calculateScores() {
    if (!isHost) return;
    const participants = Object.keys(playerWords).length;

    const updatedConnections = connections.map(conn => {
      const netVotes = conn.upvotes - conn.downvotes;
      const wordCount = conn.words.length;
      const baseScore = wordCount * 10;
      const voteFactor = participants > 0 ? netVotes * (100 / participants) : netVotes;
      let finalScore = baseScore + voteFactor;
      return { ...conn, score: Math.round(finalScore) };
    });

    updateGameState({ connections: updatedConnections });
    await saveGameState();
    await sendChannelMessage({ type: 'connectionsUpdated', connections: updatedConnections });
    await broadcastState();
    log("Scores calculated and updated");
  }

  async function startNewGame() {
    updateGameState({
      gamePhase: GamePhase.Lobby,
      currentRound: 1,
      playerWords: {},
      connections: [],
      timeLeft: 0,
      currentWordIndex: 0,
      selectedWords: [],
      unusedWords: initialWordBank.slice(),
      currentRoundWords: [],
      votes: {}
    });

    await redis.del('game_state');
    await sendChannelMessage({ type: 'gameReset' });
    log("New game started");
  }

  function toggleSelectedWord(w: string) {
    if (!w || !w.trim()) return;
    if (selectedWords.includes(w)) {
      updateGameState({ selectedWords: selectedWords.filter(x => x !== w) });
    } else {
      updateGameState({ selectedWords: [...selectedWords, w] });
    }
  }

  function calcVotesForConnection(connectionId: string, allVotes: Votes) {
    const connVotes = allVotes[connectionId] || {};
    let ups = 0;
    let downs = 0;
    for (const uid in connVotes) {
      if (connVotes[uid] === 'up') ups++;
      if (connVotes[uid] === 'down') downs++;
    }
    return { upvotes: ups, downvotes: downs };
  }

  function allVotesIn(): boolean {
    const participantCount = Object.keys(playerWords).length;
    if (participantCount === 0 || connections.length === 0) return false;

    for (const conn of connections) {
      const connVotes = votes[conn.id] || {};
      let voters = 0;
      for (const p of Object.keys(playerWords)) {
        if (connVotes[p] !== undefined) {
          voters++;
        }
      }
      if (voters < participantCount) return false;
    }
    return true;
  }

  function allConnectionsSubmitted(): boolean {
    const allPlayers = Object.keys(playerWords).length;
    if (allPlayers === 0) return false;
    return connections.length === allPlayers;
  }

  function sanitizeMessage(data: any) {
    if (typeof data !== 'object' || data === null) return data;
    if (Array.isArray(data)) {
      return data.map(item => sanitizeMessage(item)).filter(item => item !== undefined);
    }
    const result: Record<string, any> = {};
    for (const key in data) {
      if (data[key] !== undefined) {
        result[key] = sanitizeMessage(data[key]);
      }
    }
    return result;
  }

  async function sendChannelMessage(msg: any) {
    if (channel.status !== 3) {
      return;
    }
    const cleaned = sanitizeMessage(msg);
    try {
      await channel.send(cleaned);
    } catch (error) {
      console.error('Error sending channel message:', error);
    }
  }

  const howToPlayForm = useForm({
    fields: [
      {
        name: 'instructions',
        type: 'paragraph',
        label: 'Instructions',
        defaultValue:
`How to Play Link-or-else:

- Lobby: Host starts the game by clicking "Start Game".
- WordCollection: Everyone sees the same words once the host starts the game.
- Connection: Submit a connection with your chosen words.
- Voting: Vote on connections.
- Results: See final scores.`
      }
    ]
  }, async () => {});

  function renderLobby() {
    const playerCount = Object.keys(playerWords).length;
    return (
      <vstack padding="large" gap="medium">
        <text style="heading">Welcome to Link-or-else</text>
        <text>Players: {playerCount}</text>
        {isHost ? <text>You are the host. Start the game when ready.</text> : <text>Waiting for host...</text>}
        <hstack gap="small">
          {isHost && (
            <button onPress={async () => {
              if (gamePhase === GamePhase.Lobby) {
                await transitionToPhase(GamePhase.WordCollection);
                // After host transitions, broadcast same to others
                await channel.send({ type: 'requestStartGame' });
                log("Host started the game and sent requestStartGame");
              }
            }}>
              Start Game
            </button>
          )}
          <button onPress={() => ui.showForm(howToPlayForm)}>How to Play</button>
        </hstack>
      </vstack>
    );
  }

  function renderWordCollection() {
    const currentW = getCurrentWord();
    const userWordsArr = (playerWords[userId ?? ''] || []).filter(w => w && w.trim() !== '');
    const canClaimWord = userId && !hasUserClaimedThisRound() && currentW && currentW !== 'N/A';

    return (
      <vstack padding="large" gap="medium">
        <text style="heading">Word Collection - Round {currentRound}/{ROUNDS}</text>
        <text>Word {currentWordIndex + 1}/{WORDS_PER_ROUND}</text>
        <text>Time left: {timeLeft} seconds</text>
        <text>Your words: {userWordsArr.join(', ') || 'None yet'}</text>
        <text>Current word: {currentW || 'No more words'}</text>
        <button onPress={() => { if (currentW && currentW !== 'N/A') claimWord(currentW); }} disabled={!canClaimWord}>
          Claim Word
        </button>
      </vstack>
    );
  }

  function renderConnection() {
    const userWordsList = (playerWords[userId || ''] || []).filter(w => w && w.trim() !== '');
    return (
      <vstack padding="large" gap="medium">
        <text style="heading">Create Your Connection</text>
        <text>Time left: {timeLeft} seconds</text>
        <text>Your words:</text>
        <hstack wrap="true" gap="small">
          {userWordsList.map((w, idx) => (
            <button
              key={w + idx}
              appearance={selectedWords.includes(w) ? 'primary' : 'secondary'}
              onPress={() => toggleSelectedWord(w)}
            >
              {w}
            </button>
          ))}
        </hstack>
        <text>Select words and describe their connection:</text>
        <button onPress={() => {
          ui.showForm(connectionForm);
        }}>
          What links these words?
        </button>
      </vstack>
    );
  }

  function renderVoting() {
    return (
      <vstack padding="large" gap="medium">
        <text style="heading">Voting Phase</text>
        <text>Time left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</text>
        {connections.map((conn, idx) => (
          <vstack key={conn.id + idx} padding="small" backgroundColor="#f0f0f0">
            <text style="heading">{conn.connection}</text>
            <text>Words: {conn.words.join(', ')}</text>
            <text>Score: {conn.score}</text>
            <hstack gap="small">
              <button onPress={() => vote(conn.id, true)}>Upvote</button>
              <button onPress={() => vote(conn.id, false)}>Downvote</button>
            </hstack>
          </vstack>
        ))}
      </vstack>
    );
  }

  function renderResults() {
    const sortedConnections = [...connections].sort((a, b) => b.score - a.score);

    return (
      <vstack padding="large" gap="medium">
        <text style="heading">Game Results</text>
        {sortedConnections.map((conn, index) => (
          <vstack key={conn.id + index} padding="small" backgroundColor={index < 3 ? '#ffd700' : '#f0f0f0'}>
            <text style="heading">{index + 1}. {conn.connection}</text>
            <text>Words: {conn.words.join(', ')}</text>
            <text>Score: {conn.score}</text>
          </vstack>
        ))}
        <button onPress={startNewGame}>Play Again</button>
      </vstack>
    );
  }

  if (isLoading) {
    return <text>Loading game...</text>;
  }

  switch (gamePhase) {
    case GamePhase.Lobby:
      return renderLobby();
    case GamePhase.WordCollection:
      return renderWordCollection();
    case GamePhase.Connection:
      return renderConnection();
    case GamePhase.Voting:
      return renderVoting();
    case GamePhase.Results:
      return renderResults();
    default:
      return <text>Unknown game phase: {GamePhase[gamePhase]}</text>;
  }
};

Devvit.addCustomPostType({
  name: 'Link-or-else',
  render: GameComponent,
});

Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Create Word Linking Game',
  onPress: async (_, context) => {
    const { reddit, ui } = context;
    const currentSubreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      title: 'Link-or-else',
      subredditName: currentSubreddit.name,
      preview: (
        <vstack>
          <text>Loading Link-or-else...</text>
        </vstack>
      ),
    });
    ui.showToast(`Created Link-or-else in ${currentSubreddit.name}`);
  },
});

export default Devvit;
