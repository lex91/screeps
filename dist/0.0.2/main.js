module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const roleHarvester = __webpack_require__(1);
	const roleUpgrader = __webpack_require__(2);
	const roleBuilder = __webpack_require__(3);
	const roleRepairer = __webpack_require__(4);
	const utils = __webpack_require__(5);


	const loopFunction = () => {
		utils.clearMemory();
	    //test
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
			} else { //Ð ÐµÐ¼Ð¾Ð½Ñ
				const targets = tower.room.find(FIND_STRUCTURES, {
					filter: (object) => (
						object.hits / object.hitsMax < 0.2 ||
						object.hits / object.hitsMax < 0.95 && tower.energy / tower.energyCapacity > 0.8
					) && (
						object.structureType === STRUCTURE_ROAD ||
						object.structureType === STRUCTURE_CONTAINER ||
						object.structureType === STRUCTURE_WALL && object.hits < 20000 ||
						object.structureType === STRUCTURE_RAMPART && object.hits < 20000
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

		if (population['harvester'].length < 2 || population['harvester'].length == 2 && population['harvester'][0].ticksToLive < 10) {
			utils.createHarvester([WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, CARRY]);
		} /*else if (population['repairer'].length < 1 || population['repairer'].length == 1 && population['repairer'][0].ticksToLive < 10) {
			utils.createRepairer([WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]);
		}*/ else if (population['upgrader'].length < 3 || population['upgrader'].length == 3 && population['upgrader'][0].ticksToLive < 0) {
			const createResult = utils.createUpgrader([WORK, WORK, WORK, WORK, MOVE, MOVE,MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY]);
			
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
		}/* else if (population['builder'].length < 1 || population['builder'].length == 1 && population['builder'][0].ticksToLive < 10) {
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


/***/ },
/* 1 */
/***/ function(module, exports) {

	const roleHarvester = {
		run: function (creep) {
			if (creep.carry.energy < creep.carryCapacity) {
				const sources = creep.room.find(FIND_SOURCES);
				if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
					creep.moveTo(sources[0], {reusePath: 0});
				}
			}
			else {
				let targets = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
						return (
								structure.structureType == STRUCTURE_EXTENSION ||
								structure.structureType == STRUCTURE_SPAWN
							) && structure.energy < structure.energyCapacity;
					}
				});
				
				if (targets.length === 0) {
					targets = creep.room.find(FIND_STRUCTURES, {
						filter: (structure) => {
							return (
									structure.structureType == STRUCTURE_TOWER
								) && structure.energy < structure.energyCapacity;
						}
					});
				}

				if (targets.length > 0) {
					const actionResult = creep.transfer(targets[0], RESOURCE_ENERGY);

					if (actionResult == ERR_NOT_IN_RANGE) {
						creep.moveTo(targets[0]);
					}
				}
			}
		}
	};


	module.exports = roleHarvester;

/***/ },
/* 2 */
/***/ function(module, exports) {

	const roleUpgrader = {
		run: function (creep) {
			creep.memory.upgrading = creep.memory.upgrading ? creep.carry.energy > 0 : creep.carry.energy == creep.carryCapacity;
			
			if (creep.memory.upgrading) {
				const operationResult = creep.upgradeController(creep.room.controller);
				
				if (operationResult == ERR_NOT_IN_RANGE) {
					creep.moveTo(creep.room.controller);
				}
			}
			else {
				let chosenSource = creep.memory.sourceId ? Game.getObjectById(creep.memory.sourceId) : null;
				
				if (!chosenSource) {
					const sources = creep.room.find(FIND_SOURCES);
					let minPathLength = Infinity;
					
					for (const source of sources) {
						const path = creep.room.findPath(creep.pos, source.pos);
						if (path.length < minPathLength) {
							chosenSource = source;
							minPathLength = path.length;
						}
						
					}
				}

				if (creep.harvest(chosenSource) == ERR_NOT_IN_RANGE) {
					creep.moveTo(chosenSource, {reusePath: 0});
				}
			}
		}
	};

	module.exports = roleUpgrader;


/***/ },
/* 3 */
/***/ function(module, exports) {

	const roleBuilder = {
		run: (creep) => {
			if (creep.memory.building && creep.carry.energy === 0) {
				creep.memory.building = false;
			}
			if (!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
				creep.memory.building = true;
			}
			
			if (creep.memory.building) {
				let chosenTarget = null; //TODO: ÐÐ° ÑÐ»ÑÑÐ°Ð¹, ÐµÑÐ»Ð¸ Ð¾Ð±ÑÐµÐºÑ Ð±ÑÐ´ÐµÑ ÑÐ¾ÑÑÐ°Ð½ÑÑÑÑÑ
				
				if (!chosenTarget) {
					const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
					
					if (targets.length > 0) {
						let minMeasure = Infinity;
						
						for (const target of targets) {
							const path = creep.room.findPath(creep.pos, target.pos);
							if (path.length < minMeasure) {
								chosenTarget = target;
								minMeasure = path.length;
							}
						}
					}
				}
				
				if (chosenTarget) {
					if (creep.build(chosenTarget) === ERR_NOT_IN_RANGE) {
						creep.moveTo(chosenTarget);
					}
				}
			} else {
				const sources = creep.room.find(FIND_SOURCES);
				if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
					creep.moveTo(sources[0], {reusePath: 0});
				}
			}
		}
	};


	module.exports = roleBuilder;

/***/ },
/* 4 */
/***/ function(module, exports) {

	const roleBuilder = {
		run: function (creep) {
			
			if (creep.memory.repairing && creep.carry.energy == 0) {
				creep.memory.repairing = false;
				creep.memory.targetId = null;
				
				creep.say('harvesting');
			}
			if (!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
				const targets = creep.room.find(FIND_STRUCTURES, {
					filter: (object) => (object.hits / object.hitsMax < 0.95) && (
						object.structureType === STRUCTURE_ROAD ||
						object.structureType === STRUCTURE_CONTAINER ||
						object.structureType === STRUCTURE_WALL/* && object.hits < 1000*/ ||
						object.structureType === STRUCTURE_RAMPART/* && object.hits < 1000*/
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
					// chosenTarget = targets[0];
					
					creep.memory.repairing = true;
					creep.memory.targetId = chosenTarget.id;
					
					creep.say('repairing');
				} else {
					creep.memory.repairing = true;
					creep.memory.targetId = null;
					
					creep.say('nothing to repair');
				}
				
				
			}
			
			if (creep.memory.repairing) {
				const target = creep.memory.targetId ? Game.getObjectById(creep.memory.targetId) : null;
				
				if (target && target.hits < target.hitsMax) {
					if (creep.repair(target) == ERR_NOT_IN_RANGE) {
						creep.moveTo(target);
					}
				} else {
					creep.memory.repairing = false;
					creep.memory.targetId = null;
				}
			}
			else {
				const sources = creep.room.find(FIND_SOURCES);
				if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
					creep.moveTo(sources[0], {reusePath: 0});
				}
			}
		}
	};


	module.exports = roleBuilder;

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = {
		createHarvester: (body, name) => Game.spawns['spawn'].createCreep(body, name, {role: 'harvester'}),
		createRepairer: (body, name) => Game.spawns['spawn'].createCreep(body, name, {role: 'repairer'}),
		createBuilder: (body, name) => Game.spawns['spawn'].createCreep(body, name, {role: 'builder'}),
		createUpgrader: (body, name) => Game.spawns['spawn'].createCreep(body, name, {role: 'upgrader'}),
		setMemory: (creepName, memory) => Game.creeps[creepName].memory = memory,
		clearMemory: () => {
			for (let key in Memory.creeps) {
				if (!Game.creeps[key]) {
					delete Memory.creeps[key];
				}
			}
		}
	};

	/*
	 screep initial timeToLive - 1500 (3x Work, 2xCarry, 1x)
	 ['id'].forEach(id => Game.getObjectById(id).remove()); //remove construction site
	 */


/***/ }
/******/ ]);