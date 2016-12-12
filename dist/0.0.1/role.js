class CreepManager {
	setCreep(creep) {
		this.creep = creep;
	}
}


const updateTask = (creep) => {
	const roles = creep.memory.roles;

	for (const role of roles) {
		
	}
};

const getRoleTask = (creep) = {};


module.exports = {
	updateTask
};

/*
creep.memory:
roles: [Role]
currentTaskData: TaskData;
 */