import * as Config from "../../config/config";

import * as harvester from "./roles/harvester";
import * as upgrader from "./roles/upgrader";
import * as builder from "./roles/builder";

import {log} from "../support/log";

export let creeps: Creep[];
export let creepCount: number = 0;

export let harvesters: Creep[] = [];
export let upgraders: Creep[] = [];
export let builders: Creep[] = [];

/**
 * Initialization scripts for CreepManager module.
 *
 * @export
 * @param {Room} room
 */
export function run(room: Room): void {
    _loadCreeps(room);
    _buildMissingCreeps(room);

    _.each(creeps, (creep: Creep) => {
        if (creep.memory.role === "harvester") {
            harvester.run(creep);
        } else if (creep.memory.role === "upgrader") {
            upgrader.run(creep);
        } else if (creep.memory.role === "builder") {
            builder.run(creep);
        }
    });
}

/**
 * Loads and counts all available creeps.
 *
 * @param {Room} room
 */
function _loadCreeps(room: Room) {
    creeps = room.find<Creep>(FIND_MY_CREEPS);
    creepCount = _.size(creeps);

    // Iterate through each creep and push them into the role array.
    harvesters = _.filter(creeps, (creep) => creep.memory.role === "harvester");
    upgraders = _.filter(creeps, (creep) => creep.memory.role === "upgrader");
    builders = _.filter(creeps, (creep) => creep.memory.role === "builder");

    if (Config.ENABLE_DEBUG_MODE) {
        log.info(creepCount + " creeps found in the playground.");
        log.info(
            "Harvesters: " + harvesters.length +
            ", Upgraders: " + upgraders.length +
            ", Builders: " + builders.length
        );
    }
}

/**
 * Creates a new creep if we still have enough space.
 *
 * @param {Room} room
 */
function _buildMissingCreeps(room: Room) {
    let bodyParts: string[];

    let spawns: Spawn[] = room.find<Spawn>(FIND_MY_SPAWNS, {
        filter: (spawn: Spawn) => {
            return spawn.spawning === null;
        },
    });

    if (Config.ENABLE_DEBUG_MODE) {
        if (spawns[0]) {
            log.info("Spawn: " + spawns[0].name);
        }
    }

    if (harvesters.length < 1) {
        bodyParts = [WORK, CARRY, MOVE, MOVE];

        _.each(spawns, (spawn: Spawn) => {
            _spawnCreep(spawn, bodyParts, "harvester");
        });
    } else if (upgraders.length < 1) {
        bodyParts = [WORK, WORK, CARRY, MOVE];
        _.each(spawns, (spawn: Spawn) => {
            _spawnCreep(spawn, bodyParts, "upgrader");
        });
    } else if (builders.length < 2) {
        bodyParts = [WORK, WORK, CARRY, MOVE];
        _.each(spawns, (spawn: Spawn) => {
            _spawnCreep(spawn, bodyParts, "builder");
        });
    }
}

/**
 * Spawns a new creep.
 *
 * @param {Spawn} spawn
 * @param {string[]} bodyParts
 * @param {string} role
 * @returns
 */
function _spawnCreep(spawn: Spawn, bodyParts: string[], role: string) {
    let uuid: number = Memory.uuid;
    let status: number | string = spawn.canCreateCreep(bodyParts, undefined);

    let properties: { [key: string]: any } = {
        role,
        room: spawn.room.name,
    };

    status = _.isString(status) ? OK : status;
    if (status === OK) {
        Memory.uuid = uuid + 1;
        let creepName: string = spawn.room.name + " - " + role + uuid;

        log.info("Started creating new creep: " + creepName);
        if (Config.ENABLE_DEBUG_MODE) {
            log.info("Body: " + bodyParts);
        }

        status = spawn.createCreep(bodyParts, creepName, properties);

        return _.isString(status) ? OK : status;
    } else {
        if (Config.ENABLE_DEBUG_MODE) {
            log.info("Failed creating new creep: " + status);
        }

        return status;
    }
}
