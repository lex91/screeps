import {log} from '../../support/log';


export function run(creep: Creep) {
	const data = getDataFromCreepMemory(creep);

	const source = Game.getObjectById<Source|Mineral>(data.sourceId);
	if (!source) {
		logFail(creep, `Can't find source by id`);
		return;
	}

	const harvestResult = creep.harvest(source);
	switch (harvestResult) {
		case OK:
			if (creep.carry.energy > 0) {
				const container = Game.getObjectById<Container>(data.containerId);
				if (!container) {
					logFail(creep, `Can't find container by id`);
					return;
				}

				const transferResult = creep.transfer(container, RESOURCE_ENERGY, creep.carry.energy);
				if (transferResult !== OK) {
					logFail(creep, `Can't transfer energy to source - ${transferResult}`);
					return;
				}
			}

			break;
		case ERR_NOT_IN_RANGE:
			const workingPositionFlag = Game.getObjectById<Flag>(data.workingPositionFlagId);
			if (!workingPositionFlag) {
				logFail(creep, `Can't find flag by id`);
				return;
			}

			this._creep.moveTo(workingPositionFlag);
			break;
		default:
			logFail(creep, `Can't harvest from source - ${harvestResult}`);
			return;
	}
}


function getDataFromCreepMemory(creep: Creep): StaticHarvesterMemory {
	return <StaticHarvesterMemory> (creep.memory.role.data);
}


function logFail(creep: Creep, failMessage: string): void {
	log.error(
		`Static harvester ${creep.name} failed: ${failMessage}.
		Params: ${JSON.stringify(getDataFromCreepMemory(creep))}`
	);
}


export interface StaticHarvesterMemory {
	sourceId: string;
	containerId: string;
	workingPositionFlagId: string;
}
