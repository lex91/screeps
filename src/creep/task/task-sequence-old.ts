import {TaskOut, TaskIn, ITask, TaskStatus} from './i-task';
import {taskHub} from '../../services/task-hub';
import {Task} from './task';


export type TaskResolver = {
	resolveIn(...args: Array<any>): any,
	resolveOut(taskOut: TaskOut): void
};

export abstract class TaskSequence extends Task {
	protected _name: string;
	protected _taskMap: Map<string, TaskResolver>;
	protected _taskStack: Array<string>;

	constructor() {
		this._taskMap = new Map();
		this._taskStack = [];
	}

	public getName():string {
		return this._name;
	}

	public run(params: TaskIn): TaskOut {
		const currentTaskName = this._taskStack.pop();

		if (!currentTaskName) {
			return {status: TaskStatus.DONE};
		}

		const task = taskHub.getTask(currentTaskName);
		const taskResolver = this._taskMap.get(currentTaskName);
		if (!task || !taskResolver) {
			return {
				status: TaskStatus.ERROR,
				data: {
					message: `Can't find task or params for name ${currentTaskName}!`
				}
			}
		}

		// TODO: хрень какая-то
		// task.run(taskResolver.resolveIn())
	}


}
