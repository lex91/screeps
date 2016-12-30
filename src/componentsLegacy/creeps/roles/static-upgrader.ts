import {log} from '../../support/log';


export function run(creep: Creep) {
	const data = getDataFromCreepMemory(creep);

	const workingPositionFlag = Game.flags[data.workingPositionFlagName];
	if (!workingPositionFlag) {
		logFail(creep, `Can't find flag by id`);
		return;
	}


	if (!creep.pos.isEqualTo(workingPositionFlag)) {
		creep.moveTo(workingPositionFlag);
		return;
	}

	const from = Game.getObjectById<Container|Storage>(data.fromId);
	if (!from) {
		logFail(creep, `Can't find "from" object by id`);
		return;
	}

	const withdrawAmount = Math.min(creep.getActiveBodyparts(WORK), Number(from.store[RESOURCE_ENERGY]));
	if (withdrawAmount <= 0) {
		// No resources
		return;
	}
	const withdrawResult = creep.withdraw(from, RESOURCE_ENERGY, withdrawAmount);
	if (withdrawResult !== OK) {
		logFail(creep, `Can't withdraw - ${withdrawResult}`);
		return;
	}

	if (creep.carry[RESOURCE_ENERGY] >= creep.getActiveBodyparts(WORK)) {
		const controller = <Controller> (creep.room.controller);
		if (!controller) {
			logFail(creep, `Can't find room controller`);
			return;
		}

		const upgradeResult = creep.upgradeController(controller);
		if (upgradeResult !== OK) {
			logFail(creep, `Can't upgrade controller - ${upgradeResult}`);
			return;
		}
	}
}


function getDataFromCreepMemory(creep: Creep): StaticUpgraderMemory {
	return <StaticUpgraderMemory> (creep.memory.role.data);
}


function logFail(creep: Creep, failMessage: string): void {
	log.error(
		`Static upgrader ${creep.name} failed: ${failMessage}.
		Params: ${JSON.stringify(getDataFromCreepMemory(creep))}`
	);
}


export interface StaticUpgraderMemory {
	fromId: string;
	workingPositionFlagName: string;
}
