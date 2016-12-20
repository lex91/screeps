import * as Config from '../../config/config';

import * as harvester from './roles/harvester';
import * as upgrader from './roles/upgrader';
import * as builder from './roles/builder';
import * as staticHarvester from './roles/static-harvester';
import * as energyTransporter from './roles/energy-transporter';
import * as energyCharger from './roles/energy-charger';
import * as staticUpgrader from './roles/static-upgrader';

import * as commonTower from './commonTower';

import {log} from '../support/log';
import {creepCreator} from './utils/creep-creator';

export let creeps: Creep[];
export let creepCount: number = 0;

export let towers: Tower[];

export let harvesters: Creep[] = [];
export let upgraders: Creep[] = [];
export let builders: Creep[] = [];
export let staticHarvesters: Creep[] = [];
export let transporters: Creep[] = [];

/**
 * Initialization scripts for CreepManagerLegacy module.
 *
 * @export
 * @param {Room} room
 */
export function run(room: Room): void {
	_loadCreeps(room);
	_buildMissingCreeps(room);
	_loadTowers(room);

	_.each(creeps, (creep: Creep) => {
		if (creep.memory.role === 'harvester') {
			harvester.run(creep);
		} else if (creep.memory.role === 'upgrader') {
			upgrader.run(creep);
		} else if (creep.memory.role === 'builder') {
			builder.run(creep);
		} else if (typeof creep.memory.role === 'object' && creep.memory.role.name === 'static-harvester') {
			staticHarvester.run(creep);
		} else if (typeof creep.memory.role === 'object' && creep.memory.role.name === 'energy-transporter') {
			energyTransporter.run(creep);
		} else if (typeof creep.memory.role === 'object' && creep.memory.role.name === 'energy-charger') {
			energyCharger.run(creep);
		} else if (typeof creep.memory.role === 'object' && creep.memory.role.name === 'static-upgrader') {
			staticUpgrader.run(creep);
		}
	});

	_.each(towers, (tower: Tower) => {
		commonTower.run(tower);
	});
}

/**
 * Loads and counts all available creeps.
 *
 * @param {Room} room
 */
function _loadCreeps(room: Room) {
	creeps = room.find<Creep>(FIND_MY_CREEPS, {
		filter: (/*creep: Creep*/) => true
	});
	creepCount = _.size(creeps);

	// Iterate through each creep and push them into the role array.
	harvesters = _.filter(creeps, (creep) => creep.memory.role === 'harvester');
	upgraders = _.filter(creeps, (creep) => creep.memory.role === 'upgrader');
	builders = _.filter(creeps, (creep) => creep.memory.role === 'builder');
	staticHarvesters = _.filter(creeps, (creep) => (
		typeof creep.memory.role === 'object' && creep.memory.role.name === 'static-harvester'
	));
	transporters = _.filter(creeps, (creep) => (
		typeof creep.memory.role === 'object' && creep.memory.role.name === 'energy-transporter'
	));

	if (Config.ENABLE_DEBUG_MODE) {
		log.info(creepCount + ' creeps found in the playground.');
		log.info(
			'Harvesters: ' + harvesters.length +
			', Upgraders: ' + upgraders.length +
			', Builders: ' + builders.length
		);
	}
}

function _loadTowers(room: Room) {
	towers = room.find<Tower>(FIND_MY_STRUCTURES, {
		filter: (structure: Structure) => structure.structureType === STRUCTURE_TOWER
	});

	if (Config.ENABLE_DEBUG_MODE) {
		log.info(towers.length + ' towers found in the playground.');
	}
}

/**
 * Creates a new creep if we still have enough space.
 *
 * @param {Room} room
 */
function _buildMissingCreeps(room: Room) {
	let bodyParts: string[];

	let spawns: Spawn[] = room.find<Spawn>(FIND_MY_SPAWNS, {
		filter: (spawn: Spawn) => {
			return spawn.spawning === null;
		}
	});

	if (Config.ENABLE_DEBUG_MODE) {
		if (spawns[0]) {
			log.info('Spawn: ' + spawns[0].name);
		}
	}

	if (harvesters.length < 0) {
		bodyParts = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];

		_.each(spawns, (spawn: Spawn) => {
			_spawnCreep(spawn, bodyParts, 'harvester');
		});
	} else if (upgraders.length < 0) {
		bodyParts = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
		_.each(spawns, (spawn: Spawn) => {
			_spawnCreep(spawn, bodyParts, 'upgrader');
		});
	} else if (builders.length < 0) {
		bodyParts = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
		_.each(spawns, (spawn: Spawn) => {
			_spawnCreep(spawn, bodyParts, 'builder');
		});
	}


	if (!Game.creeps['h1']) {
		creepCreator.createCreep({
			spawn: Game.spawns['W73S32-1'],
			body: {[WORK]: 5, [CARRY]: 1, [MOVE]: 3},
			name: 'h1',
			memory: {
				role: {
					name: 'static-harvester',
					data: {
						sourceId: '5836b6de8b8b9619519ef7ca',
						containerId: '585409e14a9a1e354b4fcad2',
						workingPositionFlagName: 'W73S32-harvester-1'
					}
				}
			}
		});
	} else if (!Game.creeps['h2']) {
		creepCreator.createCreep({
			spawn: Game.spawns['W73S32-1'],
			body: {[WORK]: 5, [CARRY]: 1, [MOVE]: 3},
			name: 'h2',
			memory: {
				role: {
					name: 'static-harvester',
					data: {
						sourceId: '5836b6de8b8b9619519ef7cc',
						containerId: '5854d1e2e745b9e36a10abe4',
						workingPositionFlagName: 'W73S32-harvester-2'
					}
				}
			}
		});
	} else if (!Game.creeps['u1']) {
		global.creepCreator.createCreep({
			spawn: Game.spawns['W73S32-1'],
			body: {[WORK]: 8, [CARRY]: 1, [MOVE]: 4},
			name: 'u1',
			memory: {
				role: {
					name: 'static-upgrader',
					data: {
						fromId: '585421191717308736b8fa8c',
						workingPositionFlagName: 'W73S32-upgrader-1'
					}
				}
			}
		});
	}
}

/**
 * Spawns a new creep.
 *
 * @param {Spawn} spawn
 * @param {string[]} bodyParts
 * @param {string} role
 * @returns
 */
function _spawnCreep(spawn: Spawn, bodyParts: string[], role: string) {
	let uuid: number = Memory.uuid;
	let status: number | string = spawn.canCreateCreep(bodyParts, undefined);

	let properties: {[key: string]: any} = {
		role,
		room: spawn.room.name
	};

	status = _.isString(status) ? OK : status;
	if (status === OK) {
		Memory.uuid = uuid + 1;
		let creepName: string = spawn.room.name + ' - ' + role + uuid;

		log.info('Started creating new creep: ' + creepName);
		if (Config.ENABLE_DEBUG_MODE) {
			log.info('Body: ' + bodyParts);
		}

		status = spawn.createCreep(bodyParts, undefined /*creepName*/, properties);

		return _.isString(status) ? OK : status;
	} else {
		if (Config.ENABLE_DEBUG_MODE) {
			log.info('Failed creating new creep: ' + status);
		}

		return status;
	}
}
