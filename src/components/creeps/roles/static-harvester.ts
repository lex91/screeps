import {log} from "../../support/log";


const run = function (creep: Creep) {
	const data = <StaticHarvesterMemory> (creep.memory.role.data);

	const source = Game.getObjectById<Source|Mineral>(data.sourceId);
	if (!source) { // TODO: log
		throw new Error(`StaticHarvester#run: can't find source by Id ${data.sourceId}`);
	}

	const container = Game.getObjectById<Container>(data.containerId);
	if (!container) { // TODO: log
		throw new Error(`StaticHarvester#run: can't find container by Id ${data.containerId}`);
	}

	const harvestResult = creep.harvest(source);
	switch (harvestResult) {
		case OK:
			if (creep.carry.energy > 0) {
				const transferResult = creep.transfer(container, RESOURCE_ENERGY, creep.carry.energy);
				if (transferResult !== OK) {
					log.error('error transfer'); // TODO: make verbose log
				}
			}

			break;
		case ERR_NOT_IN_RANGE:
			const workingPositionFlag = Game.getObjectById<Flag>(data.workingPositionFlagId);
			if (!workingPositionFlag) { // TODO: log
				throw new Error(`StaticHarvester#run: can't find flag by Id ${data.workingPositionFlagId}`);
			}

			this._creep.moveTo(workingPositionFlag);
			break;
		default:
			log.error(
				`Static harvester ${creep.name}
				 can't harvest from source ${data.sourceId}.
				 Error code: ${harvestResult}`
			);
	}
};


export interface StaticHarvesterMemory {
	sourceId: string;
	containerId: string;
	workingPositionFlagId: string;
}
