import { _decorator, Component, Node, UITransform, EventTouch, Vec3 } from 'cc';
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

    private playerController: PlayerController;
    private aiController: AIController;
    private gridMovement: GridMovement;
    private combatController: CombatController;
    private tileMapController: TilemapGenerator;

    start() {

        // Initialize controllers
        this.playerController = this.player.getComponent(PlayerController);
        this.aiController = this.ai.getComponent(AIController);
        this.combatController = this.node.getComponent(CombatController);
        this.tileMapController = this.node.getComponent(TilemapGenerator);

        try {
            this.gridMovement = new GridMovement(this.player, 1, 1, this.ai, 5, 5);
        } catch (error) {
            console.error("Error initializing GridMovement:", error);
        }

        if (!this.playerController || !this.aiController) {
            console.error("PlayerController or AIController not attached properly.");
            return;
        }

        // Start the game with the player’s turn
        this.node.on(Node.EventType.TOUCH_START , this.onTouchEnd, this);
        this.startTurn();
    }

    onTouchEnd(event: EventTouch) {
        if (!this.playerTurn) return; // Only allow movement during player's turn

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
        let actualPosition = this.gridMovement.moveToTarget(newPosition);

        let gridPlayer = this.tileMapController.worldPosToGridCoords(actualPosition, this.gridMovement.gridOrigin, this.gridMovement.tileSize)
        let gridAI = this.tileMapController.worldPosToGridCoords(this.ai.position, this.gridMovement.gridOrigin, this.gridMovement.tileSize)
        // console.log('posicao player'+ this.tileMapController.getTerrainAt(gridPlayer.x, gridPlayer.y))
        // console.log('posicao ai'+ this.tileMapController.getTerrainAt(gridAI.x, gridAI.y))  
        let damage = this.combatController.calculateDamage( this.tileMapController.getTerrainAt(gridPlayer.x, gridPlayer.y),  this.tileMapController.getTerrainAt(gridAI.x, gridAI.y), this.playerController.baseDamage)
        console.log(damage);
        this.endTurn();
    }

    startTurn() {
        if (this.playerTurn) {
            console.log("Player's turn");

            // Allow the player to act
            // this.startPlayerTurn();
            this.playerController.enableControls(true); // Enable player controls
            this.aiController.enableControls(false); // Disable AI controls during player’s turn

        } else {
            console.log("AI's turn");

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

    startAITurn() {
        if (this.playerTurn) return;
        console.log('turno da ia')
       if (this.player) {
            // Here we get the player's position as the target
            // let playerPosition = this.player.position;
        console.log('turno da ia')
            // Call the GridMovement method to move the AI towards the player
            let aiMove = this.getBestMoveAI();
            let snappedX = (aiMove.x * this.gridMovement.tileSize) + this.gridMovement.gridOrigin.x;
            let snappedY = (aiMove.y * this.gridMovement.tileSize) + this.gridMovement.gridOrigin.y;

            let newPosition = new Vec3(
                snappedX + this.gridMovement.tileSize / 2,
                snappedY + this.gridMovement.tileSize / 2,
                0
            );

            this.gridMovement.moveToTarget(newPosition, false);
        }
        
        // After movement ends, change turn
        this.endTurn();
    }

    getBestMoveAI(): Vec3 | null {
        let maxDamage = -Infinity;
        let bestMove: Vec3 | null = null;

        // Loop over all possible tiles within movement range
        
        let aiPosition = this.tileMapController.worldPosToGridCoords(this.ai.position, this.gridMovement.gridOrigin, this.gridMovement.tileSize);        
        let playerPosition = this.tileMapController.worldPosToGridCoords(this.ai.position, this.gridMovement.gridOrigin, this.gridMovement.tileSize);

        for (let dx = -this.aiController.maxMoveRange; dx <= this.aiController.maxMoveRange; dx++) {
            for (let dy = -this.aiController.maxMoveRange; dy <= this.aiController.maxMoveRange; dy++) {
                let targetX = aiPosition.x + dx;
                let targetY = aiPosition.y + dy;

                // Check if the position is within grid bounds
                if (this.isValidPosition(targetX, targetY)) {
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
    
}