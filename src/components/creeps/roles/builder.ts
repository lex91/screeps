import * as creepActions from "../creepActions";

/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep
 */
export function run(creep: Creep): void {
  let spawn = creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];
  let controller: Controller = <Controller> (Game.getObjectById("5836b6de8b8b9619519ef7cb"));
  let energySource = creep.room.find<Source>(FIND_SOURCES_ACTIVE)[0];

  let isUpgrading = Boolean(creep.memory.isUpgrading);

  if (isUpgrading) {
    isUpgrading = creep.carry.energy > 0;
  } else {
    isUpgrading = creep.carry.energy === creep.carryCapacity;
  }

  if (creepActions.needsRenew(creep)) {
    creepActions.moveToRenew(creep, spawn);
  } else {
    if (isUpgrading) {
      _moveToUpgrade(creep, controller);
    } else {
      _moveToHarvest(creep, energySource);
    }
  }
}

function _tryHarvest(creep: Creep, target: Source): number {
  return creep.harvest(target);
}

function _moveToHarvest(creep: Creep, target: Source): void {
  if (_tryHarvest(creep, target) === ERR_NOT_IN_RANGE) {
    creepActions.moveTo(creep, target.pos);
  }
}

function _tryToUpgrade(creep: Creep, controller: Controller): number {
  return creep.upgradeController(controller);
}

function _moveToUpgrade(creep: Creep, controller: Controller): void {
  if (_tryToUpgrade(creep, controller) === ERR_NOT_IN_RANGE) {
    creepActions.moveTo(creep, controller.pos);
  }
}
