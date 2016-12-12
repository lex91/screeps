const roleBuilder = {
	run: function (creep) {
		
		if (creep.memory.repairing && creep.carry.energy == 0) {
			creep.memory.repairing = false;
			creep.memory.targetId = null;
			
			creep.say('harvesting');
		}
		if (!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
			const targets = creep.room.find(FIND_STRUCTURES, {
				filter: (object) => (object.hits / object.hitsMax < 0.95) && (
					object.structureType === STRUCTURE_ROAD ||
					object.structureType === STRUCTURE_CONTAINER ||
					object.structureType === STRUCTURE_WALL && object.hits < 1000 ||
					object.structureType === STRUCTURE_RAMPART && object.hits < 1000
				)
			});
			
			if (targets.length > 0) {
				let chosenTarget;
				let minMeasure = Infinity;
				
				for (const target of targets) {
					const measure = target.hits / target.hitsMax;
					if (measure < minMeasure) {
						minMeasure = measure;
						chosenTarget = target;
					}
				}
				// chosenTarget = targets[0];
				
				creep.memory.repairing = true;
				creep.memory.targetId = chosenTarget.id;
				
				creep.say('repairing');
			} else {
				creep.memory.repairing = true;
				creep.memory.targetId = null;
				
				creep.say('nothing to repair');
			}
			
			
		}
		
		if (creep.memory.repairing) {
			const target = creep.memory.targetId ? Game.getObjectById(creep.memory.targetId) : null;
			
			if (target && target.hits < target.hitsMax) {
				if (creep.repair(target) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				}
			} else {
				creep.memory.repairing = false;
				creep.memory.targetId = null;
			}
		}
		else {
			const sources = creep.room.find(FIND_SOURCES);
			if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
				creep.moveTo(sources[0], {reusePath: 0});
			}
		}
	}
};


module.exports = roleBuilder;