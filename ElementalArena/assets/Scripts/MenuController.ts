import { _decorator, Component, Button, Scene, director, EventTouch, AudioSource, SceneAsset, resources, AudioClip } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('MainController')
export class MainController extends Component {

    @property(Button)
    startButton: Button = null;

    @property(Button)
    settingsButton: Button = null;

    @property(Button)
    exitButton: Button = null;

    @property(Button)
    exitButton: Button = null;

    @property(Node)
    audioManager: Node = null;

    private audioSource: AudioSource;

    start() {
        // Add listeners to buttons
        this.startButton.node.on('click', this.onStartGame, this);
        this.audioSource = this.audioManager.getComponent(AudioSource);

        // this.audioSource.clip = clip;
            this.audioSource.loop = true;
        
            // Start playing
            this.audioSource.play();

        // resources.load("audio/backgroundMusic", AudioClip, (err, clip) => {
        //     if (err) {
        //         console.error("Failed to load background music:", err);
        //         return;
        //     }
        
        //     // Set loop to true for continuous playback
        //     this.audioSource.clip = clip;
        //     this.audioSource.loop = true;
        
        //     // Start playing
        //     this.audioSource.play();
        // });
        // this.settingsButton.node.on('click', this.onOpenSettings, this);
        // this.exitButton.node.on('click', this.onExitGame, this);
    }

    

    // Handle start game button click
    onStartGame() {
        console.log('Starting the game...');
        director.loadScene('arena'); 
    }

    // Handle settings button click
    onOpenSettings() {
        console.log('Opening settings...');
        // Open the settings menu
        director.loadScene('SettingsScene'); 
    }

    // Handle exit button click
    onExitGame() {
        console.log('Exiting the game...');
        // Close the game (for mobile, this would quit the app)
        if (cc.sys.isBrowser) {
            window.close();
        } else {
            cc.game.end();
        }
    }
}