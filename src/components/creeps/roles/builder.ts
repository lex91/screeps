import * as creepActions from "../creepActions";
import * as upgrader from "./upgrader";

/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep
 */
export function run(creep: Creep): void {
    let spawn = creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];
    let target: ConstructionSite = creep.pos.findClosestByPath<ConstructionSite>(FIND_MY_CONSTRUCTION_SITES);
    let energySource = creep.room.find<Source>(FIND_SOURCES_ACTIVE)[0];

    if (!target) {
        return upgrader.run(creep);
    }

    let isBuilding = Boolean(creep.memory.isBuilding);
    const workPartsCount = creep.body.reduce((result, bodyPart) => {
        return bodyPart.type === "work" ? result + 1 : result;
    }, 0);

    if (isBuilding) {
        isBuilding = creep.carry.energy >= workPartsCount;
    } else {
        isBuilding = creep.carry.energy > creep.carryCapacity - workPartsCount * 2;
    }

    if (creepActions.needsRenew(creep)) {
        creepActions.moveToRenew(creep, spawn);
    } else {
        if (isBuilding) {
            _moveToBuild(creep, target);
        } else {
            _moveToHarvest(creep, energySource);
            _tryToBuild(creep, target);
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

function _tryToBuild(creep: Creep, target: ConstructionSite): number {
    return creep.build(target);
}

function _moveToBuild(creep: Creep, target: ConstructionSite): void {
    if (_tryToBuild(creep, target) === ERR_NOT_IN_RANGE) {
        creepActions.moveTo(creep, target.pos);
    }
}
