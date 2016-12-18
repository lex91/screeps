import * as CreepManagerLegacy from './components/creeps/creepManagerLegacy';
import {CreepController} from './components/v2/creep-manager';
import * as Config from './config/config';

import {log} from './components/support/log';

// Any code written outside the `loop()` method is executed only when the
// Screeps system reloads your script.
// Use this bootstrap wisely. You can cache some of your stuff to save CPU.
// You should extend prototypes before the game loop executes here.

// This is an example for using a config variable from `config.ts`.
if (Config.USE_PATHFINDER) {
	PathFinder.use(true);
}

log.info('load');

/**
 * Screeps system expects this 'loop' method in main.js to moveTo the
 * application. If we have this line, we can be sure that the globals are
 * bootstrapped properly and the game loop is executed.
 * http://support.screeps.com/hc/en-us/articles/204825672-New-main-loop-architecture
 *
 * @export
 */
export function loop() {
	// Check memory for null or out of bounds custom objects
	if (!Memory.uuid || Memory.uuid > 100) {
		Memory.uuid = 0;
	}

	for (let i in Game.rooms) {
		let room: Room = Game.rooms[i];

		CreepManagerLegacy.run(room);

		// Clears any non-existing creep memory.
		for (let name in Memory.creeps) {
			let creep: any = Memory.creeps[name];

			if (creep.room === room.name) {
				if (!Game.creeps[name]) {
					log.info('Clearing non-existing creep memory:', name);
					delete Memory.creeps[name];
				}
			}
		}
	}

	const creeps: {[fieldName: string]: Array<CreepController>} = {
		harvester1: null,
		harvester2:null,
		transporter1: null,
		transporter2: null,
		upgraderTransporter:null,
	};
	for (let creepName in Game.creeps) {
		const creep = Game.creeps[creepName];

		if (creep.memory.version === '2.0.0') {
			log.debug(`Running creep 2.0.0: ${creep.name}`);

			const creepManager = new CreepController(creep);

			creepManager.run();
		}
	}
}


interface CreepConfig {

}