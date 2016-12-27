export class CreepManager {
	public creep: Creep;

	constructor(params: Params) {
		this.creep = params.creep;
	}
}

type Params = {
	creep: Creep;
}
