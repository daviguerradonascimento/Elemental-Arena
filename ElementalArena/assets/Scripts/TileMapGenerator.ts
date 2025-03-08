import { _decorator, Component, Node, Prefab, instantiate, Vec3, UITransform, randomRangeInt, Sprite, SpriteFrame, SpriteAtlas, resources, Color } from 'cc';

const { ccclass, property } = _decorator;

enum TerrainType {
    Fire = 'Fire',
    Water = 'Water',
    Earth = 'Earth',
    FireSpecial = 'FireSpecial',
    WaterSpecial = 'WaterSpecial',
    EarthSpecial = 'EarthSpecial'
}

@ccclass('TilemapGenerator')
export class TilemapGenerator extends Component {
    @property(Prefab)
    tilePrefab: Prefab = null; // Assign a tile prefab in the editor

    @property(Node)
    gridContainer: Node = null; // The parent node where tiles will be instantiated

    @property(SpriteFrame)
    fireSprite: SpriteFrame = null;

    @property(SpriteFrame)
    waterSprite: SpriteFrame = null;

    @property(SpriteFrame)
    earthSprite: SpriteFrame = null;

    @property(SpriteFrame)
    fireSpecialSprite: SpriteFrame = null;

    @property(SpriteFrame)
    waterSpecialSprite: SpriteFrame = null;

    @property(SpriteFrame)
    earthSpecialSprite: SpriteFrame = null;

    // sprite.spriteFrame = this.earthSprite;

    @property
    arenaSize: number = 6; // 6x6 grid

    @property
    tileSize: number = 120; // Tile size (adjust as needed)

    private tileData: TerrainType[][] = [];
    private tiles: Node[][] = [];

    private Sprite: Sprite;

    start() {
        this.generateTilemap();
    }

    // generateTilemap() {
    //     this.tileData = [];

    //     for (let y = 0; y < this.arenaSize; y++) {
    //         this.tileData[y] = [];

    //         for (let x = 0; x < this.arenaSize; x++) {
    //             let terrain = this.getRandomTerrain();
    //             this.tileData[y][x] = terrain;
    //             this.createTile(x, y, terrain);
    //         }
    //     }

    //     console.log("Generated Tilemap:", this.tileData);
    // }

    generateTilemap() {
        this.tileData = [];

        // Calculate the total number of tiles
        const totalCount = this.arenaSize * this.arenaSize;
        const specialCount = 1; // Number of special tiles for each element
        const regularCount = (totalCount - (specialCount * 3)) / 3; // Number of regular tiles for each element

        // Create arrays for the terrain types (balanced and special ones included)
        let terrains: TerrainType[] = [];
        
        // Add regular tiles for each terrain type
        for (let i = 0; i < regularCount; i++) {
            terrains.push(TerrainType.Fire, TerrainType.Water, TerrainType.Earth);
        }

        // Add special tiles (1 for each terrain type)
        for (let i = 0; i < specialCount; i++) {
            terrains.push(TerrainType.FireSpecial, TerrainType.WaterSpecial, TerrainType.EarthSpecial);
        }

        // Shuffle the terrain array to randomize the placement
        terrains = this.shuffleArray(terrains);

        // Fill the tileData array with terrain values
        let terrainIndex = 0;
        for (let y = 0; y < this.arenaSize; y++) {
            this.tileData[y] = [];
            for (let x = 0; x < this.arenaSize; x++) {
                let terrain = terrains[terrainIndex++];
                this.tileData[y][x] = terrain;
                this.createTile(x, y, terrain);
            }
        }

        console.log("Generated Tilemap:", this.tileData);
    }

    shuffleArray(array: any[]): any[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    createTile(x: number, y: number, terrain: TerrainType) {
        if (!this.tilePrefab || !this.gridContainer) {
            console.error("Tile prefab or grid container not assigned.");
            return;
        }
    
        let tileNode = instantiate(this.tilePrefab);
        this.gridContainer.addChild(tileNode);
    
        // Calculate the correct starting offset for centering the grid
        const startX = -((this.arenaSize * this.tileSize) / 2) + this.tileSize / 2;
        const startY = -((this.arenaSize * this.tileSize) / 2) + this.tileSize / 2;
    
        let position = new Vec3(
            startX + x * this.tileSize, 
            startY + y * this.tileSize, 
            0
        );
    
        tileNode.setPosition(position);
    
        // Store terrain type in the tile's name for debugging
        tileNode.name = `Tile_${x}_${y}_${terrain}`;
    
        console.log(`Created ${terrain} tile at ${position.x}, ${position.y}`);
    
        this.setTileAppearance(tileNode, terrain);

        if (!this.tiles[y]) {
            this.tiles[y] = [];
        }

        this.tiles[y][x] = tileNode;
    }


    

    setTileAppearance(tileNode: Node, terrain: TerrainType) {
        const sprite = tileNode.getComponent(Sprite); // Assuming the tile uses a Sprite component
    
        if (sprite) {
            sprite.color = new Color(255, 255, 255);
            switch (terrain) {
                case TerrainType.Fire:
                    // sprite.color = new Color(255, 0, 0); // Red for Fire
                    sprite.spriteFrame = this.fireSprite;
                    break;
                case TerrainType.Water:
                    // sprite.color = new Color(0, 0, 255); // Blue for Water
                    sprite.spriteFrame = this.waterSprite;
                    break;
                case TerrainType.Earth:
                    // sprite.color = new Color(139, 69, 19); // Brown for Earth
                    sprite.spriteFrame = this.earthSprite;
                    // sprite.spriteFrame = this.earthSprite; // Use a mountain sprite
                    break;
                case TerrainType.FireSpecial:
                    // sprite.spriteFrame = this.fireSpecialSprite;
                    sprite.spriteFrame = this.fireSprite
                    sprite.color = new Color(255, 165, 0); // Orange for special Fire
                    break;
                case TerrainType.WaterSpecial:
                    // sprite.spriteFrame = this.waterSpecialSprite;
                    sprite.spriteFrame = this.waterSprite
                    sprite.color = new Color(0, 0, 255); // Cyan for special Water
                    break;
                case TerrainType.EarthSpecial:
                    // sprite.spriteFrame = this.earthSpecialSprite;
                    sprite.spriteFrame = this.earthSprite
                    sprite.color = new Color(0, 100, 0); // Sienna for special Earth
                    break;
                default:
                    sprite.color = new Color(255, 255, 255); // Default color (white)
                    break;
            }
        }
    }

    worldPosToGridCoords(worldPos: Vec3, gridOrigin: Vec3, tileSize: number): { x: number, y: number } {
        let gridX = Math.floor((worldPos.x - gridOrigin.x) / tileSize);
        let gridY = Math.floor((worldPos.y - gridOrigin.y) / tileSize);
    
        // Ensure grid coordinates are within bounds (0 to 5 for a 6x6 grid)
        gridX = Math.max(0, Math.min(5, gridX));
        gridY = Math.max(0, Math.min(5, gridY));
    
        return { x: gridX, y: gridY };
    }

    getTerrainAt(x: number, y: number): TerrainType {
        return this.tileData[y]?.[x] || TerrainType.Earth; // Default to Earth
    }
    
    saveTerrainData() {
        const terrainData = this.getTerrainGridData();
        const terrainDataStr = JSON.stringify(terrainData);  // Serialize the grid data into a JSON string
        localStorage.setItem('terrainData', terrainDataStr);  // Save to localStorage (or any other method you prefer)
        console.log("Terrain data saved:", terrainData);
    }

    loadTerrainData() {
        const savedTerrainDataStr = localStorage.getItem('terrainData');
        
        if (savedTerrainDataStr) {
            const savedTerrainData = JSON.parse(savedTerrainDataStr);  // Deserialize the saved data
            this.loadTerrainGridData(savedTerrainData);  // Load the data into the grid
            console.log("Terrain data loaded:", savedTerrainData);
        } else {
            console.error("No terrain data found to load.");
        }
    }

    getTerrainGridData(): any {
        let terrainGrid = [];
    
        for (let y = 0; y < this.arenaSize; y++) {  // Use this.arenaSize for scalability
            let row = [];
            for (let x = 0; x < this.arenaSize; x++) {
                let terrainType = this.getTerrainAt(x, y); // Retrieve the terrain type for the tile
                row.push(terrainType);
            }
            terrainGrid.push(row);
        }
    
        return terrainGrid;
    }
    
    loadTerrainGridData(terrainGrid: any) {
        for (let y = 0; y < this.arenaSize; y++) {  // Iterate over rows first
            for (let x = 0; x < this.arenaSize; x++) {  // Then iterate over columns
                let terrainType = terrainGrid[y][x];  // Get the terrain type from saved data (row-major)
                this.setTerrainAt(x, y, terrainType);  // Set the terrain for the tile
            }
        }
    }

    setTerrainAt(x: number, y: number, terrainType: TerrainType) {
        let tileNode = this.getTileAt(x, y);  // Get the tile node based on the grid position
        if (tileNode) {
            // Set the terrain appearance based on the terrain type
            this.setTileAppearance(tileNode, terrainType);
        } else {
            console.error("No tile found at position:", x, y);
        }
    }

    getTileAt(x: number, y: number): Node | null {
        if (x < 0 || y < 0 || x >= this.arenaSize || y >= this.arenaSize) {
            console.error("Invalid grid coordinates:", x, y);
            return null; // Invalid position
        }

        return this.tiles[y]?.[x] || null;  // Return the tile node at the specified position
    }
    
}
