const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleRepairer = require('role.repairer');
const utils = require('utils');


const loopFunction = () => {
	utils.clearMemory();

	console.log();
	console.log(`$= = = Tick: ${Game.time} = = =`);

	showRoomStatistics();
	showPopulationStatistics();

	const population = {
		'harvester': [],
		'upgrader': [],
		'repairer': [],
		'builder': []
	};


	const tower = Game.getObjectById('584d50cd08b29cc44c58de33'); //TODO: may be find?
	if (tower) {
		const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		if (closestHostile) {
			tower.attack(closestHostile);
		} else { //Ремонт
			const targets = tower.room.find(FIND_STRUCTURES, {
				filter: (object) => (
					object.hits / object.hitsMax < 0.2 ||
					object.hits / object.hitsMax < 0.95 && tower.energy / tower.energyCapacity > 0.8
				) && (
					object.structureType === STRUCTURE_ROAD ||
					object.structureType === STRUCTURE_CONTAINER ||
					object.structureType === STRUCTURE_WALL && object.hits < 1000 ||
					object.structureType === STRUCTURE_RAMPART && object.hits < 500
				)
			});
			
			if (targets.length > 0) {
				let chosenTarget;
				let minMeasure = Infinity;
				
				for (const target of targets) {
					const measure = target.hits / target.hitsMax;
					if (measure < minMeasure) {
						minMeasure = measure;
						chosenTarget = target;
					}
				}
				
				tower.repair(chosenTarget);
			}
			
			// const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
			// 	filter: (structure) => (structure.hits/structure.hitsMax) < 0.95
			// });
			// if (closestDamagedStructure) {
			// 	tower.repair(closestDamagedStructure);
			// }
		}
	}
	
	
	for (let name in Game.creeps) {
		const creep = Game.creeps[name];

		population[creep.memory.role].push(creep);
		roleRun[creep.memory.role](creep);
	}

	for (let role in population) {
		if (population[role].length > 1) {
			population[role].sort((a, b) => a.ticksToLive - b.ticksToLive);
		}
	}

	if (population['harvester'].length < 2 || population['harvester'].length == 2 && population['harvester'][0].ticksToLive < 300) {
		utils.createHarvester([WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, CARRY]);
	} else if (population['repairer'].length < 1 || population['repairer'].length == 1 && population['repairer'][0].ticksToLive < 10) {
		utils.createRepairer([WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]);
	} else if (population['upgrader'].length < 3 || population['upgrader'].length == 3 && population['upgrader'][0].ticksToLive < 0) {
		const createResult = utils.createUpgrader([WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY]);
		
		if (typeof createResult === 'string') {
			const newCreep = Game.creeps[createResult];
			population['upgrader'].push(newCreep);

			const sources = ['5836b8298b8b9619519f192f', '5836b8298b8b9619519f1930'];
			const counts = [0, 0];
			
			for (const upgrader of population['upgrader']) {
				switch (upgrader.memory.sourceId) {
					case sources[0]:
						counts[0]++;
						break;
					case sources[1]:
						counts[1]++;
						break;
					default:
						if (counts[1] < 2) {
							upgrader.memory.sourceId = sources[1];
							counts[1]++;
						} else {
							upgrader.memory.sourceId = sources[0];
							counts[0]++;
						}
				}
			}
		}
	} /*else if (population['builder'].length < 1 || population['builder'].length == 1 && population['builder'][0].ticksToLive < 10) {
		utils.createBuilder([WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY]);
	}*/
	
	if (population['harvester'].length == 0) {
		let selectedCreep;
		let maxMeasure = -Infinity;
		
		for (let creepName in Game.creeps) {
			const creep = Game.creeps[creepName];
			
			if (creep.ticksToLive > maxMeasure) {
				maxMeasure = creep.ticksToLive;
				selectedCreep = creep;
			}
		}

		selectedCreep.memory = {role: 'harvester'};
	}

	console.log(`Population - harvesters: ${population['harvester'].length}, upgraders: ${population['upgrader'].length}, repairers: ${population['repairer'].length}, builders: ${population['builder'].length}`);
};


const showRoomStatistics = () => {
	for (let key in Game.rooms) {
		const room = Game.rooms[key];
		console.log(`Room ${room.name} -> energy: ${room.energyAvailable}`);
	}
};


const showPopulationStatistics = () => {
	for (let key in Game.creeps) {
		const creep = Game.creeps[key];
		const role = creep.memory.role;
		let roleInfo = '';
		switch (role) {
			case 'upgrader':
				roleInfo = `sourceId: ${creep.memory.sourceId}`;
				break;
		}
		console.log(`Creep ${creep.name} -> TTL: ${creep.ticksToLive}, body: [${creep.body.length}] role: ${creep.memory.role}, ${roleInfo}`);
	}
};


const roleRun = {
	'harvester': roleHarvester.run,
	'builder': roleBuilder.run,
	'repairer': roleRepairer.run,
	'upgrader': roleUpgrader.run
};


module.exports.loop = loopFunction;
