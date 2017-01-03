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

type CreepOrderParams = {
	creepOrder: CreepOrder;
	resourcesUsed?: StoreDefinition;
}

/** standard _creep method result or Error if method is conflicting */
type CreepOrderResult = number|Error;

const MAX_ORDERS_PER_TURN = 16;

export class CreepManager {
	protected _creep: Creep;
	protected _carryForecast: StoreDefinition;
	protected _roomManager: RoomManager;
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
		this._carryForecast = Object.assign({}, params.creep.carry);
		this._roomManager = params.roomManager;
		this._scheduledOrders = {};
	}

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

	public harvest(target: Source | Mineral): CreepOrderResult {
		const orderParams: CreepOrderParams = {creepOrder: 'harvest'};

		if (this.isOrderConflicting(orderParams)) {
			return new Error('conflict');
		}

		const runResult = this._creep.harvest(target);
		if (runResult === OK) {
			this._addOrder(orderParams);
		}

		return runResult;
	}

	public moveTo(target: RoomPosition): CreepOrderResult {
		const orderParams: CreepOrderParams = {creepOrder: 'move'};

		if (this.isOrderConflicting(orderParams)) {
			return new Error('conflict');
		}

		const runResult = this._creep.moveTo(target);
		if (runResult === OK) {
			this._addOrder(orderParams);
		}

		return runResult;
	}

	public getName(): string {
		return this._creep.name;
	}

	public getClosestSource(): Source {
		return this._creep.pos.findClosestByPath<Source>(FIND_SOURCES_ACTIVE);
	}

	public isOrderConflicting(params: CreepOrderParams): boolean {
		for (const conflictingSet of CreepManager._conflictingOrders) {
			if (conflictingSet.has(params.creepOrder)) {
				for (const conflictingOrder of conflictingSet) {
					if (this._scheduledOrders[conflictingOrder]) {
						return false;
					}
				}
			}
		}

		if (params.resourcesUsed) {
			for (const resource in params.resourcesUsed) {
				if (!(this._creep.carry[resource] >= params.resourcesUsed[resource])) {
					return false;
				}
			}
		}

		return true;
	}

	public getResource(resource: string): number {
		return this._creep.carry[resource] || 0;
	}

	public getResourceForecast(resource: string): number {
		return this._carryForecast[resource] || 0;
	}

	public getFreeCarry(): number {
		return this._creep.carryCapacity - _.sum(this._creep.carry);
	}

	public getFreeCarryForecast(): number {
		return this._creep.carryCapacity - _.sum(this._carryForecast);
	}

	protected _addOrder(params: CreepOrderParams) {
		this._scheduledOrders[params.creepOrder] = params;
	}

	protected _createTaskObject(): ITask|null {
		const taskName = this._creep.memory['task']['name'];

		switch (taskName) {
			// TODO: write creation logic
			default:
				return null;
		}
	}

	protected _canRunAgain(taskResult: TaskRunResult): boolean {
		return taskResult.taskStatus !== TaskStatus.ORDER_CONFLICT;
	}
}
