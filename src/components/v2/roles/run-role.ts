import {run as staticHarvester} from './static-harvester';
import {log} from "../../support/log";
import {TaskStatus} from "../tasks/run-task";


export function runRole(name: string, params: RoleParams, deps: RoleDeps): void {
	switch (name) {
		case staticHarvester.roleName:
			staticHarvester(params, deps);
			break;
		default:
			log.info(`Can't find role ${name}`);
	}
}


export interface Role {
	(params: RoleParams, deps: RoleDeps): void;
	roleName: string;
}

export interface RoleParams {
	currentTask?: {
		taskStatus: TaskStatus;
		taskName: string;
		taskData: any;
	};
	roleData: any;
}

export interface RoleDeps {
	creep: Creep;
}
