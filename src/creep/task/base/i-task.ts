import {CreepOrderName} from "../../creep-manager/creep-manager";


export type TaskRunResult = {
	taskStatus: TaskStatus;
	taskName: string;
	creepOrders?: {[key in CreepOrderName]?: number};
	message?: string
	childTaskResults?: Array<TaskRunResult>
	[key: string]: any
};

export enum TaskStatus {
	DONE,
	NO_NEED_TO_RUN,
	IN_PROGRESS,
	ORDER_CONFLICT,
	CANT_RUN,
	ERROR
}

export interface ITask {
	getName(): string;
	run(params: any): TaskRunResult;
}
