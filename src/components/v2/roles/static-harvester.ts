import {Role, RoleParams, RoleDeps} from "./run-role";
import {log} from "../../support/log";
import {runTask, TaskStatus} from "../tasks/run-task";
import {moveTo} from "../tasks/move-to";

const run = <Role> function (params: RoleParams, deps: RoleDeps) {
	const {sourceId, containerId, workingPositionFlagId} = <StaticHarvesterData> (params.roleData);
	const currentTask = params.currentTask;
	const creep = deps.creep;

	if (currentTask) {
		currentTask.taskStatus = runTask(currentTask.taskName, currentTask.taskData, deps);

		switch (currentTask.taskStatus) {
			case TaskStatus.DONE:
				break;
			case TaskStatus.ERROR:
				log.error(`Task exited with status ERROR: ${currentTask.taskName}`);
				return;
			case TaskStatus.PROCESSING:
				// Some action is ordered
				return;
			default:
				log.error(`Unknown task status: ${currentTask.taskStatus}`);
		}
	}

	// TODO:

	const taskName = moveTo.taskName;
	const taskData = {
		targetId: workingPositionFlagId
	};
	const taskStatus = runTask(taskName, taskData, deps);
	params.currentTask = {taskName, taskData, taskStatus};

	// runTask({
	// 	creep: creep,
	// 	taskName: moveTo.taskName,
	// 	data: {
	// 		targetId: workingPositionFlagId
	// 	}
	// });
	if (!creep.pos.isNearTo(workingPositionFlag)) {
		creep.moveTo(workingPositionFlag);

		return;
	}

	const source = Game.getObjectById<Source|Mineral>(sourceId);
	if (!source) {
		log.error(`StaticHarvester can't find object by Id ${sourceId}`);
		return;
	}

	const container = Game.getObjectById<Container>(containerId);
	if (!container) {
		log.error(`StaticHarvester can't find object by Id ${containerId}`);
		return;
	}

	creep.harvest(source);
	creep.transfer(container, RESOURCE_ENERGY, creep.carry.energy);
};

run.roleName = 'static-harvester';


export {run};

export interface StaticHarvesterData extends RoleParams {
	sourceId: string;
	containerId: string;
	workingPositionFlagId: string;
}
