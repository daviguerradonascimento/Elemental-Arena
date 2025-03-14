import { _decorator, Component, Node, UITransform, EventTouch, Vec3, Label, Button, sys } from 'cc';
import { AIController } from './AIController';
import { GridMovement } from './GridMovement'; // Assuming GridMovement is being used for the player as well
import { PlayerController } from './PlayerController';
import { CombatController } from './CombatController';
import { TilemapGenerator } from './TileMapGenerator';

const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    @property(Node)
    player: Node;

    @property(Node)
    ai: Node;

    @property
    playerTurn: boolean = true; // Boolean to track whose turn it is

    @property(Label)
    gameOverLabel: Label;

    @property(Label)
    turnInfoLabel: Label;

    @property(Label)
    turnNumberLabel: Label;

    @property(Button)
    saveButton: Button = null;

    @property(Button)
    loadButton: Button = null;

    private playerController: PlayerController;
    private aiController: AIController;
    private gridMovement: GridMovement;
    private combatController: CombatController;
    private tileMapController: TilemapGenerator;

    private turn: number = 1;

    start() {

        // Initialize controllers
        this.playerController = this.player.getComponent(PlayerController);
        this.aiController = this.ai.getComponent(AIController);
        this.combatController = this.node.getComponent(CombatController);
        this.tileMapController = this.node.getComponent(TilemapGenerator);

        this.gameOverLabel.active = false;
        this.gameOverLabel.string = '';

        try {
            this.gridMovement = new GridMovement(this.player, 0, 0, this.ai, 5, 5);
        } catch (error) {
            console.error("Error initializing GridMovement:", error);
        }

        if (!this.playerController || !this.aiController) {
            console.error("PlayerController or AIController not attached properly.");
            return;
        }

        // Start the game with the player’s turn
        this.node.on(Node.EventType.TOUCH_START , this.onTouchEnd, this);
        this.saveButton.node.on('click', this.onSaveButtonClick, this);
        this.loadButton.node.on('click', this.onLoadButtonClick, this);
        this.startTurn();
    }

    startTurn() {
        if (this.playerTurn) {
            this.changeTurnInfo(true);
            this.playerController.enableControls(true); // Enable player controls
            this.aiController.enableControls(false); // Disable AI controls during player’s turn

        } else {
            this.changeTurnInfo(false);
            // Allow the AI to act
            this.aiController.enableControls(true); // Enable AI controls
            this.playerController.enableControls(false); // Disable player controls during AI’s turn

            this.startAITurn();
        }
    }

    endTurn() {
        // End the current turn and swap turns
        this.playerTurn = !this.playerTurn;
        this.startTurn(); // Start the next turn
    }

    async onTouchEnd(event: EventTouch) {
        if (!this.playerTurn || this.gridMovement.isMovingAI || this.gridMovement.isMovingPlayer || !this.playerController.isPlayerActive)  return; // Only allow movement during player's turn

        let touchLocation = event.getUILocation();
        let worldPos = this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(
            new Vec3(touchLocation.x, touchLocation.y, 0)
        );

        let grid = this.tileMapController.worldPosToGridCoords(worldPos, this.gridMovement.gridOrigin, this.gridMovement.tileSize)

        // Convert grid coordinates back to world position
        let snappedX = (grid.x * this.gridMovement.tileSize) + this.gridMovement.gridOrigin.x;
        let snappedY = (grid.y * this.gridMovement.tileSize) + this.gridMovement.gridOrigin.y;

        let newPosition = new Vec3(
            snappedX + this.gridMovement.tileSize / 2,
            snappedY + this.gridMovement.tileSize / 2,
            0
        );
        // Move the player and end the turn
        await this.gridMovement.moveToTarget(newPosition, true, this.playerController.maxMoveRange);

        let gridPlayer = this.tileMapController.worldPosToGridCoords(this.player.position, this.gridMovement.gridOrigin, this.gridMovement.tileSize)
        let gridAI = this.tileMapController.worldPosToGridCoords(this.ai.position, this.gridMovement.gridOrigin, this.gridMovement.tileSize)
        let damage = this.combatController.calculateDamage( this.tileMapController.getTerrainAt(gridPlayer.x, gridPlayer.y),  this.tileMapController.getTerrainAt(gridAI.x, gridAI.y), this.playerController.baseDamage)
        await this.tileMapController.playChildAnimation(this.tileMapController.getTileAt(gridAI.x, gridAI.y), this.tileMapController.getTerrainAt(gridPlayer.x, gridPlayer.y))
        this.aiController.takeDamage(damage);

        if (this.isGameOver()) {
            this.endGame();
        } else {
            this.endTurn();
        }
    }

    async startAITurn() {
        if (this.playerTurn) return;
    
       if (this.player) {
            this.gridMovement.currentPositionAI = this.ai.position;
            this.gridMovement.currentPositionPlayer = this.player.position;
        
            let aiMove = this.getBestMoveAI();
            let snappedX = (aiMove.x * this.gridMovement.tileSize) + this.gridMovement.gridOrigin.x;
            let snappedY = (aiMove.y * this.gridMovement.tileSize) + this.gridMovement.gridOrigin.y;

            let newPosition = new Vec3(
                snappedX + this.gridMovement.tileSize / 2,
                snappedY + this.gridMovement.tileSize / 2,
                0
            );

            await this.gridMovement.moveToTarget(newPosition, false, this.aiController.maxMoveRange);
            let gridPlayer = this.tileMapController.worldPosToGridCoords(this.player.position, this.gridMovement.gridOrigin, this.gridMovement.tileSize)
            let gridAI = this.tileMapController.worldPosToGridCoords(this.ai.position, this.gridMovement.gridOrigin, this.gridMovement.tileSize)
            let damage = this.combatController.calculateDamage(this.tileMapController.getTerrainAt(gridAI.x, gridAI.y), this.tileMapController.getTerrainAt(gridPlayer.x, gridPlayer.y), this.playerController.baseDamage)
            await this.tileMapController.playChildAnimation(this.tileMapController.getTileAt(gridPlayer.x, gridPlayer.y), this.tileMapController.getTerrainAt(gridAI.x, gridAI.y))

            this.playerController.takeDamage(damage);
        }
        
        // After movement ends, change turn
        if (this.isGameOver()) {
            this.endGame();
        } else {
            this.endTurn();
        }
    }

    getBestMoveAI(): Vec3 | null {
        let maxDamage = -Infinity;
        let actualPosition = this.tileMapController.worldPosToGridCoords(this.gridMovement.currentPositionAI, this.gridMovement.gridOrigin, this.gridMovement.tileSize);
        let bestMove: Vec3 | null = new Vec3(actualPosition.x, actualPosition.y, 0);

        // Loop over all possible tiles within movement range
        
        let aiPosition = this.tileMapController.worldPosToGridCoords(this.gridMovement.currentPositionAI, this.gridMovement.gridOrigin, this.gridMovement.tileSize);        
        let playerPosition = this.tileMapController.worldPosToGridCoords(this.gridMovement.currentPositionPlayer, this.gridMovement.gridOrigin, this.gridMovement.tileSize);

        for (let dx = -this.aiController.maxMoveRange; dx <= this.aiController.maxMoveRange; dx++) {
            for (let dy = -this.aiController.maxMoveRange; dy <= this.aiController.maxMoveRange; dy++) {
                let targetX = aiPosition.x + dx;
                let targetY = aiPosition.y + dy;

                let snappedX = (targetX * this.gridMovement.tileSize) + this.gridMovement.gridOrigin.x;
                let snappedY = (targetY * this.gridMovement.tileSize) + this.gridMovement.gridOrigin.y;

                let newPosition = new Vec3(
                    snappedX + this.gridMovement.tileSize / 2,
                    snappedY + this.gridMovement.tileSize / 2,
                    0
                );

                // Check if the position is within grid bounds
                if (this.isValidPosition(targetX, targetY) && this.gridMovement.isTileFree(targetX, targetY) && this.gridMovement.findPath(this.gridMovement.grid,this.gridMovement.currentPositionAI, newPosition).length > 0) {
                    let terrainAtTarget = this.tileMapController.getTerrainAt(targetX, targetY);
                    let playerTerrain = this.tileMapController.getTerrainAt(playerPosition.x, playerPosition.y);
                    
                    // Calculate the potential damage
                    let damage = this.combatController.calculateDamage(terrainAtTarget, playerTerrain, this.aiController.baseDamage);

                    // If this move results in higher damage, update bestMove
                    if (damage > maxDamage) {
                        maxDamage = damage;
                        bestMove = new Vec3(targetX, targetY, 0);
                    }
                }
            }
        }

        return bestMove;
    }

    isValidPosition(x: number, y: number): boolean {
        // Check if the target position is within the 6x6 grid bounds
        return x >= 0 && y >= 0 && x < 6 && y < 6;
    }

    changeTurnInfo(isPlayer:boolean) {

        // Update the message based on who won
        if (isPlayer) {
            this.turnInfoLabel.string = "Your Turn";
        } else {
            this.turnInfoLabel.string = "Enemy Turn";
        }
        this.turnNumberLabel.string = "Turn: " + this.turn;

        this.turn++;
    }

    isGameOver(): boolean {
        // Check if either player or AI has died
        return this.playerController.currentHealth <= 0 || this.aiController.currentHealth <= 0;
    }

    endGame() {

        // Disable all actions
        this.playerController.enableControls(false);
        this.aiController.enableControls(false);
        
        // Update the message based on who won
        if (this.playerController.currentHealth <= 0) {
            this.gameOverLabel.string = "Enemy Win!";
        } else if (this.aiController.currentHealth <= 0) {
            this.gameOverLabel.string = "You Win!";
        }
        this.gameOverLabel.active = true;
    }

    onSaveButtonClick() {
        const gameState = {
            playerPosition: this.player.position,
            aiPosition: this.ai.position,
            playerHealth: this.playerController.currentHealth,
            aiHealth: this.aiController.currentHealth,
            playerTurn: this.playerTurn,
            turn: this.turn,
            terrainGrid: this.tileMapController.getTerrainGridData() // Ensure you have a method to get terrain data
        };
        console.log(this.tileMapController.getTerrainGridData())
        sys.localStorage.setItem('gameState', JSON.stringify(gameState));
        console.log("Game Saved");
    }

    onLoadButtonClick() {
        const savedState = sys.localStorage.getItem('gameState');
        if (savedState) {
            const gameState = JSON.parse(savedState);
    
            this.player.setPosition(new Vec3(gameState.playerPosition.x, gameState.playerPosition.y, gameState.playerPosition.z));
            this.ai.setPosition(new Vec3(gameState.aiPosition.x, gameState.aiPosition.y, gameState.aiPosition.z));
            this.gridMovement.currentPositionPlayer = gameState.playerPosition;
            this.gridMovement.currentPositionAI = gameState.aiPosition;
    
            this.playerController.currentHealth = gameState.playerHealth;
            this.playerController.updateHealthBar();
            this.aiController.currentHealth = gameState.aiHealth;
            this.aiController.updateHealthBar();
            this.playerTurn = gameState.playerTurn;
            this.turn = gameState.turn;
            this.turnNumberLabel.string = "Turn: " + (this.turn-1);

            if (this.playerTurn) {
                this.turnInfoLabel.string = "Your Turn";
                this.aiController.enableControls(false);
                this.playerController.enableControls(true);
            } else {
                this.turnInfoLabel.string = "Enemy Turn";
                this.aiController.enableControls(true);
                this.playerController.enableControls(false);
            }

            this.gameOverLabel.active = false;
            this.gameOverLabel.string = '';

            this.gridMovement.initializeGrid();

            this.tileMapController.loadTerrainGridData(gameState.terrainGrid); // Ensure you have a method for this
            console.log(gameState.terrainGrid)
        } else {
            console.log("No saved game found.");
        }
    }

    
}