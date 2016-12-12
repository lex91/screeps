const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleRepairer = require('role.repairer');
const utils = require('utils');

const loopFunction = () => {
    console.log();
    console.log(`$= = = Tick: ${Game.time} = = =`);

    utils.clearMemory();
    
    showRoomStatistics();
    showPopulationStatistics();
    
    const population = {
        'harvester': [],
        'upgrader': [],
        'repairer': [],
        'builder': []
    };
    
    for (let name in Game.creeps) {
        const creep = Game.creeps[name];
        
        population[creep.memory.role].push(creep);
        
        if ( //TODO: not working, not used
            // (creep.memory.role == 'harvester' && (creep.room.energyAvailable > 300 && creep.ticksToLive < 1000 || creep.ticksToLive < 100)) ||
            !true && (creep.memory.role == 'harvester' && creep.ticksToLive < 100 && creep.carry.energy == creep.carryCapacity) ||
            !true && (creep.memory.role == 'upgrader' && creep.ticksToLive < 100 && creep.carry.energy == 0) ||
            !true && (creep.memory.role == 'builder' && creep.ticksToLive < 100 && creep.carry.energy == 0)
            ) {
            //send them to renew
            creep.say(`renew: ${creep.ticksToLive}`);
            const spawn = Game.spawns['spawn'];
            if (spawn.renewCreep(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn);
            }
        } else {
            //roleRun['builder'](creep);
            roleRun[creep.memory.role](creep);
        }
    }
    
    for (let role in population) {
        if(population[role].length > 1) {
            population[role].sort((a, b) => a.ticksToLive - b.ticksToLive);
        }
    }
    
    if (population['harvester'].length < 1 || population['harvester'].length == 1 && population['harvester'][0].ticksToLive < 300) {
        utils.createHarvester([WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,CARRY]);
    } else if (population['repairer'].length < 1 || population['repairer'].length == 1 && population['repairer'][0].ticksToLive < 10) {
        utils.createRepairer([WORK,WORK,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY]);
    } else if (population['upgrader'].length < 4 || population['upgrader'].length == 4 && population['upgrader'][0].ticksToLive < 10) {
        utils.createUpgrader([WORK,WORK,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY]);
        
        const sources = ['5836b8298b8b9619519f192f', '5836b8298b8b9619519f1930'];
        const counts = [0,0];
        
        for (const upgrader of population['upgrader']) {
            switch (upgrader.memory.sourceId) {
                case sources[0]:
                    counts[0]++;
                    break;
                case sources[1]:
                    counts[1]++;
                    break;
                default:
                    if (counts[1] < 3) {
                        upgrader.memory.sourceId = sources[1];
                        counts[1]++;
                    } else {
                        upgrader.memory.sourceId = sources[0];
                        counts[0]++;
                    }
            }
        }
    } else if (population['builder'].length < 3 || population['builder'].length == 3 && population['builder'][0].ticksToLive < 10) {
        utils.createBuilder([WORK,WORK,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY]);
    }
    
    if (population['harvester'].length == 0) {
        let selectedCreep;
        let maxMeasure = -Infinity;
        
        for (let creepName in Game.creeps) {
            const creep = Game.creeps[creepName];
            
            if (creep.ticksToLive > maxMeasure) {
                maxMeasure = creep.ticksToLive;
                selectedCreep = creep;
            }
        }
        
        selectedCreep.memory = {role: 'harvester'};
    }
    
    console.log(`Population - harvesters: ${population['harvester'].length}, upgraders: ${population['upgrader'].length}, repairers: ${population['repairer'].length}, builders: ${population['builder'].length}`);
};


const showRoomStatistics = () => {
    for (let key in Game.rooms) {
        const room = Game.rooms[key];
        console.log(`Room ${room.name} -> energy: ${room.energyAvailable}`);
    }
};


const showPopulationStatistics = () => {
    for (let key in Game.creeps) {
        const creep = Game.creeps[key];
        const role = creep.memory.role;
        let roleInfo = '';
        switch (role) {
            case 'upgrader':
                roleInfo = `sourceId: ${creep.memory.sourceId}`;
                break;
        }
        console.log(`Creep ${creep.name} -> TTL: ${creep.ticksToLive}, body: [${creep.body.length}] role: ${creep.memory.role}, ${roleInfo}`);
    }
};


const updateRenew = (creep) => { //TODO: not working, not used
    const roomEnergy = creep.room.energyAvailable;
    
    // switch
    if (creep.memory.renew) {
        creep.memory.renew = (
            (creep.memory.role == 'harvester' && (creep.ticksToLive < 1400))
            (creep.memory.role != 'harvester' && (creep.ticksToLive < 300 && creep.room.energyAvailable > 100)||(false))
        );
    } else {
        creep.memory.renew = (
            (creep.memory.role == 'harvester' && (creep.room.energyAvailable > 400 && creep.ticksToLive < 300 || creep.ticksToLive < 100)) ||
            (creep.memory.role != 'harvester' && creep.ticksToLive < 300 && creep.room.energyAvailable > 100)
        );
    }
}


const roleRun = {
    'harvester': roleHarvester.run,
    'builder': roleBuilder.run,
    'repairer': roleRepairer.run,
    'upgrader': roleUpgrader.run
};


module.exports.loop = loopFunction;
