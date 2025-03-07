import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

enum TerrainType {
    Fire = 'Fire',
    Water = 'Water',
    Earth = 'Earth',
    FireSpecial = 'FireSpecial',
    WaterSpecial = 'WaterSpecial',
    EarthSpecial = 'EarthSpecial'
}

const SpecialTerrainBonus: { [key: string]: number } = {
    [TerrainType.FireSpecial]: 1.75, // Fire Special increases damage by 75%
    [TerrainType.WaterSpecial]: 1.75, // Water Special increases damage by 75%
    [TerrainType.EarthSpecial]: 1.75 // Earth Special increases damage by 75%
};

const ElementalAdvantage: { [key: string]: string } = {
    [TerrainType.Fire]: TerrainType.Earth, // Fire > Earth, Fire > Water Special
    [TerrainType.Earth]: TerrainType.Water, // Earth > Water, Earth > Fire Special
    [TerrainType.Water]: TerrainType.Fire, // Water > Fire, Water > Earth Special
    [TerrainType.FireSpecial]: TerrainType.Earth, // Fire Special > Water, Fire Special > Earth
    [TerrainType.WaterSpecial]: TerrainType.Fire, // Water Special > Earth, Water Special > Fire
    [TerrainType.EarthSpecial]: TerrainType.Water // Earth Special > Fire, Earth Special > Water
};

@ccclass('CombatController')
export class CombatController extends Component {


    calculateDamage(attacker: string, defender: string, baseDamageAttacker: number): number {
        let baseDamage = baseDamageAttacker;
        
        // Check if the attacker has a terrain advantage
        if (ElementalAdvantage[attacker] === defender) {
            console.log(`${attacker} has advantage over ${defender}!`);
            baseDamage *= 1.5; 
            if (SpecialTerrainBonus[attacker]) {
                console.log(`${attacker} is on special terrain, dealing extra damage!`);
                baseDamage *= SpecialTerrainBonus[attacker]; // Increase damage if attacker is on special terrain
            }
        }
        
        // Check if the defender has a terrain disadvantage
        if (ElementalAdvantage[defender] === attacker) {
            console.log(`${defender} has a advantage against ${attacker}!`);
            baseDamage /= 1.5; 
        }
    
        // For simplicity, we just return the base damage with no other modifiers
        return Math.max(baseDamage, 0); // Ensure damage is not negative
    }
}


