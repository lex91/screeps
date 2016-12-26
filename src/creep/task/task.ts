import {RunResult} from '../run-result';


export interface Task {
	name: string;
	run(creep: RunParams): RunResult;
}

type RunParams = {
	creep: Creep,
	TaskData: any
}
