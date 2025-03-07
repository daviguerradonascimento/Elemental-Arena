import { _decorator, Component, Node, Vec3, Animation, tween } from 'cc';
import { GridMovement } from './GridMovement'; // Import your GridMovement script

const { ccclass, property } = _decorator;

@ccclass('AIController')
export class AIController extends Component {


    @property
    aiSpeed: number = 0.2; // Speed of the AI movement (seconds per tile)

    @property
    maxMoveRange: number = 3; // Max range the AI can move in one turn

    @property
    baseDamage: number = 5;

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

}