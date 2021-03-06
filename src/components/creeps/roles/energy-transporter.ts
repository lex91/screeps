import {log} from '../../support/log';
import {RenewMemory, renew} from '../tasks/renew';


export function run(creep: Creep) {
	const data = getDataFromCreepMemory(creep);

	/*
	 Renewing:
	 */
	if (data.renew) {
		if (data.renew.shouldRenew !== false) {
			if (creep.room.energyCapacityAvailable - creep.room.energyAvailable > 200) {
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
		const to = Game.getObjectById<Container|Storage>(data.toId);
		if (!to) {
			logFail(creep, `Can't find "to" object by id`);
			return;
		}

		const toStoreLoad = _.sum(to.store);
		const transferAmount = Math.min(Number(creep.carry[RESOURCE_ENERGY]), to.storeCapacity - toStoreLoad);
		if (transferAmount <= 0) {
			if (data.renew) {
				data.renew.shouldRenew = null;
			}

			return;
		}

		const transferResult = creep.transfer(to, RESOURCE_ENERGY, transferAmount);
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

				creep.moveTo(to);

				return;
			default:
				logFail(creep, `Can't withdraw - ${transferResult}`);
				return;
		}
	}
}


function getDataFromCreepMemory(creep: Creep): EnergyTransporterMemory {
	return <EnergyTransporterMemory> (creep.memory.role.data);
}


function logFail(creep: Creep, failMessage: string): void {
	log.error(
		`Energy transporter ${creep.name} failed: ${failMessage}.
		Params: ${JSON.stringify(getDataFromCreepMemory(creep))}`
	);
}


export interface EnergyTransporterMemory {
	fromId: string;
	fromMinAmount: number;
	toId: string;
	renew?: RenewMemory;
}
