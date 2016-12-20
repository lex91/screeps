export function renew(creep: Creep, spawn: Spawn): boolean|Error {
	const renewResult = spawn.renewCreep(creep);

	switch (renewResult) {
		case OK:
			return true;
		case ERR_NOT_IN_RANGE:
			creep.moveTo(spawn);

			return false;
		default:
			return new Error(`Error ${renewResult}`);
	}
}


export interface RenewMemory {
	renewWhen: number;
	renewUntil: number;
	shouldRenew?: boolean|null;
}
