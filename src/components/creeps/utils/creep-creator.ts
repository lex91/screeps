export class CreepCreator {
	public createCreep(params: CreateParams): string|number {
		const body = CreepCreator._createCreepBodyFromObject(params.body);
		return params.spawn.createCreep(body, params.name, params.memory);
	}


	protected static _createCreepBodyFromObject(bodyObject: {[part: string]: number}): Array<string> {
		const bodyArray = [];
		for (let bodyPart in bodyObject) {
			for (let i = 0; i < bodyObject[bodyPart]; i++) {
				bodyArray.push(bodyPart);
			}
		}

		return bodyArray;
	}
}


const creepCreator = new CreepCreator();
export {creepCreator};


interface CreateParams {
	spawn: Spawn;
	body: {
		[part: string]: number
	};
	name?: string;
	memory?: any;
}
