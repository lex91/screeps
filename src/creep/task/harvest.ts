import {Task} from './base/task';
import {TaskRunResult, TaskStatus} from './base/i-task';
import {CreepManager} from '../creep-manager';
import {gameCache} from '../../services/game-cache';


type HarvestParams = {
	sourceId: string;
	carryCap?: {
		threshold: number;
		resource: string; // One of RESOURCE_* constants
	};
};

export class Harvest extends Task {
	constructor(params: {creep: CreepManager}) {
		super({
			name: 'Harvest',
			creep: params.creep
		});
	};

	public run(params: HarvestParams): TaskRunResult {
		const isFullEnough = (
			params.carryCap && this._creep.getResource(params.carryCap.resource) >= params.carryCap.threshold ||
			this._creep.getFreeCarry() === 0
		);
		if (isFullEnough) {
			return {taskStatus: TaskStatus.NO_NEED_TO_RUN};
		}

		if (this._creep.isOrderConflicting({creepOrder: 'harvest'})) {
			return {taskStatus: TaskStatus.ORDER_CONFLICT};
		}

		if (!params.sourceId) {
			return {
				taskStatus: TaskStatus.ERROR,
				data: {
					message: `No sourceId in creep memory`
				}
			};
		}

		const source = gameCache.getObjectById<Source>(params.sourceId);
		if (!source) {
			return {
				taskStatus: TaskStatus.ERROR,
				data: {
					message: `Can't harvest - no source found by id ${params.sourceId}`
				}
			};
		}

		const runResult = this._creep.harvest(source);

		if (runResult instanceof Error) {
			return {
				taskStatus: TaskStatus.ERROR,
				data: {
					message: runResult.message
				}
			};
		}

		// TODO: Статусы обработать. + 11 и 14, их нет в мануале.
		switch (runResult) {
			case OK:
				return {taskStatus: TaskStatus.DONE};
			default:
				return {taskStatus: TaskStatus.IN_PROGRESS};
		}
	};
}
