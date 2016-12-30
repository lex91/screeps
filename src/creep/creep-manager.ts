import {ITask, TaskRunResult, TaskStatus} from './task/base/i-task';
import {RoomManager} from '../room/room-manager';
import {log} from '../componentsLegacy/support/log';


export class CreepManager {
	protected _creep: Creep;
	protected _roomManager: RoomManager;

	constructor(params: CreepManagerConctructorParams) {
		this._creep = params.creep;
		this._roomManager = params.roomManager;
	}

	public run(): void {
		const task = this._createTaskObject();
		if (!task) {
			log.error(`Can't run creep ${this._creep.name} - no task found`);
			return;
		}

		let taskResult;
		let iterationLimit = 0;
		do {
			if (iterationLimit++ > 50) {
				log.error(`Creep ${this._creep.name} is running too long, stopping`);
				return;
			}

			taskResult = task.run({
				roomManager: this._roomManager,
				creepMemory: this._creep.memory['task']['data']
			});
		} while (this._canRunAgain(taskResult));
	}

	public getName(): string {
		return this._creep.name;
	}

	protected _createTaskObject(): ITask|null {
		const taskName = this._creep.memory['task']['name'];

		switch (taskName) {
			// TODO: write creation logic
			default:
				return null;
		}

	}

	protected _canRunAgain(taskResult: TaskRunResult): boolean {
		return taskResult.taskStatus !== TaskStatus.CREEP_BUSY;
	}
}

export type CreepManagerConctructorParams = {
	creep: Creep,
	roomManager: RoomManager
};
