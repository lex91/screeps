import {RoomConfig} from './config';
import {creepCreator} from '../services/creep-creator';
import {CreepManager} from '../creep/creep-manager/creep-manager';


export class RoomManager {
	protected _room: Room;
	protected _config: RoomConfig;
	protected _spawns: Array<Spawn>;
	protected _creeps: Array<CreepManager>;

	constructor(params: Params) {
		this._room = params.room;
		this._config = params.config;
		this._spawns = [];
		this._creeps = [];

	}


	public run(): void {

		for (const creep of this._creeps) {
			creep.run();
		}

		// TODO:
		for (const spawn of this._spawns) {
			creepCreator.createCreep({
				spawn: spawn,
				body: {[WORK]: 1, [CARRY]: 1, [MOVE]: 2},
				memory: {
					role: {},
					room: spawn.room.name
				}
			});
		}
	}


	public addSpawn(spawn: Spawn) {
		this._spawns.push(spawn);
	}


	public addCreep(creep: Creep) {
		this._creeps.push(new CreepManager({
			creep: creep,
			roomManager: this
		}));
	}
}


type Params = {
	room: Room,
	config: RoomConfig
}
