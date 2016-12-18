import {moveTo as moveTo} from './move-to';
import {log} from "../../support/log";


export function runTask(name: string, params: any, deps: TaskDeps): TaskStatus {
	switch (name) {
		case moveTo.taskName:
			return moveTo(params, deps);
		default:
			log.info(`Can't find task ${name}`);
			return TaskStatus.ERROR;
	}
}


export interface Task {
	(params: any, deps: TaskDeps): TaskStatus;
	taskName: string;
}

export enum TaskStatus {
	ERROR,
	PROCESSING,
	DONE
}

export interface TaskDeps {
	creep: Creep;
}

// export interface TaskMemory {
// 	roleName: string;
// 	taskdata: any;
// }
