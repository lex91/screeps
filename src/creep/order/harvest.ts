import {CreepOrder} from './creep-order';
import {CreepOrderName} from './i-creep-order';
import {CreepManager} from '../creep-manager';


const ORDER_NAME: CreepOrderName = 'harvest';

export class Harvest extends CreepOrder {
	protected _target: Source|Mineral;
	protected _resourceName: string;

	constructor(deps: {creepManager: CreepManager}, params: {target: Source|Mineral}) {
		super(deps);

		this._target = params.target;
		this._resourceName = this._getResourceName();
	}

	public getName(): CreepOrderName {
		return ORDER_NAME;
	}

	public getIncomeForecast(): StoreDefinition {
		return {
			[this._resourceName]: this._getHarvestedForecast()
		};
	}

	protected _doCreepOrder(creep: Creep): number {
		return creep.harvest(this._target);
	}

	protected _getResourceName(): string {
		return this._target instanceof Source ? RESOURCE_ENERGY : this._target.mineralType;
	}

	protected _getHarvestedForecast(): number {
		const harvestPower = this._resourceName === RESOURCE_ENERGY ? HARVEST_POWER : HARVEST_MINERAL_POWER;

		return Math.min(
			harvestPower * this._creepManager.getActiveBodyparts(WORK),
			this._getSourceAvailableResources()
		);
	}

	protected _getSourceAvailableResources(): number {
		return this._target instanceof Source ? this._target.energy : this._target.mineralAmount;
	}
}
