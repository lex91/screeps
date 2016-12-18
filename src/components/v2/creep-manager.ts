import {StaticHarvester} from './roles/static-harvester';


export class CreepController {
	protected _creep: Creep;


	public constructor(creep: Creep) {
		this._creep = creep;
		this._role = this._createRole(creep.memory.role);
	};


	public run() {
		if (!this._creep.spawning) {
			this._role.run();
		}
	}


	protected _createRole({name, data}: {name: string, data: any}): AbstractRole {
		for (const role of CreepController._roles) {
			if (role.getRoleName() === name) {
				const creep = this._creep;
				return new role({data, creep});
			}
		}

		throw new Error(`CreepController#_createRole: Can't find role class`);
	}


	protected static _roles = new Set([
		StaticHarvester,
		EnergyTransporter
	]);
}
