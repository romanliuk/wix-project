class Vertex {
	constructor(parentVertex, board, move) {
		this.board = board;
		this.parentVertex = parentVertex;
		this.move = move;
		this.steps = this.getSteps();
		this.wrongTiles = this.getWrongTiles();
		this.manhattan = this.getManhattanDistance();
		this.linearConflicts = this.getLinearConflictsCount();
		this.measure = this.steps + this.wrongTiles + this.manhattan + this.linearConflicts * 2;
	}

	getHash() {
		return this.board.getState().field.join('-');
	}

	getBoard() {
		return this.board;
	}

	getMeasure() {
		return this.measure;
	}

	getParentVertex() {
		return this.parentVertex;
	}

	getPath() {
		const result = [this.move];
		let pVertex = this.parentVertex;
		while (pVertex && pVertex.move) {
			result.push(pVertex.move);
			pVertex = pVertex.parentVertex;
		}
		return result.reverse();
	}

	getSteps() {
		let steps = 0;
		let parent = this.parentVertex;
		while (parent !== null) {
			steps++;
			parent = parent.getParentVertex();
		}
		return steps;
	}

	getManhattanDistance() {
		const {field, cols} = this.board.getState();
		return field.reduce((summ, item, index) => {
			if (item === 0) {
				return summ
			}
			const winIndex = item - 1;
			const delta = Math.abs(index - winIndex);
			const row = (delta - delta % cols) / cols;
			const col = delta % cols;
			return summ + row + col
		}, 0);
	}

	getWrongTiles() {
		const {field} = this.board.getState();
		return field.reduce((count, item, index, arr) => {
			if (index === arr.length - 1) {
				return item === 0 ? count : count + 1;
			}
			return item === index + 1 ? count : count + 1;
		}, 0);
	}

	getLinearConflictsCount() {
		const {field, rows, cols} = this.board.getState();
		let conflictCount = 0;
		// check each row for linear conflict
		for (let row = 0; row < rows; row++)
			for (let i = row * cols; i < (row + 1) * cols - 1; i++) {
				if (field[i] === 0) {
					continue;
				}
				const iGoal = field[i] - 1;
				const iGoalRow = (iGoal - iGoal % cols) / cols;
				for (let j = i + 1; j < (row + 1) * cols; j++) {
					if (field[j] === 0) {
						continue;
					}
					const jGoal = field[j] - 1;
					const jGoalRow = (jGoal - jGoal % cols) / cols;
					const necessityCondition = (i !== iGoal) && (j !== jGoal) && (iGoalRow === row && jGoalRow === row);
					const sufficiencyCondition = (iGoal > jGoal);
					if (necessityCondition && sufficiencyCondition) {
						conflictCount++;
					}
				}
			}
		// check each column for linear conflict
		for (let col = 0; col < cols; col++)
			for (let i = col; i < cols * (rows - 1) + col; i = i + cols) {
				if (field[i] === 0) {
					continue;
				}
				const iGoal = field[i] - 1;
				const iGoalCol = iGoal % cols;
				for (let j = i + cols; j <= cols * (rows - 1) + col; j = j + cols) {
					if (field[j] === 0) {
						continue;
					}
					const jGoal = field[j] - 1;
					const jGoalCol = jGoal % cols;
					const necessityCondition = (i !== iGoal) && (j !== jGoal) && (iGoalCol === col && jGoalCol === col);
					const sufficiencyCondition = (iGoal > jGoal);
					if (necessityCondition && sufficiencyCondition) {
						conflictCount++;
					}
				}
			}
		return conflictCount;
	}

	isGoal() {
		return this.board.finished;
	}
}

module.exports = Vertex;