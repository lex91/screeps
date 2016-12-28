import {ITask, TaskStatus} from './i-task';
import {CreepManager} from '../creep-manager';


export abstract class Task implements ITask{
	protected _name: string;
	protected _resultHandlers?: Map<TaskStatus, (params: any) => any>;
	protected _defaultResultHandler?: (params: any) => any;

	constructor(params: ConstructorParams) {
		this._name = params.name;
		this._resultHandlers = params.resultHandlers;
		this._defaultResultHandler = params.defaultResultHandler;
	};

	public getName(): string {
		return this._name;
	};

	/**
	 * method should call proper result handler
	 */
	abstract run(creep: CreepManager, state?: any): void;

	protected _resolveResultHandler(taskResult: TaskStatus): number|(any)=>any {
		let handler = this._resultHandlers.get(taskResult);

		return
	}
}
type x = number | string | ()=>any;
type ConstructorParams = {
	name: string,
	resultHandlers?: Map<TaskStatus, (params: any) => any>,
	defaultResultHandler?: (params: any) => any,
};
