class CreepCreator {
	public createCreep({spawn, body, name, memory}: CreateParams): string|number {
		const bodyArray = CreepCreator._createCreepBodyFromObject(body);
		return spawn.createCreep(bodyArray, name, memory);
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
