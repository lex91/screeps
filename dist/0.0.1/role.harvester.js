const roleHarvester = {
	run: function (creep) {
		if (creep.carry.energy < creep.carryCapacity) {
			const sources = creep.room.find(FIND_SOURCES);
			if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
				creep.moveTo(sources[0], {reusePath: 0});
			}
		}
		else {
			let targets = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					return (
							structure.structureType == STRUCTURE_EXTENSION ||
							structure.structureType == STRUCTURE_SPAWN
						) && structure.energy < structure.energyCapacity;
				}
			});
			
			if (targets.length === 0) {
				targets = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
						return (
								structure.structureType == STRUCTURE_TOWER
							) && structure.energy < structure.energyCapacity;
					}
				});
			}

			if (targets.length > 0) {
				const actionResult = creep.transfer(targets[0], RESOURCE_ENERGY);

				if (actionResult == ERR_NOT_IN_RANGE) {
					creep.moveTo(targets[0]);
				}
			}
		}
	}
};


module.exports = roleHarvester;