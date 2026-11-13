# City Dash

City Dash is an endless runner built with HTML, CSS, and JavaScript. Inspired by Chrome's Dino game, it challenges you to jump over cars, stay on the ground as birds fly past, and beat your best score as the game speeds up.

## Getting started

1. Play here: https://gerryl1991.github.io/citydash/ OR
2. Download or clone the project and keep `index.html`, `style.css`, and `script.js` in the same folder.
3. Open `index.html` in a browser. You can also open the project folder in VS Code and launch it with Live Server.
4. Select **Start**, press **Space** or **Up Arrow**, or tap the play area to begin.

No dependencies or build step are required.

## How to play

| Action                    | Control                                                                      |
| ------------------------- | ---------------------------------------------------------------------------- |
| Jump                      | Press **Space** or **Up Arrow**, or tap the play area                        |
| Restart after a collision | Select **Play again**, press **Space** or **Up Arrow**, or tap the play area |
| Toggle sound              | Select the **Sound** button                                                  |

Jump over cars and stay grounded when birds approach. Each obstacle you pass earns one point and increases the game speed up to a limit. A collision ends the run. Your best score is saved in the browser when local storage is available.

## Technical implementation

| File         | Responsibility                                                                                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html` | Defines the DOM-based play area, runner, score display, and controls.                                                                                                        |
| `style.css`  | Positions the game elements in layers and animates the runner, road, and scenery with CSS keyframes. Buildings and trees scroll at different speeds to give the scene depth. |
| `script.js`  | Runs the simulation, handles input and collisions, and updates the display.                                                                                                  |

- **Game loop.** `loop()` uses `requestAnimationFrame` to update the runner and obstacles before checking for collisions. Movement uses elapsed frame time scaled to a 60 FPS reference. The frame step is capped to limit large position changes after a delay.
- **Jump physics.** `jump()` gives the grounded runner an upward velocity. `updatePlayer()` subtracts gravity from that velocity each frame, so the runner slows on the way up and accelerates back down. On landing, both height and vertical velocity reset to zero.
- **Obstacle generation.** `spawnObstacle()` creates cars of different sizes and colours. Birds can appear after the first point and move faster than cars. The game varies the spacing between spawns and removes obstacles after they leave the screen.
- **Collision detection.** `hitTest()` compares the horizontal and vertical bounds of the runner and each obstacle. A collision occurs when the bounds overlap on both axes. The bounds are inset to give players a little room around the visible edges.
- **Game state and scoring.** Passing an obstacle adds one point and raises the speed until it reaches a cap. A collision stops the loop and shows the final score. Starting a new run clears the old obstacles and resets the score and speed.
- **Persistence and sound.** The game uses `localStorage` to save the best score on the current browser and the Web Audio API to generate sound effects without audio files.

## Team

- Lebohang Makwala (Ramatlapeng)
- Mark Gerryl Mirandilia
- Ayabonga Mtsolo
