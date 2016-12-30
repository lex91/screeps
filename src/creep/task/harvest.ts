import {Task} from './base/task';
import {TaskRunResult, TaskRunParams, TaskStatus} from './base/i-task';
import {CreepManager} from '../creep-manager';
import {gameCache} from '../../services/game-cache';


export class Harvest extends Task {

	constructor(params: {creep: CreepManager}) {
		super({
			name: 'Harvest',
			creep: params.creep,
		});
	};

	public run(params: TaskRunParams): TaskRunResult {
		// TODO: check if creep can harvest

		const {sourceId} = <HarvestMemory> (params.creepMemory);
		const source: Source|null = sourceId ? gameCache.getObjectById<Source>(sourceId) : this._getClosestSource();

		if (!source) {
			return {
				taskStatus: TaskStatus.CANT_RUN,
				data: {
					message: `Creep ${this._creep.getName()} can't harvest - no source found.
					Creep memory: ${JSON.stringify(params.creepMemory)}`
				}
			};
		}

		// TODO: harvest

		return {
			taskStatus: TaskStatus.IN_PROGRESS
		};
	};

	protected _getClosestSource(): Source|null {
		return null;
	}
}

type HarvestMemory = {
	sourceId?: string
	// TODO: add carry cap
}
