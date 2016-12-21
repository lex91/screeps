import {log} from '../../support/log';
import {RenewMemory, renew} from '../tasks/renew';


export function run(creep: Creep) {
	const data = getDataFromCreepMemory(creep);

	/*
	 Renewing:
	 */
	if (data.renew) {
		if (data.renew.shouldRenew !== false) {
			if (creep.room.energyCapacityAvailable - creep.room.energyAvailable < 200) {
				data.renew.shouldRenew = false;
			} else if (creep.ticksToLive <= data.renew.renewWhen) {
				data.renew.shouldRenew = true;
			}
		}

		if (data.renew.shouldRenew) {
			const renewResult = renew(
				creep,
				creep.pos.findClosestByPath<Spawn>(FIND_MY_SPAWNS)
			);

			if (renewResult instanceof Error) {
				logFail(creep, `Can't renew: ${renewResult.message}`);
				return;
			}
			const isRenewedEnough = renewResult === true && creep.ticksToLive >= data.renew.renewUntil;
			if (isRenewedEnough) {
				data.renew.shouldRenew = null;
			}

			return;
		}
	}

	/*
	 Transporting:
	 */
	if (creep.carry[RESOURCE_ENERGY] === 0) {
		const from = Game.getObjectById<Container|Storage>(data.fromId);
		if (!from) {
			logFail(creep, `Can't find "from" object by id`);
			return;
		}

		const withdrawAmount = Math.min(creep.carryCapacity, Number(from.store[RESOURCE_ENERGY]) - data.fromMinAmount);
		if (withdrawAmount <= 0) {
			if (data.renew) {
				data.renew.shouldRenew = null;
			}

			return;
		}

		const withdrawResult = creep.withdraw(from, RESOURCE_ENERGY, withdrawAmount);
		switch (withdrawResult) {
			case OK:
				if (data.renew) {
					data.renew.shouldRenew = null;
				}

				return;
			case ERR_NOT_IN_RANGE:
				if (data.renew) {
					data.renew.shouldRenew = false;
				}

				creep.moveTo(from);

				return;
			default:
				logFail(creep, `Can't withdraw - ${withdrawResult}`);
				return;
		}
	} else {
		let structures: (Spawn|Extension|Tower)[] = creep.room.find<Spawn|Extension>(FIND_MY_STRUCTURES, {
			filter: (structure: Structure) => {
				if (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN) {
					const energyStructire = <Spawn|Extension> (structure);

					return energyStructire.energy < energyStructire.energyCapacity;
				}

				return false;
			}
		});
		if (structures.length === 0) {
			structures = creep.room.find<Spawn | Extension>(FIND_MY_STRUCTURES, {
				filter: (structure: Structure) => {
					if (structure.structureType === STRUCTURE_TOWER) {
						const energyStructire = <Tower> (structure);

						return energyStructire.energy < energyStructire.energyCapacity;
					}

					return false;
				}
			});
		}
		if (structures.length === 0) {
			if (data.renew) {
				data.renew.shouldRenew = null;
			}
			return;
		}

		let chosenTarget: Spawn|Extension|Tower = structures[0];
		let minMeasure = creep.room.findPath(creep.pos, chosenTarget.pos).length;
		for (let i = 1; i < structures.length; i++) {
			const measure = creep.room.findPath(creep.pos, structures[i].pos).length;
			if (measure < minMeasure) {
				minMeasure = measure;
				chosenTarget = structures[i];
			}
		}

		const transferAmount = Math.min(
			Number(creep.carry[RESOURCE_ENERGY]),
			chosenTarget.energyCapacity - chosenTarget.energy
		);
		if (transferAmount <= 0) {
			logFail(creep, `Can't charge - all objects is full and it is unexpected!`);
			return;
		}

		const transferResult = creep.transfer(chosenTarget, RESOURCE_ENERGY, transferAmount);
		switch (transferResult) {
			case OK:
				if (data.renew) {
					data.renew.shouldRenew = null;
				}

				return;
			case ERR_NOT_IN_RANGE:
				if (data.renew) {
					data.renew.shouldRenew = false;
				}

				creep.moveTo(chosenTarget);

				return;
			default:
				logFail(creep, `Can't withdraw - ${transferResult}`);
				return;
		}
	}
}


function getDataFromCreepMemory(creep: Creep): EnergyChargerMemory {
	return <EnergyChargerMemory> (creep.memory.role.data);
}


function logFail(creep: Creep, failMessage: string): void {
	log.error(
		`Energy charger ${creep.name} failed: ${failMessage}.
		Params: ${JSON.stringify(getDataFromCreepMemory(creep))}`
	);
}


export interface EnergyChargerMemory {
	fromId: string;
	fromMinAmount: number;
	renew?: RenewMemory;
}
