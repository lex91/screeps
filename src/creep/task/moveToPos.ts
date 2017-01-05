import {Task} from './base/task';
import {TaskRunResult, TaskStatus} from './base/i-task';
import {CreepManager} from '../creep-manager';
import {gameCache} from '../../services/game-cache';

// TODO: all!
type MoveToPosParams = {
	pos: RoomPosition;
	range?: number; //Range to pos for 'Done' state
};

export class MoveToPos extends Task {
	constructor(params: {creep: CreepManager}) {
		super({
			name: 'MoveToPos',
			creep: params.creep
		});
	};

	public run(params: MoveToPosParams): TaskRunResult {
		const result = {taskName: this.getName()};

		params.pos.isEqualTo()
		const isCloseEnough = (
			params.carryCap && this._creep.getResource(params.carryCap.resource) >= params.carryCap.threshold ||
			this._creep.getFreeCarryForecast() === 0
		);
		if (isCloseEnough) {
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

		const runResult = this._creep.harvest(source);

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
	};
}
