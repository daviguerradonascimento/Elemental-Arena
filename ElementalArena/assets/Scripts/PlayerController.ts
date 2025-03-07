import { _decorator, Component, Node, EventKeyboard, KeyCode, systemEvent, SystemEventType, UITransform, Vec3 } from 'cc';

const { ccclass, property } = _decorator;


@ccclass('PlayerController')
export class PlayerController extends Component {

    private isPlayerActive: boolean = false; // Flag to check if the player can take actions

    start() {
        this.node.parent.on(SystemEventType.TOUCH_END, this.onTouchEnd, this); // Handle player movement
    }

    enableControls(enable: boolean) {
        this.isPlayerActive = enable; // Enable/disable player controls
    }


}