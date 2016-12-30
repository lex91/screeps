import {ITask, TaskStatus, TaskRunResult} from './i-task';
import {Task} from './task';


export abstract class TaskSequence extends Task {
	protected _tasks: Map<string, TaskSequenceItem>;
	protected _runStack: Array<string>;

	public run(data?: any): TaskRunResult {
		const currentTaskName = this._runStack.pop();
		if (!currentTaskName) {
			return {taskStatus: TaskStatus.DONE};
		}

		const taskSequenceItem = this._tasks.get(currentTaskName);
		if (!taskSequenceItem) {
			return {
				taskStatus: TaskStatus.ERROR,
				data: {
					message: `Task ${this.getName()} can't find subtask with name ${currentTaskName}!`
				}
			};
		}

		let subtaskData: any;
		if (taskSequenceItem.data !== undefined) {
			subtaskData.data = taskSequenceItem.data;
		} else if (typeof taskSequenceItem.dataResolver === 'function') {
			subtaskData.data = taskSequenceItem.dataResolver(data);
		}

		return taskSequenceItem.task.run(subtaskData);
	}
}

export type TaskSequenceItem = {
	task: ITask,
	data?: any,
	dataResolver?(...params: Array<any>): any
};
