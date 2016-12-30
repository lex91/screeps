import {ITask} from '../creep/task/base/i-task';


class TaskHub {
	protected _taskMap: Map<string, ITask>;

	constructor(params: Params) {
		this._taskMap = new Map();

		for (const task of params.tasks) {
			this._taskMap.set(task.getName(), task);
		}
	}

	public getTask(taskName: string): ITask|null {
		return this._taskMap.get(taskName) || null;
	}
}

type Params = {
	tasks: Array<ITask>
};

const taskHub = new TaskHub({
	tasks: [
		// List of all tasks, used in app:
	]
});


export {taskHub};
