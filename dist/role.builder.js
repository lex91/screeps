const roleBuilder = {
	run: (creep) => {
		if (creep.memory.building && creep.carry.energy === 0) {
			creep.memory.building = false;
		}
		if (!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
			creep.memory.building = true;
		}
		
		if (creep.memory.building) {
			let chosenTarget = null; //TODO: На случай, если объект будет сохраняться
			
			if (!chosenTarget) {
				const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
				
				if (targets.length > 0) {
					let minMeasure = Infinity;
					
					for (const target of targets) {
						const path = creep.room.findPath(creep.pos, target.pos);
						if (path.length < minMeasure) {
							chosenTarget = target;
							minMeasure = path.length;
						}
					}
				}
			}
			
			if (chosenTarget) {
				if (creep.build(chosenTarget) === ERR_NOT_IN_RANGE) {
					creep.moveTo(chosenTarget);
				}
			}
		} else {
			const sources = creep.room.find(FIND_SOURCES);
			if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
				creep.moveTo(sources[0], {reusePath: 0});
			}
		}
	}
};


module.exports = roleBuilder;