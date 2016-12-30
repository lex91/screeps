export function run(creep: Creep): void {
	let controller: Controller = <Controller> (creep.room.controller);
	let energySource = <Source> (Game.getObjectById('5836b6de8b8b9619519ef7cf'));

	let isUpgrading = Boolean(creep.memory.isUpgrading);
	const workPartsCount = creep.body.reduce((result, bodyPart) => {
		return bodyPart.type === 'work' ? result + 1 : result;
	}, 0);

	if (isUpgrading) {
		isUpgrading = creep.carry.energy >= workPartsCount;
	} else {
		isUpgrading = creep.carry.energy > creep.carryCapacity - workPartsCount * 2;
	}


	if (isUpgrading) {
		_moveToUpgrade(creep, controller);
	} else {
		_moveToHarvest(creep, energySource);
		_tryToUpgrade(creep, controller);
	}


	creep.memory.isUpgrading = isUpgrading;
}

function _tryHarvest(creep: Creep, target: Source): number {
	return creep.harvest(target);
}

function _moveToHarvest(creep: Creep, target: Source): void {
	if (_tryHarvest(creep, target) === ERR_NOT_IN_RANGE) {
		creep.moveTo(target, {reusePath: 0});
	}
}

function _tryToUpgrade(creep: Creep, controller: Controller): number {
	return creep.upgradeController(controller);
}

function _moveToUpgrade(creep: Creep, controller: Controller): void {
	if (_tryToUpgrade(creep, controller) === ERR_NOT_IN_RANGE) {
		creep.moveTo(Game.flags['f1']);
	}
}
