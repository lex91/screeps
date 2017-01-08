// const MAX_ORDERS_PER_TURN = 16;

// public run(): void {
// 	const task = this._createTaskObject();
// if (!task) {
// 	log.error(`Can't run creep ${this._creep.name} - no task found`);
// 	return;
// }
//
// let taskResult;
// let iterationsLeft = MAX_ORDERS_PER_TURN;
// do {
// 	if (--iterationsLeft > 0) {
// 		log.error(`Creep ${this._creep.name} is running too long, stopping`);
// 		return;
// 	}
//
// 	taskResult = task.run({
// 		roomManager: this._roomManager,
// 		creepMemory: this._creep.memory['task']['data']
// 	});
// } while (this._canRunAgain(taskResult));
// }

// // TODO: refactor to use role classes
// protected _createTaskObject(): ITask|null {
// 	const taskName = this._creep.memory['task']['name'];
//
// 	switch (taskName) {
// 		// TODO: write creation logic
// 		default:
// 			return null;
// 	}
// }
//
// // TODO: refactor to use role classes
// protected _canRunAgain(taskResult: TaskRunResult): boolean {
// 	return taskResult.taskStatus !== TaskStatus.ORDER_CONFLICT;
// }
