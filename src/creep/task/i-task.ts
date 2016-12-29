import {CreepManager} from '../creep-manager';


export type TaskIn = {
	creep: CreepManager,
	data?: any
};

export type TaskRunResult = {
	taskStatus: TaskStatus,
	data?: any
};

export enum TaskStatus {
	DONE,
	IN_PROGRESS,
	CREEP_BUSY,
	ERROR
}


export interface ITask {
	getName(): string;
	run(creep: CreepManager, state?: any): TaskRunResult;
}
