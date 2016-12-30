class GameCache {
	protected _idCache: Map<string, any>;

	constructor() {
		this._idCache = new Map();
	}

	public getObjectById<T>(id: string): T|null {
		let result = this._idCache.get(id);
		if (!result) {
			result = Game.getObjectById<T>(id);
			this._idCache.set(id, result);
		}

		return result;
	}
}

const gameCache = new GameCache();

export {gameCache};
