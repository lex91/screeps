import {RunResult} from '../run-result';


export abstract class Role {
	public name: string;
	protected _taskMap: Map<string, (...args: Array<any>) => any>;
	protected _taskStack: Array<string>;

	constructor() {
		this._taskMap = new Map();
		this._taskStack = [];
	}


	public run(params: Params): RunResult {
		throw params;
	}


}

type Params = {
	creep: Creep,
	roleData: any
}
