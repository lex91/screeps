import {log} from '../support/log';

/**
 * Runs tower.
 *
 * @export
 * @param {Tower} tower
 */
export function run(tower: Tower): void {
	const closestHostile = tower.pos.findClosestByRange<Creep>(FIND_HOSTILE_CREEPS);
	if (closestHostile) {
		tower.attack(closestHostile);

		return;
	}

	const damagedStructures = tower.room.find<Structure>(FIND_STRUCTURES, {
		filter: (structure: Structure) => structure.hits / structure.hitsMax < 0.95
	});

	const structuresByPriority: Structure[][] = [];
	for (const structure of damagedStructures) {
		const priority = _calculateRepairingPriority(structure);

		if (!structuresByPriority[priority]) {
			structuresByPriority[priority] = [];
		}

		structuresByPriority[priority].push(structure);
	}

	const priorityTreshold = Math.min(Math.floor((tower.energy - 401) / 100) + 1, structuresByPriority.length);

	for (let i = 0; i < priorityTreshold; i++) {
		const priorityStructures = structuresByPriority[i];
		if (priorityStructures) {
			const maxDamagedStructure = priorityStructures.reduce((selected, current) => (
				current.hits / current.hitsMax < selected.hits / selected.hitsMax ?
					current :
					selected
			));
			log.debug('tower will repair ID: ' + maxDamagedStructure.id);

			tower.repair(maxDamagedStructure);

			return;
		}
	}
}


function _calculateRepairingPriority(structure: Structure): number {
	const durability = structure.hits / structure.hitsMax;

	switch (structure.structureType) {
		case STRUCTURE_ROAD:
			if (durability > 0.9) {
				return 5;
			} else if (durability > 0.75) {
				return 4;
			} else if (durability > 0.5) {
				return 3;
			} else if (durability > 0.25) {
				return 2;
			}

			break;
		case STRUCTURE_WALL:
			if (structure.hits > 100000) {
				return 5;
			} else if (structure.hits > 50000) {
				return 4;
			} else if (structure.hits > 25000) {
				return 3;
			} else if (structure.hits > 10000) {
				return 2;
			}

			break;
		case STRUCTURE_CONTAINER:
			if (durability > 0.9) {
				return 5;
			} else if (durability > 0.75) {
				return 4;
			} else if (durability > 0.5) {
				return 3;
			} else if (durability > 0.25) {
				return 2;
			}

			break;
		default: {
			// Do nothing
		}
	}

	return 1; // First priority by default.
}
