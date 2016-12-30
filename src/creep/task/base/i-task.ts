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
	run(data?: any): TaskRunResult;
}
