import {RoomManager} from '../room/room-manager';
import {ICreepOrder, CreepOrderName} from './order/i-creep-order';

// TODO: do interface and move all types to it
export type CreepManagerConstructorParams = {
	creep: Creep;
	roomManager: RoomManager;
};

export type CarryDelta = {
	income?: StoreDefinition;
	outcome?: StoreDefinition;
};

export class CreepManager {
	protected _roomManager: RoomManager;

	protected _creep: Creep;
	protected _carryDelta: CarryDelta;
	protected _scheduledOrders: {[key in CreepOrderName]?: ICreepOrder};

	constructor(params: CreepManagerConstructorParams) {
		this._creep = params.creep;
		this._carryDelta = {
			income: {},
			outcome: {}
		};
		this._roomManager = params.roomManager;
		this._scheduledOrders = {};
	}

	public getScheduledOrders(): {[key in CreepOrderName]?: ICreepOrder} {
		return this._scheduledOrders;
	}

	public getName(): string {
		return this._creep.name;
	}

	public getClosestSource(): Source {
		return this._creep.pos.findClosestByPath<Source>(FIND_SOURCES_ACTIVE);
	}

	public getResource(resource: string): number {
		return this._creep.carry[resource] || 0;
	}

	public isResourcesAvailable(outcome: StoreDefinition): boolean {
		for (const resource in outcome) {
			if (outcome.hasOwnProperty(resource)) {
				if (this.getResourceAvailable(resource) < outcome[resource]) {
					return false;
				}
			}
		}

		return true;
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

	public getActiveBodyparts(bodypartType: string): number {
		return this._creep.getActiveBodyparts(bodypartType);
	}

	// TODO: use CreepOrder class
	// protected _addOrder(params: CreepOrderParams) {
	// 	this._scheduledOrders[params.creepOrder] = params;
	// }
}
