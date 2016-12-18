import {Task, TaskStatus, TaskDeps} from './run-task';
import {log} from "../../support/log";


const moveTo = <Task> function (params: any, {creep}: TaskDeps): TaskStatus {
	const {targetId, positionData} = <MoveToParams>(params);

	let targetPosition: RoomPosition|null = null;
	if (targetId) {
		const target = Game.getObjectById<RoomObject>(<string> (targetId));
		if (target) {
			targetPosition = target.pos;
		}
	} else if (positionData) {
		targetPosition = new RoomPosition(positionData.x, positionData.y, positionData.roomName);
	}

	if (!targetPosition) {
		log.error(`Error moving creep ${creep.name}: cant find position in params: ${JSON.stringify(params)}`);
		return TaskStatus.ERROR;
	}

	if (creep.pos.isNearTo(targetPosition)) {
		return TaskStatus.DONE;
	}

	const moveResult = creep.moveTo(targetPosition);
	switch (moveResult) {
		case OK:
		case ERR_TIRED:
			return TaskStatus.PROCESSING;
		default:
			log.error(`Error moving creep ${creep.name} with params ${JSON.stringify(params)}. Code: ${moveResult}`);
			return TaskStatus.ERROR;
	}
};

moveTo.taskName = 'move-to';


export {moveTo};

export interface MoveToParams {
	targetId?: string;
	positionData?: {
		x: number;
		y: number;
		roomName: string;
	}
}
