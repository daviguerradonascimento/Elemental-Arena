import { _decorator, Component, Node, UITransform, EventTouch, Vec3 } from 'cc';
import { AIController } from './AIController';
import { GridMovement } from './GridMovement'; // Assuming GridMovement is being used for the player as well
import { PlayerController } from './PlayerController';

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

    start() {

        if (!this.node.getComponent(UITransform)) {
            console.log("Adding UITransform...");
            this.node.addComponent(UITransform);
        }
        // Initialize controllers
        this.playerController = this.player.getComponent(PlayerController);
        this.aiController = this.ai.getComponent(AIController);
        // this.gridMovement = this.player.getComponent(GridMovement); // Assuming GridMovement is the player movement handler
        if (!this.player) {
            console.error("Player node is not assigned in the editor.");
            return;
        }
        try {
            this.gridMovement = new GridMovement(this.player, 1, 1, this.ai, 5, 5);
        } catch (error) {
            console.error("Error initializing GridMovement:", error);
        }
        // this.gridMovement.initialize();

        if (!this.playerController || !this.aiController) {
            console.error("PlayerController or AIController not attached properly.");
            return;
        }

        // Start the game with the player’s turn
        this.node.on(Node.EventType.TOUCH_START , this.onTouchEnd, this);
        this.startTurn();
    }

    onTouchEnd(event: EventTouch) {
        console.log('teste')
        if (!this.playerTurn) return; // Only allow movement during player's turn

        let touchLocation = event.getUILocation();
        console.log(touchLocation)
        let worldPos = this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(
            new Vec3(touchLocation.x, touchLocation.y, 0)
        );

        let gridX = Math.floor((worldPos.x - this.gridMovement.gridOrigin.x) / this.gridMovement.tileSize);
        let gridY = Math.floor((worldPos.y - this.gridMovement.gridOrigin.y) / this.gridMovement.tileSize);

        // Ensure grid coordinates are within bounds (0 to 5 for a 6x6 grid)
        gridX = Math.max(0, Math.min(5, gridX));
        gridY = Math.max(0, Math.min(5, gridY));

        // Convert grid coordinates back to world position
        let snappedX = (gridX * this.gridMovement.tileSize) + this.gridMovement.gridOrigin.x;
        let snappedY = (gridY * this.gridMovement.tileSize) + this.gridMovement.gridOrigin.y;

        let newPosition = new Vec3(
            snappedX + this.gridMovement.tileSize / 2,
            snappedY + this.gridMovement.tileSize / 2,
            0
        );

        // Move the player and end the turn
        this.gridMovement.moveToTarget(newPosition);
        this.endTurn();
    }

    startAITurn() {
        if (this.playerTurn) return;
        
       if (this.player) {
            // Here we get the player's position as the target
            let playerPosition = this.player.position;

            // Call the GridMovement method to move the AI towards the player
            this.gridMovement.moveToTarget(playerPosition, false);
        }
        
        // After movement ends, change turn
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
}