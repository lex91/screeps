import {log} from '../../support/log';
import {RenewMemory, renew} from "../tasks/renew";


export function run(creep: Creep) {
	const data = getDataFromCreepMemory(creep);

	/*
	 Renewing:
	 */
	if (data.renew) {
		if (data.renew.shouldRenew !== false) {
			if (creep.ticksToLive <= data.renew.renewWhen) {
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
		}
	}

	/*
	 Transporting:
	 */
	if (creep.carry.energy === 0) {
		const from = Game.getObjectById<Container|Storage>(data.fromId);
		if (!from) {
			logFail(creep, `Can't find "from" object by id`);
			return;
		}

		const withdrawAmount = Math.min(creep.carryCapacity, from.store[RESOURCE_ENERGY] - data.fromMinAmount);
		if (withdrawAmount > 0) {
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

					break;
				default:
					logFail(creep, `Can't withdraw - ${withdrawResult}`);
					return;
			}
		} else {
			if (data.renew) {
				data.renew.shouldRenew = null;
			}

			return;
		}
	} else {
		// TODO: go to "to" structure
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
