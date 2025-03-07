import { _decorator, Component, Node, EventKeyboard, KeyCode, systemEvent, SystemEventType, UITransform, Vec3, ProgressBar, Color } from 'cc';

const { ccclass, property } = _decorator;


@ccclass('PlayerController')
export class PlayerController extends Component {

    @property(ProgressBar)
    public healthBar: ProgressBar = null;

    private isPlayerActive: boolean = false; // Flag to check if the player can take actions
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

    enableControls(enable: boolean) {
        this.isPlayerActive = enable; // Enable/disable player controls
    }

    takeDamage(amount: number) {
        this.currentHealth -= amount;
        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            this.handleDeath(); // Handle death if health is 0
        }
        this.updateHealthBar();
        console.log(`Player's current health: ${this.currentHealth}`);
    }

    handleDeath() {
        console.log('Player has died');
        // You could disable player controls, show a game over screen, etc.
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

}