export type TaskIn = {
	creep: Creep,
	data: any
};


export type TaskOut = {
	status: TaskStatus,
	data: any
};

export type TaskParams = {
	inResolver: (...args: Array<any>) => any,
	outResolver: (taskOut: TaskOut) => void
};

export enum TaskStatus {
	DONE,
	IN_PROGRESS
}


export interface Task {
	name: string;
	run(creep: TaskIn): TaskOut;
}


export abstract class TaskSequence implements Task {
	public name: string;
	protected _taskMap: Map<string, TaskParams>;
	protected _taskStack: Array<string>;

	constructor() {
		this._taskMap = new Map();
		this._taskStack = [];
	}


	public run(params: TaskIn): TaskOut {
		throw params;
	}


}
