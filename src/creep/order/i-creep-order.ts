import {CarryDelta} from '../creep-manager/creep-manager'; // TODO: remove circular dependency

export type CreepOrderName = 'attack'|'attackController'|'build'|'claimController'|'dismantle'|'drop'|'harvest'|'heal'|
	'move'|'moveByPath'|'pickup'|'rangedAttack'|'rangedHeal'|'rangedMassAttack'|'repair'|'reserveController'|
	'signController'|'transfer'|'upgradeController'|'withdraw';

export type CreepOrderResult = number|Error;

export interface ICreepOrder {
	getName(): CreepOrderName;
	run(creep: Creep): CreepOrderResult;
	getCarryDelta(): CarryDelta;
	canRun(): boolean;
	getOutcomeForecast(): StoreDefinition|undefined;
	getIncomeForecast(): StoreDefinition|undefined;
	isConflicting(): boolean;
	isEnoughResources(): boolean;
}
