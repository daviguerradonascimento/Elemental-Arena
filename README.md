# Elemental Arena

## Project Overview

"Elemental Arena" is a tactical battle mini-game developed with Cocos Creator, where elemental characters face off in a 6x6 grid-based arena. Players control characters with unique elemental types (Fire, Water, Earth), each possessing strengths and weaknesses against each other. The game features turn-based combat involving movement, attacks, and special abilities. Designed with AI opponents, it offers challenging single-player experiences.

## Features

### 1. Game Structure & Systems:

*   **Grid System**: 6x6 grid battle arena with coordinated mapping, enabling strategic placement and movement.
*   **Turn-Based Logic**: Players and AI-controlled characters take turns, with movement and actions regulated by the turn order.
*   **Character Stats**: Each character has health, attack power, and movement range, influencing gameplay decisions.
*   **Elemental System**: Three elements—Fire, Water, and Earth—with strengths and weaknesses against one another.

### 2. Technical Implementation:

*   **Component Architecture**: The Cocos Creator's component system is used, allowing easy scalability and maintenance.
*   **Data Management**: The character and ability data are managed efficiently in a structured format with cocos creator properties.
*   **Event System**: A robust event management system was made handling game state changes.
*   **UI Elements**: A battle HUD displays essential information such as health stats and turn information.
*   **Responsive Layout**: The game is optimized to display correctly across a range of screen sizes, providing a consistent user experience.
*   **Save/Load System**: There is game state persistence feature, allowing players to save their progress and resume later.
*   **Procedural Level Generation**: The game generates different arena configurations at the start of each game, creating a fresh experience for each match.
*   **AI Decision Making**: An AI opponent that uses a decision tree for strategic play is implemented, making it challenging for the player to predict and outsmart.

## Installation

To set up the project locally:

1.  Clone the repository:

    ```bash
    git clone https://github.com/daviguerradonascimento/elemental-arena.git
    ```
2.  Navigate to the project directory:

    ```bash
    cd elemental-arena
    ```

## Usage

1.  Open the project in Cocos Creator.
2.  Start the game within the Cocos Creator editor.

## Gameplay

*   **Objective**: Control the characters and engage with elemental tiles in tactical turn-based combat to defeat opponents.
*   **Movement**: Each character has limited movement per turn based on their range.
*   **Combat**: Characters attack based on thei the tile elemental type they are in, using standard and special abilities.
*   **Special Abilities**: Each type has a unique special tile that can be used strategically during the character or enemy turn.
*   **Victory Condition**: The game ends when one of the characters are defeated, with the last standing character declared the winner.
