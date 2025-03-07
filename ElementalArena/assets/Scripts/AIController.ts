import { _decorator, Component, Node, Vec3, Animation, tween } from 'cc';
import { GridMovement } from './GridMovement'; // Import your GridMovement script

const { ccclass, property } = _decorator;

@ccclass('AIController')
export class AIController extends Component {


    @property
    aiSpeed: number = 0.2; // Speed of the AI movement (seconds per tile)

    @property
    maxMoveRange: number = 3; // Max range the AI can move in one turn

    // start() {
    //     // Get the GridMovement component from the AI node or another node

    //     // Start AI behavior
    //     // this.startAIMovement();
    // }

    enableControls(enable: boolean) {
        // Control AI actions based on the turn
        if (enable) {
            console.log("AI can act now.");
        } else {
            console.log("AI can't act right now.");
        }
    }

    // takeTurn(onComplete: Function) {
    //     // Here you can define what actions the AI performs during its turn
    //     // For now, the AI will just move towards the player
    //     let playerPosition = this.player.position;

    //     // Call GridMovement to move the AI towards the player
    //     this.gridMovement.moveToTarget(playerPosition);

    //     // After the AI moves, call onComplete to indicate the turn is finished
    //     setTimeout(() => {
    //         onComplete();
    //     }, 1000); // Adjust the delay based on your AI’s action duration
    // }

    // startAIMovement() {
    //     // AI should move toward the player, find a path, and move accordingly
    //     if (this.player) {
    //         // Here we get the player's position as the target
    //         let playerPosition = this.player.position;

    //         // Call the GridMovement method to move the AI towards the player
    //         this.gridMovement.moveToTarget(playerPosition);
    //     }
    // }

    // updateAIPosition() {
    //     // AI can perform other behaviors here, like patrolling, searching, etc.
    //     // For now, it just follows the player.
    //     if (this.aiNode.position.equals(this.player.position)) {
    //         console.log("AI has reached the player!");
    //         // Here you can trigger a battle or interaction.
    //     }
    // }
}