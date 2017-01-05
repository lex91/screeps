import {ITask, TaskRunResult, TaskStatus} from './task/base/i-task';
import {RoomManager} from '../room/room-manager';
import {log} from '../componentsLegacy/support/log';


export type CreepManagerConctructorParams = {
	creep: Creep;
	roomManager: RoomManager;
};

export type CreepOrder = 'attack'|'attackController'|'build'|'claimController'|'dismantle'|'drop'|'harvest'|'heal'|
	'move'|'moveByPath'|'pickup'|'rangedAttack'|'rangedHeal'|'rangedMassAttack'|'repair'|'reserveController'|
	'signController'|'transfer'|'upgradeController'|'withdraw';

type CarryDelta = {
	income?: StoreDefinition;
	outcome?: StoreDefinition;
};

type CreepOrderParams = {
	creepOrder: CreepOrder;
	carryDelta?: CarryDelta;
};

type CreepOrderResult = {
	creepOrder: CreepOrder;
	result: number;
}|Error;

const MAX_ORDERS_PER_TURN = 16;

export class CreepManager {
	protected _roomManager: RoomManager;

	protected _creep: Creep;
	protected _carryDelta: CarryDelta;
	protected _scheduledOrders: {[key in CreepOrder]?: CreepOrderParams};
	protected static readonly _conflictingOrders = [
		new Set<CreepOrder>([
			'harvest', 'attack', 'build', 'repair', 'dismantle', 'attackController', 'rangedHeal', 'heal'
		]),
		new Set<CreepOrder>([
			'rangedAttack', 'rangedMassAttack', 'build', 'repair', 'rangedHeal'
		])
	];

	constructor(params: CreepManagerConctructorParams) {
		this._creep = params.creep;
		this._carryDelta = {
			income: {},
			outcome: {},
		};
		this._roomManager = params.roomManager;
		this._scheduledOrders = {};
	}

	// TODO: move to role base class
	public run(): void {
		const task = this._createTaskObject();
		if (!task) {
			log.error(`Can't run creep ${this._creep.name} - no task found`);
			return;
		}

		let taskResult;
		let iterationsLeft = MAX_ORDERS_PER_TURN;
		do {
			if (--iterationsLeft > 0) {
				log.error(`Creep ${this._creep.name} is running too long, stopping`);
				return;
			}

			taskResult = task.run({
				roomManager: this._roomManager,
				creepMemory: this._creep.memory['task']['data']
			});
		} while (this._canRunAgain(taskResult));
	}

	public harvest(target: Source | Mineral, resource: string): CreepOrderResult {
		const isResourceCorrect = resource === (
				target instanceof Source ? RESOURCE_ENERGY : target.mineralType
			);
		if (!isResourceCorrect) {
			return new Error('resource-wrong');
		}

		const creepOrder: CreepOrder = 'harvest';
		const orderParams: CreepOrderParams = {
			creepOrder,
			carryDelta: {
				income: {
					[resource]: Math.max(
						CreepManager._getSourceAvailableResources(target),
						this._creep.getActiveBodyparts(WORK) * (
							target instanceof Source ? HARVEST_POWER : HARVEST_MINERAL_POWER
						)
					)
				}
			}
		};

		if (this.isOrderConflicting(orderParams)) {
			return new Error('conflict');
		}

		const result = this._creep.harvest(target);
		if (result === OK) {
			this._addOrder(orderParams);
		}

		return {creepOrder, result};
	}

	public moveToPos(target: RoomPosition): CreepOrderResult {
		const creepOrder: CreepOrder = 'move';
		const orderParams: CreepOrderParams = {creepOrder};

		if (this.isOrderConflicting(orderParams)) {
			return new Error('conflict');
		}

		const result = this._creep.moveTo(target);
		if (result === OK) {
			this._addOrder(orderParams);
		}

		return {creepOrder, result};
	}

	public getName(): string {
		return this._creep.name;
	}

	public getClosestSource(): Source {
		return this._creep.pos.findClosestByPath<Source>(FIND_SOURCES_ACTIVE);
	}

	public isOrderConflicting(params: CreepOrderParams): boolean {
		if (this._scheduledOrders[params.creepOrder]) {
			return false;
		}

		for (const conflictingSet of CreepManager._conflictingOrders) {
			if (conflictingSet.has(params.creepOrder)) {
				for (const conflictingOrder of conflictingSet) {
					if (this._scheduledOrders[conflictingOrder]) {
						return false;
					}
				}
			}
		}

		if (params.carryDelta) {
			const outcome = params.carryDelta.outcome;
			if (outcome) {
				for (const resource in outcome) {
					if (outcome.hasOwnProperty(resource)) {
						if (this.getResourceAvailable(resource) < outcome[resource]) {
							return false;
						}
					}
				}
			}
		}

		return true;
	}

	public getResource(resource: string): number {
		return this._creep.carry[resource] || 0;
	}

	public getResourceAvailable(resource: string): number {
		const creepResource = this._creep.carry[resource] || 0;
		const usedResources = this._carryDelta.outcome ? this._carryDelta.outcome[resource] || 0 : 0;

		return creepResource - usedResources;
	}

	public getResourceForecast(resource: string): number {
		const resourcesAvailable = this.getResourceAvailable(resource);
		const incommingResources = this._carryDelta.income ? this._carryDelta.income[resource] || 0 : 0;

		return resourcesAvailable + incommingResources;
	}

	public getFreeCarryForecast(): number {
		let result = this._creep.carryCapacity - _.sum(this._creep.carry);

		if (this._carryDelta.income) {
			result += _.sum(this._carryDelta.income);
		}

		if (this._carryDelta.outcome) {
			result -= _.sum(this._carryDelta.outcome);
		}

		return result;
	}

	protected _addOrder(params: CreepOrderParams) {
		this._scheduledOrders[params.creepOrder] = params;
	}

	// TODO: refactor to use role classes
	protected _createTaskObject(): ITask|null {
		const taskName = this._creep.memory['task']['name'];

		switch (taskName) {
			// TODO: write creation logic
			default:
				return null;
		}
	}

	// TODO: refactor to use role classes
	protected _canRunAgain(taskResult: TaskRunResult): boolean {
		return taskResult.taskStatus !== TaskStatus.ORDER_CONFLICT;
	}

	protected static _getSourceAvailableResources(target: Source | Mineral): number {
		if (target instanceof Source) {
			return target.energy;
		} else if (
			target &&
			typeof target.mineralType === 'string' &&
			typeof target.mineralAmount === 'number'
		) {
			return target.mineralAmount;
		}

		return NaN;
	}
}
