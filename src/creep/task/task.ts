import {ITask, TaskRunResult} from './i-task';
import {CreepManager} from '../creep-manager';


export abstract class Task implements ITask {
	protected _name: string;

	constructor(name: string) {
		this._name = name;
	};

	public getName(): string {
		return this._name;
	};

	public abstract run(creep: CreepManager, state?: any): TaskRunResult;
}
