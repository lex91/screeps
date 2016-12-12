module.exports = {
    createHarvester: (body, name) => Game.spawns['spawn'].createCreep(body, name, {role: 'harvester'}),
    createRepairer: (body, name) => Game.spawns['spawn'].createCreep(body, name, {role: 'repairer'}),
    createBuilder: (body, name) => Game.spawns['spawn'].createCreep(body, name, {role: 'builder'}),
    createUpgrader: (body, name) => Game.spawns['spawn'].createCreep(body, name, {role: 'upgrader'}),
    setMemory: (creepName, memory) => Game.creeps[creepName].memory = memory,
    clearMemory: () => {
        for (let key in Memory.creeps) {
           if (!Game.creeps[key]) {
                delete Memory.creeps[key];
            }
        }
    }
};

/*
screep initial timeToLive - 1500 (3x Work, 2xCarry, 1x)
['id'].forEach(id => Game.getObjectById(id).remove()); //remove construction site
*/
