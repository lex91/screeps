import {ITask, TaskRunResult, TaskRunParams} from './i-task';
import {CreepManager} from '../../creep-manager';


export abstract class Task implements ITask {
	protected _name: string;
	protected _creep: CreepManager;

	constructor(params: TaskConstructorParams) {
		this._name = params.name;
		this._creep = params.creep;
	};

	public getName(): string {
		return this._name;
	};

	public abstract run(params: TaskRunParams): TaskRunResult;
}

type TaskConstructorParams = {
	name: string,
	creep: CreepManager,
};
