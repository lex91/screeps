// import {CreepCreator} from './components/creeps/utils/creep-creator';


interface Memory {
	uuid: number;
	log: any;
}

declare function require(path: string): any;

interface Global {
	log: any;
	creepCreator: any;
}

declare var global: Global;
