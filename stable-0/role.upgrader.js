var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        creep.memory.upgrading = creep.memory.upgrading ? creep.carry.energy > 0 : creep.carry.energy == creep.carryCapacity;

	    if (creep.memory.upgrading) {
            const operationResult = creep.upgradeController(creep.room.controller);
            
            if (operationResult == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        else {
            let chosenSource = creep.memory.sourceId ? Game.getObjectById(creep.memory.sourceId) : null;
            
            if (!chosenSource) {
                const sources = creep.room.find(FIND_SOURCES);
                let minPathLength = Infinity;
            
                for (const source of sources) {
                    const path = creep.room.findPath(creep.pos, source.pos);
                    if (path.length < minPathLength) {
                        chosenSource = source;
                        minPathLength = path.length;
                    }
                    
                }
            }
            // console.log(chosenSource, creep.memory.sourceId);
            
            if(creep.harvest(chosenSource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(chosenSource, {reusePath:0});
            }
        }
	}
};

module.exports = roleUpgrader;