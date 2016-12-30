import {ITask, TaskRunResult, TaskStatus} from './task/base/i-task';


export class CreepManager {
	public creep: Creep;

	constructor(creep: Creep) {
		this.creep = creep;
	}

	public run(data?: any): void {
		const task = this._createTaskObject();

		let taskResult;
		do {
			taskResult = task.run(data);
		} while (this._canRunAgain(taskResult));
	}

	protected _createTaskObject(): ITask {
		return <ITask> ({/* TODO */});
	}

	protected _canRunAgain(taskResult: TaskRunResult): boolean {
		return taskResult.taskStatus !== TaskStatus.CREEP_BUSY;
	}
}
