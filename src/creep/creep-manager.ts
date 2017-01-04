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
	resourcesDelta?: StoreDefinition;
}

type CreepOrderResult = {
	creepOrder: CreepOrder;
	result: number;
}|Error;

const MAX_ORDERS_PER_TURN = 16;

export class CreepManager {
	protected _creep: Creep;
	protected _carryAvailable: StoreDefinition;
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
		this._carryAvailable = Object.assign({}, params.creep.carry);
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
		const creepOrder: CreepOrder = 'harvest';
		const orderParams: CreepOrderParams = {creepOrder};

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

		if (params.resourcesDelta) {
			for (const resource in params.resourcesDelta) {
				if (this.getResourceAvailable(resource) < params.resourcesDelta[resource]) {
					return false;
				}
			}
		}

		return true;
	}

	public getResource(resource: string): number {
		return this._creep.carry[resource] || 0;
	}

	public getResourceAvailable(resource: string): number {
		return this._carryAvailable[resource] || 0;
	}


	public getFreeCarry(): number {
		return this._creep.carryCapacity - _.sum(this._creep.carry);
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
