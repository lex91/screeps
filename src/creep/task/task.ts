import {ITask} from './i-task';


export abstract class Task implements ITask{
	protected _name: string;
	protected _runDataResolver: () => any;

	constructor(params: Params) {
		this._name = params.name;
		this._runDataResolver
	};

	getName(): string {
		return this._name;
	};

	run(creepparams: TaskIn);
}

type Params = {
	name: string,
	runDataResolver(...args: Array<any>): any,
};
