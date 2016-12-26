import * as staticHarvester from './roles/static-harvester';
import * as energyTransporter from './roles/energy-transporter';
import * as energyCharger from './roles/energy-charger';
import * as staticUpgrader from './roles/static-upgrader';
import * as builderOnly from './roles/builder-only';

import * as commonTower from './commonTower';

import {creepCreator} from './utils/creep-creator';

// import * as Config from '../../config';
import {log} from '../support/log';


export function run(room: Room): void {
	for (let creepName in Game.creeps) {
		const creep = Game.creeps[creepName];
		if (creep.memory.room === room.name) {
			if (!creep.spawning) {
				runCreepRole(creep);
			}
		}
	}

	const towers = room.find<Tower>(FIND_MY_STRUCTURES, {
		filter: (structure: Structure) => structure.structureType === STRUCTURE_TOWER
	});
	for (const tower of towers) {
		commonTower.run(tower);
	}

	_buildMissingCreeps(room);
}

function runCreepRole(creep: Creep) {
	const roleMemory = creep.memory.role;
	if (typeof roleMemory === 'object') {
		switch (roleMemory.name) {
			case 'static-harvester':
				return staticHarvester.run(creep);
			case 'energy-transporter':
				return energyTransporter.run(creep);
			case 'energy-charger':
				return energyCharger.run(creep);
			case 'static-upgrader':
				return staticUpgrader.run(creep);
			case 'builder-only':
				return builderOnly.run(creep);
			default:
			// logging error below
		}
	} else if (roleMemory === 'builder') { // TODO: remove

		if (creep.room.name !== 'W73S33') {
			creep.moveTo(26, 49);
			return;
		}

		let targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);

		let energySource: any = Game.getObjectById('5836b6de8b8b9619519ef7d0');

		if (energySource.energy === 0) {
			energySource = Game.getObjectById('5836b6de8b8b9619519ef7cf');
		}

		let isBuilding = Boolean(creep.memory.isBuilding);
		const workPartsCount = creep.body.reduce((result, bodyPart) => {
			return bodyPart.type === 'work' ? result + 1 : result;
		}, 0);

		if (isBuilding) {
			isBuilding = creep.carry.energy >= workPartsCount;
		} else {
			isBuilding = creep.carry.energy > creep.carryCapacity - workPartsCount * 2;
		}

		if (isBuilding) {
			if (targets.length === 0) {
				let renewTarget = Game.getObjectById<Structure>(creep.memory.renewTarget);
				if (!renewTarget || (renewTarget.hits / renewTarget.hitsMax > 0.99)) {
					const renewTargets = creep.room.find<Structure>(FIND_STRUCTURES, {
						filter: (structure: Structure) => (structure.hits / structure.hitsMax < 0.8) && (
							structure.structureType === STRUCTURE_ROAD ||
							structure.structureType === STRUCTURE_CONTAINER
						)
					});
					if (renewTargets.length === 0) {
						return;
					}
					renewTargets.sort((a: Structure, b: Structure) => ((a.hits / a.hitsMax) - (b.hits / b.hitsMax)));
					renewTarget = renewTargets[0];
					creep.memory.renewTarget = renewTarget.id;
				}
				_moveToRepair(creep, renewTarget);
			} else {
				_moveToBuild(creep, targets[0]);
			}
		} else {
			creep.memory.renewTarget = null;
			_moveToHarvest(creep, energySource);
		}

		creep.memory.isBuilding = isBuilding;


		function _tryHarvest(creep1: any, target1: any) {
			return creep1.harvest(target1);
		}

		function _moveToHarvest(creep1: any, target1: any) {
			if (_tryHarvest(creep1, target1) === ERR_NOT_IN_RANGE) {
				creep1.moveTo(target1);
			}
		}

		function _tryToBuild(creep1: any, target1: any) {
			return creep1.build(target1);
		}

		function _moveToBuild(creep1: any, target1: any) {
			if (_tryToBuild(creep1, target1) === ERR_NOT_IN_RANGE) {
				creep1.moveTo(target1);
			}
		}

		function _moveToRepair(creep1: any, target1: any) {
			if (creep1.repair(target1) === ERR_NOT_IN_RANGE) {
				creep1.moveTo(target1);
			}
		}

		return;
	}

	log.debug(`Creep with unknown role found: ${creep.name}`);
}


function _buildMissingCreeps(room: Room) {
	if (room.energyCapacityAvailable - room.energyAvailable < 200) {
		if (!Game.creeps['h1']) {
			creepCreator.createCreep({
				spawn: Game.spawns['W73S32-1'],
				body: {[WORK]: 5, [CARRY]: 1, [MOVE]: 2},
				name: 'h1',
				memory: {
					role: {
						name: 'static-harvester',
						data: {
							sourceId: '5836b6de8b8b9619519ef7ca',
							containerId: '585409e14a9a1e354b4fcad2',
							workingPositionFlagName: 'W73S32-harvester-1'
						}
					},
					room: room.name
				}
			});
		} else if (!Game.creeps['h2']) {
			creepCreator.createCreep({
				spawn: Game.spawns['W73S32-1'],
				body: {[WORK]: 5, [CARRY]: 1, [MOVE]: 2},
				name: 'h2',
				memory: {
					role: {
						name: 'static-harvester',
						data: {
							sourceId: '5836b6de8b8b9619519ef7cc',
							containerId: '5854d1e2e745b9e36a10abe4',
							workingPositionFlagName: 'W73S32-harvester-2'
						}
					},
					room: room.name
				}
			});
		} else if (!Game.creeps['u1']) {
			global.creepCreator.createCreep({
				spawn: Game.spawns['W73S32-1'],
				body: {[WORK]: 15, [CARRY]: 1, [MOVE]: 5},
				name: 'u1',
				memory: {
					role: {
						name: 'static-upgrader',
						data: {
							fromId: '585421191717308736b8fa8c',
							workingPositionFlagName: 'W73S32-upgrader-1'
						}
					},
					room: room.name
				}
			});
		} else if (!Game.creeps['b1']) {
			global.creepCreator.createCreep({
				spawn: Game.spawns['W73S32-1'],
				body: {[WORK]: 6, [CARRY]: 6, [MOVE]: 12},
				name: 'b1',
				memory: {
					role: 'builder',
					room: room.name
				}
			});
		}
	}
}
