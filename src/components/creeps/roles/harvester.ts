import * as creepActions from '../creepActions';
import * as builder from './builder';
// import {log} from '../../support/log';


/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep
 */
export function run(creep: Creep): void {
	let spawn = creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];
	let structures: (Spawn|Extension|Tower)[] = creep.room.find<Spawn|Extension>(FIND_MY_STRUCTURES, {
		filter: (structure: Structure) => {
			if (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN) {
				const energyStructire = <Spawn|Extension> (structure);

				return energyStructire.energy < energyStructire.energyCapacity;
			}

			return false;
		}
	});
	if (structures.length === 0) {
		structures = creep.room.find<Spawn | Extension>(FIND_MY_STRUCTURES, {
			filter: (structure: Structure) => {
				if (structure.structureType === STRUCTURE_TOWER) {
					const energyStructire = <Tower> (structure);

					return energyStructire.energy < energyStructire.energyCapacity;
				}

				return false;
			}
		});
	}

	let energySource = creep.room.find<Source>(FIND_SOURCES_ACTIVE)[0];

	if (structures.length === 0) {
		return builder.run(creep);
	}

	let chosenTarget: Spawn|Extension|Tower = structures[0];
	let minMeasure = creep.room.findPath(creep.pos, chosenTarget.pos).length;
	for (let i = 1; i < structures.length; i++) {
		const measure = creep.room.findPath(creep.pos, structures[i].pos).length;
		if (measure < minMeasure) {
			minMeasure = measure;
			chosenTarget = structures[i];
		}
	}

	const workPartsCount = creep.body.reduce((result, bodyPart) => {
		return bodyPart.type === 'work' ? result + 1 : result;
	}, 0);

	let isTransferring = Boolean(creep.memory.isTransferring);

	if (isTransferring) {
		isTransferring = creep.carry.energy > 0;
	} else {
		isTransferring = creep.carry.energy > creep.carryCapacity - workPartsCount * 2;
	}

	if (creepActions.needsRenew(creep)) {
		creepActions.moveToRenew(creep, spawn);
	} else {
		if (isTransferring) {
			_moveToDropEnergy(creep, chosenTarget);
		} else {
			_moveToHarvest(creep, energySource);
		}
	}

	creep.memory.isTransferring = isTransferring;
}

function _tryHarvest(creep: Creep, target: Source): number {
	return creep.harvest(target);
}

function _moveToHarvest(creep: Creep, target: Source): void {
	if (_tryHarvest(creep, target) === ERR_NOT_IN_RANGE) {
		creepActions.moveTo(creep, target.pos);
	}
}

function _tryEnergyDropOff(creep: Creep, target: Spawn|Extension|Tower): number {
	const amount = Math.min(target.energyCapacity - target.energy, Number(creep.carry.energy));
	return creep.transfer(target, RESOURCE_ENERGY, amount);
}

function _moveToDropEnergy(creep: Creep, target: Spawn|Extension|Tower): void {
	if (_tryEnergyDropOff(creep, target) === ERR_NOT_IN_RANGE) {
		creepActions.moveTo(creep, target.pos);
	}
}
