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
			runCreepRole(creep);
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
				body: {[WORK]: 10, [CARRY]: 1, [MOVE]: 2},
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
		}
	}
}
