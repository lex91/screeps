import {log} from '../../support/log';


export function run(creep: Creep) {
	const data = getDataFromCreepMemory(creep);

	/*
	 Transporting:
	 */
	if (creep.carry[RESOURCE_ENERGY] === 0) {
		if (creep.ticksToLive < 50) {
			log.info(`Builder only: creep ${creep.name} is dying!`);
			return;
		}
		const from = Game.getObjectById<Container|Storage>(data.fromId);
		if (!from) {
			logFail(creep, `Can't find "from" object by id`);
			return;
		}

		const withdrawAmount = Math.min(creep.carryCapacity, Number(from.store[RESOURCE_ENERGY]) - data.fromMinAmount);
		if (withdrawAmount <= 0) {
			return;
		}

		const withdrawResult = creep.withdraw(from, RESOURCE_ENERGY, withdrawAmount);
		switch (withdrawResult) {
			case OK:
				return;
			case ERR_NOT_IN_RANGE:
				creep.moveTo(from);

				return;
			default:
				logFail(creep, `Can't withdraw - ${withdrawResult}`);
				return;
		}
	} else {

		const target: ConstructionSite = creep.pos.findClosestByPath<ConstructionSite>(FIND_MY_CONSTRUCTION_SITES);
		if (!target) {
			logFail(creep, `Can't build - no target!`);

			return;
		}

		const buildResult = creep.build(target);
		switch (buildResult) {
			case OK:
				return;
			case ERR_NOT_IN_RANGE:
				creep.moveTo(target);

				return;
			default:
				logFail(creep, `Can't build - ${buildResult}`);
				return;
		}
	}
}


function getDataFromCreepMemory(creep: Creep): BuilderOnlyMemory {
	return <BuilderOnlyMemory> (creep.memory.role.data);
}


function logFail(creep: Creep, failMessage: string): void {
	log.error(
		`Builder only ${creep.name} failed: ${failMessage}.
		Params: ${JSON.stringify(getDataFromCreepMemory(creep))}`
	);
}


export interface BuilderOnlyMemory {
	fromId: string;
	fromMinAmount: number;
}
