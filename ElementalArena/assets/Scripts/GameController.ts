import { _decorator, Component, Node, UITransform, EventTouch, Vec3, Label, Button, director, game } from 'cc';
import { AIController } from './AIController';
import { GridMovement } from './GridMovement'; // Assuming GridMovement is being used for the player as well
import { PlayerController } from './PlayerController';
import { CombatController } from './CombatController';
import { TilemapGenerator } from './TileMapGenerator';

const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    @property(Node)
    player: Node; // Reference to the player node

    @property(Node)
    ai: Node; // Reference to the AI node

    @property
    playerTurn: boolean = true; // Boolean to track whose turn it is

    @property(Label)
    gameOverLabel: Label;

    @property(Label)
    turnInfoLabel: Label;

    @property(Label)
    turnNumberLabel: Label;

    // @property(Button)
    // restartButton: Button = null;

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

        // this.restartButton.node.active = false;
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
        // this.restartButton.node.on('click', this.onRestartClick, this);
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

            // AI takes its turn (you can make this behavior asynchronous)
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

        this.aiController.takeDamage(damage);

        if (this.isGameOver()) {
            this.endGame();
        } else {
            this.endTurn();
        }
    }

    async startAITurn() {
        if (this.playerTurn) return;
    
        // Update positions from actual node positions
       

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
        let bestMove: Vec3 | null = this.tileMapController.worldPosToGridCoords(this.gridMovement.currentPositionAI, this.gridMovement.gridOrigin, this.gridMovement.tileSize);

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
            this.gameOverLabel.string = "Enemy Wins!";
        } else if (this.aiController.currentHealth <= 0) {
            this.gameOverLabel.string = "You Wins!";
        }
        this.gameOverLabel.active = true;
        // this.restartButton.node.active = true;
    }

    // onRestartClick() {
    //     // Reload the current scene to restart the game


    //     setTimeout(() => {
    //         // Reload the scene as if it's the first time
    //         director.loadScene('mainMenu');
    //     }, 100); // Adjust delay if necessary
    // }
    
}