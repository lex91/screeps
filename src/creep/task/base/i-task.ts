import {RoomManager} from '../../../room/room-manager';


export type TaskRunParams = {
	roomManager: RoomManager,
	creepMemory?: any
};

export type TaskRunResult = {
	taskStatus: TaskStatus,
	data?: any
};

export enum TaskStatus {
	DONE,
	IN_PROGRESS,
	CREEP_BUSY,
	CANT_RUN,
	ERROR
}


export interface ITask {
	getName(): string;
	run(params: TaskRunParams): TaskRunResult;
}
