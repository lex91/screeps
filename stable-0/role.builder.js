var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('building');
	    }

	    if(creep.memory.building) {
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
	        if(targets.length) {
	            let closestTarget;
                // let minPathLength = Infinity;
            
                // for (const target of targets) {
                //     const path = creep.room.findPath(creep.pos, target.pos);
                //     if (path.length < minPathLength) {
                //         closestTarget = target;
                //     }
                // }
                closestTarget = targets[0];
                // closestTarget = Game.getObjectById('584c1155b14a695e0d96522c');

                if(creep.build(closestTarget) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestTarget);
                }
            }
	    }
	    else {
	        var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {reusePath:0});
            }
	    }
	}
};

module.exports = roleBuilder;