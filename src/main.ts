import * as CreepManagerLegacy from './components/creeps/creepManagerLegacy';
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
	}

	// TODO: extract method
	// Clears any non-existing creep memory.
	for (let creepName in Memory.creeps) {
		if (!Game.creeps[creepName]) {
			log.debug('Clearing non-existing creep memory:', name);
			delete Memory.creeps[creepName];
		}
	}
}
