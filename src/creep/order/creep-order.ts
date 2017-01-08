import {CreepManager, CarryDelta} from '../creep-manager';
import {ICreepOrder, CreepOrderName, CreepOrderResult} from './i-creep-order';

export abstract class CreepOrder implements ICreepOrder {
	protected _creepManager: CreepManager;
	protected _carryDelta: CarryDelta;

	protected static readonly _conflictingOrders: Array<Set<CreepOrderName>> = [
		new Set<CreepOrderName>([
			'harvest', 'attack', 'build', 'repair', 'dismantle', 'attackController', 'rangedHeal', 'heal'
		]),
		new Set<CreepOrderName>([
			'rangedAttack', 'rangedMassAttack', 'build', 'repair', 'rangedHeal'
		])
	];

	constructor (params: {creepManager: CreepManager}) {
		this._creepManager = params.creepManager;
		this._carryDelta = {};
	}

	public abstract getName(): CreepOrderName;

	public run(creep: Creep): CreepOrderResult {
		if (!this.canRun()) {
			return new Error(`can't run`);
		}

		const result = this._doCreepOrder(creep);

		if (result === OK) {
			this._carryDelta.income = this.getIncomeForecast();
			this._carryDelta.outcome = this.getOutcomeForecast();
		}

		return result;
	}

	public getCarryDelta(): CarryDelta {
		return this._carryDelta;
	}

	public canRun(): boolean {
		return !this.isConflicting() && !this.isEnoughResources();
	}

	public getOutcomeForecast(): StoreDefinition|undefined {
		return undefined;
	}

	public getIncomeForecast(): StoreDefinition|undefined {
		return undefined;
	}

	public isConflicting(): boolean {
		const scheduledOrders = this._creepManager.getScheduledOrders();
		const orderName = this.getName();

		if (scheduledOrders[orderName]) {
			return true;
		}

		for (const conflictingSet of CreepOrder._conflictingOrders) {
			if (conflictingSet.has(orderName)) {
				for (const conflictingOrder of conflictingSet) {
					if (scheduledOrders[conflictingOrder]) {
						return true;
					}
				}
			}
		}

		return false;
	}

	public isEnoughResources(): boolean {
		const outcome = this.getOutcomeForecast();

		return outcome ? this._creepManager.isResourcesAvailable(outcome) : true;
	}

	protected abstract _doCreepOrder(creep: Creep): number;
}
