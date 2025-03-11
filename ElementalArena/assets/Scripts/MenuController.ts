import { _decorator, Component, Button, director, AudioSource } from 'cc';

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

        this.audioSource.loop = true;
        this.audioSource.play();
    }

    

    // Handle start game button click
    onStartGame() {
        console.log('Starting the game...');
        director.loadScene('arena'); 
    }

}