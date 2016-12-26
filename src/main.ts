import {creepCreator} from './components/creeps/utils/creep-creator';
import * as CreepManagerLegacy from './components/creeps/creepManagerLegacy';
import * as Config from './config';

import {log} from './components/support/log';
import {RoomConfig} from './room/config';
import {RoomManager} from './room/manager';
global.creepCreator = creepCreator;

// Any code written outside the `loop()` method is executed only when the
// Screeps system reloads your script.
// Use this bootstrap wisely. You can cache some of your stuff to save CPU.
// You should extend prototypes before the game loop executes here.

// This is an example for using a config variable from `config.ts`.
if (Config.USE_PATHFINDER) {
	PathFinder.use(true);
}

log.info('load');

type Rooms = Map<string, RoomManager>;
type RoleChooserParams = {
	creepName: string,
	rooms: Rooms
};
const roomConfigs: Map<string, RoomConfig> = new Map([
	['W73S33', {
		creeps: new Map<string, any>([
			['ec', {
				role: {
					'energy-charger': {
						from: {
							id: '585fa6042ceb499610f47f8d',
							minAmount: 0
						},
						renew: {
							when: 300,
							until: 500
						}
					},
					roleChooser: (_params: RoleChooserParams): string => {
						const creep = Game.creeps[_params.creepName];
						console.log(creep);

						return 'energy-charger';
					}
				},
				body: {
					[CARRY]: 4,
					[MOVE]: 2
				},
				count: 1
			}],
			['h1', {
				role: {
					'static-harvester': {
						sourceId: '5836b6de8b8b9619519ef7d0',
						containerId: '585fa6042ceb499610f47f8d',
						workingPositionFlagName: 'W73S33-harvester-1'
					},
					roleChooser: (_params: RoleChooserParams): string => {
						return 'static-harvester';
					}
				},
				body: {
					[WORK]: 2,
					[CARRY]: 1,
					[MOVE]: 1
				},
				count: 1
			}],
			// ['t1', {
			// 	role: {
			// 		'energy-transporter': {
			// 			fromId: '585fa6042ceb499610f47f8d',
			// 			fromMinAmount: 1000,
			// 			toId: '585fcce4282455ed3896accb',
			// 			renew: {
			// 				when: 300,
			// 				until: 500
			// 			}
			// 		},
			// 		roleChooser: (params: RoleChooserParams): string => {
			// 			return 'energy-transporter';
			// 		}
			// 	},
			// 	body: {
			// 		[CARRY]: 4,
			// 		[MOVE]: 2
			// 	},
			// 	count: 1
			// }],
			['tu', {
				role: {
					'energy-transporter': {
						from: {
							id: '585fa6042ceb499610f47f8d',
							minAmount: 1000
						},
						toId: '585fcce4282455ed3896accb',
						renew: {
							when: 300,
							until: 500
						}
					},
					roleChooser: (_params: RoleChooserParams): string => {
						return 'energy-transporter';
					}
				},
				body: {
					[CARRY]: 4,
					[MOVE]: 2
				},
				count: 1
			}],
			['u', {
				role: {
					'static-upgrader': {
						from: {
							id: '585fcce4282455ed3896accb',
							minAmount: 1000
						},
						workingPositionFlagName: 'W73S33-upgrader-1'
					},
					roleChooser: (_params: RoleChooserParams): string => {
						return 'static-upgrader';
					}
				},
				body: {
					[WORK]: 2,
					[CARRY]: 1,
					[MOVE]: 1
				},
				count: 1
			}]
		])
	}]
]);


export function loop() {
	const rooms: Rooms = new Map();

	for (const [roomName, roomConfig] of roomConfigs) {
		const roomObject = Game.rooms[roomName];
		if (roomObject) {
			rooms.set(roomName, new RoomManager({
				room: roomObject,
				config: roomConfig
			}));
		} else {
			log.error(`Have config for room ${roomName}, but can't get room object`);
		}
	}

	// TODO: add data to rooms objects and run
	for (let spawnName in Game.spawns) {
		const spawn = Game.spawns[spawnName];
		const roomManager = rooms.get(spawn.room.name);

		if (roomManager) {
			roomManager.addSpawn(spawn);
		} else {
			log.debug(`There is spawn ${spawn.name} in room without config - ${spawn.room.name}`);
		}
	}

	// TODO: add data to rooms objects and run
	for (let creepName in Game.creeps) {
		const creep = Game.creeps[creepName];
		const roomManager = rooms.get(creep.memory.room);

		if (roomManager) {
			roomManager.addCreep(creep);
		} else {
			log.debug(`There is creep ${creep.name} in room without config - ${creep.memory.room}`);
		}
	}


	(<RoomManager> (rooms.get('W73S33'))).run();
	CreepManagerLegacy.run(Game.rooms['W73S32']);


	// TODO: extract method
	// Clears any non-existing creep memory.
	for (let creepName in Memory.creeps) {
		if (!Game.creeps[creepName]) {
			log.debug('Clearing non-existing creep memory:', creepName);
			delete Memory.creeps[creepName];
		}
	}
}
