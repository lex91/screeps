// import {log} from '../../support/log';
//
//
// export function run(creep: Creep) {
// 	const data = getDataFromCreepMemory(creep);
//
// 	const source = Game.getObjectById<Source|Mineral>(data.sourceId);
// 	if (!source) {
// 		logFail(creep, `Can't find source by id`);
// 		return;
// 	}
//
// 	const workingPositionFlag = Game.flags[data.workingPositionFlagName];
// 	if (!workingPositionFlag) {
// 		logFail(creep, `Can't find flag by id`);
// 		return;
// 	}
//
//
// 	if (!creep.pos.isEqualTo(workingPositionFlag)) {
// 		creep.moveTo(workingPositionFlag);
// 		return;
// 	}
//
// 	const harvestResult = creep.harvest(source);
// 	if (harvestResult !== OK) {
// 		logFail(creep, `Can't harvest from source - ${harvestResult}`);
// 		return;
// 	}
//
// 	if (creep.carry[RESOURCE_ENERGY] > 0) {
// 		const container = Game.getObjectById<Container>(data.containerId);
// 		if (!container) {
// 			logFail(creep, `Can't find container by id`);
// 			return;
// 		}
//
// 		const transferResult = creep.transfer(container, RESOURCE_ENERGY, creep.carry[RESOURCE_ENERGY]);
// 		if (transferResult !== OK) {
// 			logFail(creep, `Can't transfer energy to source - ${transferResult}`);
// 			return;
// 		}
// 	}
// }
//
//
// function getDataFromCreepMemory(creep: Creep): StaticHarvesterMemory {
// 	return <StaticHarvesterMemory> (creep.memory.role.data);
// }
//
//
// function logFail(creep: Creep, failMessage: string): void {
// 	log.error(
// 		`Static harvester ${creep.name} failed: ${failMessage}.
// 		Params: ${JSON.stringify(getDataFromCreepMemory(creep))}`
// 	);
// }
//
//
// export interface StaticHarvesterMemory {
// 	sourceId: string;
// 	containerId: string;
// 	workingPositionFlagName: string;
// }
