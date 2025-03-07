import { _decorator, Component, Node, Vec3, Animation, tween, ProgressBar, UITransform, Color } from 'cc';
import { GridMovement } from './GridMovement'; // Import your GridMovement script

const { ccclass, property } = _decorator;

@ccclass('AIController')
export class AIController extends Component {

    @property(ProgressBar)
    public healthBar: ProgressBar = null;

    @property
    aiSpeed: number = 0.2; // Speed of the AI movement (seconds per tile)

    @property
    maxMoveRange: number = 3; // Max range the AI can move in one turn

    @property
    baseDamage: number = 5;

    @property
    public maxHealth: number = 100;

    @property
    public currentHealth: number = 100;

    start() {
        this.node.getComponent(ProgressBar);
        this.updateHealthBar();
    }

    takeDamage(amount: number) {
        this.currentHealth -= amount;
        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            this.handleDeath(); // Handle death if health is 0
        }
        this.updateHealthBar();
        console.log(`damage taken AI: ${amount}`);
        console.log(`AI's current health: ${this.currentHealth}`);
    }

    handleDeath() {
        console.log('AI has died');
        // You could disable AI actions or handle it differently (e.g., remove AI from the game)
    }

    updateHealthBar() {
        const healthProgress = this.currentHealth / this.maxHealth;
        this.healthBar.progress = healthProgress;
        if (this.currentHealth <= this.maxHealth * 0.2) {
            this.healthBar.node.getComponent(UITransform).color = new Color(255, 0, 0); // Red when health is low
        } else if (this.currentHealth <= this.maxHealth * 0.5) {
            this.healthBar.node.getComponent(UITransform).color = new Color(255, 255, 0); // Yellow when health is half
        } else {
            this.healthBar.node.getComponent(UITransform).color = new Color(0, 255, 0); // Green when health is high
        }
    }

    enableControls(enable: boolean) {
        // Control AI actions based on the turn
        if (enable) {
            console.log("AI can act now.");
        } else {
            console.log("AI can't act right now.");
        }
    }

}