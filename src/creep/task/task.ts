export abstract class Task {

	constructor() {
		// TODO:
	}


	public abstract run(runParams: RunParams): TaskResult;
}

type RunParams = {
	creep: Creep,
	TaskData: any
}

export enum TaskResult {
	DONE,
	IN_PROGRESS
}