Link-or-else Game Overview
Link-or-else is a multiplayer Reddit-based game built using Devvit. Players collect words over multiple rounds, form connections between their chosen words, and then vote on each other’s submitted connections.

Game Phases
Lobby (GamePhase.Lobby)
In this phase, players join the game. The host (the first user who started the game or was assigned as host due to no existing host) sees a "Start Game" button. Other players wait.

Goal: Wait for the host to start the game.

Word Collection (GamePhase.WordCollection)
The host selects the initial set of words for the first round. Each round has 3 words (by default), and there are 8 rounds total. Each round, a word is displayed, and players can "Claim Word" to add it to their personal collection. If they fail to claim a word by the time the round moves on, the last word of the round is automatically assigned to them.

Goal: Each player accumulates words, one per round, either by claiming or by auto-assignment if time runs out.

Connection (GamePhase.Connection)
After all rounds are completed, players move to the Connection phase. Here, they pick at least two of their collected words and describe the connection (a theme, a category, a clever link, etc.).

Goal: Each player creates one connection using at least two of their words and submits it.

Voting (GamePhase.Voting)
After all players have submitted their connections (or time runs out), everyone sees all submitted connections. They can upvote or downvote each connection. Upvotes and downvotes affect the final scores.

Goal: Evaluate and vote on other players’ connections.

Results (GamePhase.Results)
Once voting is complete (either all players have voted or time runs out), final scores are calculated and displayed. Players see the ranked list of connections.

Goal: See who won and, optionally, start a new game.

Key Features
Host-Controlled State:
The host’s instance is the authoritative source of truth for the game state. Non-host players rely on stateUpdate messages to sync their local state.

Synchronized Words and Connections:
When the host transitions phases, it picks the round words, saves them, and broadcasts them. Non-hosts update their local state on receiving stateUpdate events. Similarly, when connections are submitted or votes recorded, the host updates and broadcasts changes so everyone stays in sync.

Automatic Assignments and Timeouts:
If time runs out in a round without a player claiming a word, the player automatically gets the last word. Similarly, if time runs out in the Connection or Voting phases, the game moves forward automatically.

How It Works Internally
Initialization:

On the first load, if no hostId is set, the first user becomes the host.
All game data is stored in Redis (redis.hGetAll('game_state')), and updates are broadcast via Realtime channel messages.
Starting the Game:

The host clicks "Start Game" at the Lobby.
The code calls transitionToPhase(GamePhase.WordCollection).
For the first WordCollection round, the host picks new words and broadcasts them.
Word Collection Phase:

A timer counts down from TIME_PER_ROUND.
Players see the current word and can claim it.
When time runs out, if it’s not the last word of the round, move to the next word. If it’s the last word, auto-assign it to unclaimed players.
Move to next round or transition to Connection phase after all rounds are done.
Connection Phase:

Players choose some of their collected words and submit a connection.
The host waits until all players have submitted (or time runs out).
Once all submitted or time ends, the game transitions to Voting.
Voting Phase:

All players see all submitted connections.
Each player votes on others’ connections.
Once all players have voted on all connections or time runs out, move to Results.
Results Phase:

The host calculates scores based on words chosen, upvotes, and downvotes.
Players see the final scoreboard.
Anyone can click "Play Again" (the host actually triggers a new game reset).
Known Issues and Troubleshooting
If non-host players don’t get words at the start: Ensure that:

The host started the game (transitioned from Lobby to WordCollection).
The host broadcasted the state after picking the first round words.
Non-host players should receive the stateUpdate with currentRoundWords. Make sure the onMessage handler for stateUpdate is properly updating currentRoundWords.
If connections aren’t visible to non-host players: Check that:

On requestSubmitConnection, the host updates connections and sends a connectionsUpdated message.
Non-hosts listen for connectionsUpdated and update their connections array locally.
If votes or final scores don’t propagate:

On votes, host updates connections and votes, then sends connectionsUpdated.
Non-hosts rely on the connectionsUpdated to see updated scores.
How to Modify the Code
Change Rounds or Time:
Adjust ROUNDS, WORDS_PER_ROUND, TIME_PER_ROUND, VOTING_TIME, CONNECTION_TIME at the top of the code.

Change Word Bank:
Modify initialWordBank to add or remove words. If you add fewer words, consider lowering ROUNDS or WORDS_PER_ROUND.

Add More Logging:
Use log("message") to add more debug information.

Add Conditions for Fewer Words in Connection Phase:
To skip Connection if a player has fewer than 2 words, you can check userWordsList.length in the renderConnection() function or when transitioning to Connection phase, but remember to maintain consistent logic across the host and non-host states.

Conclusion
This game relies heavily on host authority and broadcast messages. Understanding the flow of onMessage events, stateUpdate, and connectionsUpdated events is crucial. By ensuring the host always updates and broadcasts state changes, and non-hosts always react to these updates, players will see synced words, connections, and voting results.
