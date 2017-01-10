import {Task} from './base/task';
import {TaskRunResult, TaskStatus} from './base/i-task';
import {CreepManager} from '../creep-manager/creep-manager';
import {gameCache} from '../../services/game-cache';


type HarvestParams = {
	sourceId: string;
	resource: string; // One of RESOURCE_* constants
	carryCap?: number;
};

export class Harvest extends Task {
	constructor(params: {creep: CreepManager}) {
		super({
			name: 'Harvest',
			creep: params.creep
		});
	};

	public run(params: HarvestParams): TaskRunResult {
		const result = {taskName: this.getName()};

		if (this._isFullEnough(params.resource, params.carryCap)) {
			return Object.assign(result, {taskStatus: TaskStatus.NO_NEED_TO_RUN});
		}

		if (this._creep.isOrderConflicting({creepOrder: 'harvest'})) {
			return Object.assign(result, {taskStatus: TaskStatus.ORDER_CONFLICT});
		}

		if (!params.sourceId) {
			return Object.assign(result, {
				taskStatus: TaskStatus.ERROR,
				message: `No sourceId in params`
			});
		}

		const source = gameCache.getObjectById<Source>(params.sourceId);
		if (!source) {
			return Object.assign(result, {
				taskStatus: TaskStatus.ERROR,
				message: `Can't harvest - no source found by id ${params.sourceId}`
			});
		}

		const runResult = this._creep.harvest(source, params.resource);

		if (runResult instanceof Error) {
			return Object.assign(result, {
				taskStatus: TaskStatus.ERROR,
				message: runResult.message
			});
		}

		Object.assign(result, {
			creepOrders: {[runResult.creepOrder]: runResult.result}
		});

		switch (runResult.result) {
			case OK:
				return Object.assign(result, {
					taskStatus: this._isFullEnough(params.resource, params.carryCap) ?
						TaskStatus.DONE :
						TaskStatus.IN_PROGRESS
				});
			case ERR_TIRED:
			case ERR_NOT_ENOUGH_RESOURCES:
				return Object.assign(result, {taskStatus: TaskStatus.IN_PROGRESS});
			case ERR_NOT_IN_RANGE:
			case ERR_NOT_OWNER:
			case ERR_BUSY:
			case ERR_NOT_FOUND:
			case ERR_INVALID_TARGET:
			case ERR_NO_BODYPART:
			case ERR_RCL_NOT_ENOUGH:
				return Object.assign(result, {taskStatus: TaskStatus.CANT_RUN});
			default:
				return Object.assign(result, {
					taskStatus: TaskStatus.ERROR,
					message: 'Unexpected CreepOrderResult'
				});
		}
	}

	protected _isFullEnough(resource: string, carryCap?: number): boolean {
		if (carryCap) {
			return this._creep.getResourceForecast(resource) >= carryCap;
		}

		return this._creep.getFreeCarryForecast() <= 0;
	}
}
