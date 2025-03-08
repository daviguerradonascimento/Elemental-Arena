import { _decorator, Component, Node, Vec3, systemEvent, SystemEvent, SystemEventType, EventKeyboard, KeyCode, tween, Animation, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GridMovement')
export class GridMovement extends Component {
    @property
    tileSize: number = 120; // Adjust based on your grid size

    @property
    gridSize: number = 720; // 6x6 grid

    @property(Node)
    tileset: Node = null;

    
    private animation: Animation = null; // Reference to the character's animation component

    // @property([Node])
    // players: Node[] = [];

    private playerNode: Node = null;
    private aiNode: Node = null;

    
    private initialGridX: number = 0;
    private initialGridY: number = 0;

    private initialAIGridX: number = 5;
    private initialAIGridY: number = 5;

    public isMovingPlayer: boolean = false;
    public isMovingAI: boolean = false;
    public currentPositionPlayer: Vec3 = new Vec3(50, -300, 0);
    public currentPositionAI: Vec3 = new Vec3(50, -300, 0);
    public gridOrigin: Vec3 = new Vec3(-360, -360, 0); // Adjust based on Tiled origin

    public grid: number[][] = [];
    

    constructor(playerNode: Node, initialGridX: number, initialGridY: number,  aiNode: Node, initialAIGridX: number, initialAIGridY: number) {
        super();
        this.playerNode = playerNode;
        this.aiNode = aiNode;
        this.initialGridX = initialGridX;
        this.initialGridY = initialGridY;
        this.initialAIGridX = initialAIGridX;
        this.initialAIGridY = initialAIGridY;

        this.currentPositionPlayer = playerNode.position;
        this.currentPositionAI = aiNode.position;
        this.initializeGrid();
        this.setInitialPlayerPosition();

    }

    setInitialPlayerPosition() {
        // Set player position directly
        let newPlayerPosition = new Vec3(this.gridOrigin.x + this.initialGridX * this.tileSize + this.tileSize / 2, 
                                   this.gridOrigin.y + this.initialGridY * this.tileSize + this.tileSize / 2, 
                                   0);

        this.playerNode.setPosition(newPlayerPosition);
        this.currentPositionPlayer = newPlayerPosition;

        let newAIPosition = new Vec3(this.gridOrigin.x + this.initialAIGridX * this.tileSize + this.tileSize / 2, 
            this.gridOrigin.y + this.initialAIGridY * this.tileSize + this.tileSize / 2, 
            0);

        this.aiNode.setPosition(newAIPosition);
        this.currentPositionAI = newAIPosition;
    }

    moveToTarget(target: Vec3, isPlayer: boolean = true, maxMoveRange: number = 3): Promise<void> {
        return new Promise((resolve) => {
        if (this.isMovingPlayer && isPlayer){ resolve();  return;}
        if (this.isMovingAI && !isPlayer){  resolve();return;}
        
        let nodeToBeMoved = isPlayer? this.playerNode : this.aiNode;
        let currentPosition = isPlayer? this.currentPositionPlayer : this.currentPositionAI;

        let path = this.findPath(this.grid, currentPosition, target);

        if (path.length === 0) {
            console.log("No path found");
            resolve();
            return;
        }

        // Limit the path to the range
        
        path = path.slice(0, maxMoveRange);

        if(isPlayer){
            this.isMovingPlayer = true;
        }else{
            this.isMovingAI = true;
        }

  
        let moveDuration = 0.5; // Time to move between tiles    
        // let moveDuration = 0.2; // Time per tile
        let totalMoves = path.length;
        this.animation = nodeToBeMoved.getComponent(Animation);
        this.animation.play("Run");
        // Function to move character tile by tile
        const moveTile = (index: number) => {
            if (index >= totalMoves) {
                // Movement is complete
                if(isPlayer){
                    this.isMovingPlayer = false;
                    this.currentPositionPlayer = path[path.length - 1];
                }else{
                    this.isMovingAI = false;
                    this.currentPositionAI = path[path.length - 1];
                }
                this.initializeGrid();
                this.animation.stop();
                resolve();
                return path[path.length - 1];
            }
    
            // Move to the next tile in the path
            let nextPosition = path[index];
            
            tween(nodeToBeMoved)
                .to(moveDuration, { position: nextPosition }) // Move to next position in path
                .call(() => {
                    if(isPlayer){
                        this.currentPositionPlayer = path[path.length - 1];
                    }else{
                        this.currentPositionAI = path[path.length - 1];
                    }
                     // Update the current position after the move
                    moveTile(index + 1); // Move to the next tile after the current move finishes
                })
                .start();
        };
    
        // Start moving from the first tile in the path
            moveTile(0);
            return path[path.length - 1]
        });
        // console.log("Path to move:", path);
    }
    
    playAnimation(animName: string) {
        if (this.animation) {
            this.animation.play();
        }
    }

    findPath(grid: number[][], start: Vec3, end: Vec3): Vec3[] {
        // Convert the start and end positions into grid coordinates
        let startX = Math.floor((start.x - this.gridOrigin.x) / this.tileSize);
        let startY = Math.floor((start.y - this.gridOrigin.y) / this.tileSize);
        let endX = Math.floor((end.x - this.gridOrigin.x) / this.tileSize);
        let endY = Math.floor((end.y - this.gridOrigin.y) / this.tileSize);
    
        // Ensure start and end are within the grid bounds and passable
        if (grid[endY][endX] === 0) {
            console.log("end point is blocked");
            return []; // No valid path if start or end is blocked
        }
    
        let openList: Node[] = [];
        let closedList: Node[] = [];
        
        let startNode: Node = { x: startX, y: startY, g: 0, h: 0, parent: null };
        let endNode: Node = { x: endX, y: endY, g: 0, h: 0, parent: null };
        
        openList.push(startNode);
    
        while (openList.length > 0) {
            let currentNode = openList.sort((a, b) => a.g + a.h - b.g - b.h).shift()!;
            closedList.push(currentNode);
    
            // Check if we've reached the end
            if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
                let path: Vec3[] = [];
                let current = currentNode;
                while (current.parent) {
                    path.push(new Vec3(
                        current.x * this.tileSize + this.gridOrigin.x + this.tileSize / 2, 
                        current.y * this.tileSize + this.gridOrigin.y + this.tileSize / 2, 
                        0
                    ));
                    current = current.parent;
                }
    
                return path.reverse(); // Return the path in the correct order
            }
    
            // Check neighbors (up, down, left, right)
            for (let direction of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
                let neighborX = currentNode.x + direction[0];
                let neighborY = currentNode.y + direction[1];
    
                // Ensure the neighbor is within bounds and passable
                if (neighborX >= 0 && neighborX < grid[0].length && neighborY >= 0 && neighborY < grid.length && grid[neighborY][neighborX] === 1) {
                    
             
    
                    let gCost = currentNode.g + 1;
                    let hCost = Math.abs(neighborX - endNode.x) + Math.abs(neighborY - endNode.y); // Manhattan distance
                    let neighbor: Node = { x: neighborX, y: neighborY, g: gCost, h: hCost, parent: currentNode };
    
                    if (!closedList.some(node => node.x === neighbor.x && node.y === neighbor.y) &&
                        !openList.some(node => node.x === neighbor.x && node.y === neighbor.y && gCost >= node.g)) {
                        openList.push(neighbor);
                    }
                }
            }
        }
    
        return []; // No path found
    }

    initializeGrid() {
        // Assuming grid is 6x6, with all positions free initially (1)
        this.grid = Array.from({ length: 6 }, () => Array(6).fill(1)); 

        let gridX = Math.floor((this.playerNode.position.x - this.gridOrigin.x) / this.tileSize);
        let gridY = Math.floor((this.playerNode.position.y - this.gridOrigin.y) / this.tileSize);
        // Ensure the player is within bounds
        if (gridX >= 0 && gridX < 6 && gridY >= 0 && gridY < 6) {
            this.grid[gridY][gridX] = 0; // Mark the player's position as blocked
        }

        gridX = Math.floor((this.aiNode.position.x - this.gridOrigin.x) / this.tileSize);
        gridY = Math.floor((this.aiNode.position.y - this.gridOrigin.y) / this.tileSize);
        // Ensure the player is within bounds
        if (gridX >= 0 && gridX < 6 && gridY >= 0 && gridY < 6) {
            this.grid[gridY][gridX] = 0; // Mark the player's position as blocked
        }
        
    }

    isTileFree(x: number, y: number): boolean {
        return this.grid[y] && this.grid[y][x] === 1;
    }
}