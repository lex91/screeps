export type TaskRunResult = {
	taskStatus: TaskStatus,
	data?: any
};

export enum TaskStatus {
	DONE,
	IN_PROGRESS,
	ORDER_CONFLICT,
	NO_NEED_TO_RUN,
	CANT_RUN,
	ERROR
}

export interface ITask {
	getName(): string;
	run(params: any): TaskRunResult;
}
