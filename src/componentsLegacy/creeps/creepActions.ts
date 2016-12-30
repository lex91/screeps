import * as Config from '../../config';


export function needsRenew(creep: Creep): boolean {
	return (creep.ticksToLive < Config.DEFAULT_MIN_LIFE_BEFORE_NEEDS_REFILL);
}


export function tryRenew(creep: Creep, spawn: Spawn): number {
	return spawn.renewCreep(creep);
}


export function moveToRenew(creep: Creep, spawn: Spawn): void {
	if (tryRenew(creep, spawn) === ERR_NOT_IN_RANGE) {
		creep.moveTo(spawn);
	}
}
