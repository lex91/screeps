import {TaskOut, TaskIn, ITask, TaskStatus} from './i-task';
import {taskHub} from '../../services/task-hub';
import {Task, TaskConstructorParams, TaskRunResult} from './task';
import {CreepManager} from '../creep-manager';


export abstract class TaskSequence extends Task {
	// protected _taskMap: Map<string, TaskResolver>;
	protected _taskStack: Array<string>;

	constructor(params: TaskConstructorParams) {
		super(params);
	}

	public run(creep: CreepManager, state?: any): TaskRunResult {
		const currentTaskName = this._taskStack.pop();
		if (!currentTaskName) {
			return {taskStatus: TaskStatus.DONE};
		}

		const task = taskHub.getTask(currentTaskName);
		if (!task) {
			return {
				taskStatus: TaskStatus.ERROR,
				data: {
					message: `Can't find task or params for name ${currentTaskName}!`
				}
			}
		}

		return task.run(creep, state);
	}


}

export type TaskConstructorParams = {
	name: string,
	resultHandlers?: Map<TaskStatus, (params: any) => any>,
	defaultResultHandler?: (params: any) => any,
};