import {RoomConfig} from './config';
import {run as runUpgrader} from '../components/creeps/roles/upgrader';
import {creepCreator} from '../services/creep-creator';


export class RoomManager {
	protected _room: Room;
	protected _config: RoomConfig;
	protected _spawns: Array<Spawn>;
	protected _creeps: Array<Creep>;

	constructor(params: Params) {
		this._room = params.room;
		this._config = params.config;
		this._spawns = [];
		this._creeps = [];

	}


	public run(): void {

		for (const creep of this._creeps) {
			// TODO:
			runUpgrader(creep);
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
		this._creeps.push(creep);
	}
}


type Params = {
	room: Room,
	config: RoomConfig
}
