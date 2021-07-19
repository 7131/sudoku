// Creator entity class
const CreatorEntity = function(sample, clues) {
    // fields
    this._sample = sample;
    this._clues = clues;

    // create reduction clues
    let count = Math.floor(this._clues.length / 2);
    this._shrink = [];
    for (let i = 0; i < count; i++) {
        if (this._clues[i]) {
            // when a clue is set in the cell
            let copy = this._clues.concat();
            copy[i] = false;
            copy[copy.length - 1 - i] = false;
            this._shrink.push(copy);
        }
    }
    if (this._clues.length % 2 == 1 && this._clues[count]) {
        // when a clue is set in the center cell
        let copy = this._clues.concat();
        copy[count] = false;
        this._shrink.push(copy);
    }
    this._index = -1;
    this._child = null;
}

// Creator entity prototype
CreatorEntity.prototype = {

    // create the next problem
    "createNext": function(accept) {
        if (this._index < 0) {
            // this clues problem
            this._index = 0;
            return this._createProblem();
        }
        if (this._index == 0) {
            if (accept && 0 < this._shrink.length) {
                // first reduction clues
                this._child = new CreatorEntity(this._sample, this._shrink[0]);
                this._index = 1;
            } else {
                // if this clues problem is not accepted
                return null;
            }
        }

        // reduction clues problem
        let numbers = this._child.createNext(accept);
        if (numbers == null && this._index < this._shrink.length) {
            this._child = new CreatorEntity(this._sample, this._shrink[this._index]);
            this._index++;
            numbers = this._child.createNext(accept);
        }
        return numbers;
    },

    // create a problem
    "_createProblem": function() {
        let numbers = [];
        for (let i = 0; i < this._sample.length; i++) {
            // get clues
            if (this._clues[i]) {
                numbers.push(this._sample[i]);
            } else {
                numbers.push(0);
            }
        }
        return numbers;
    },

}

// Creator class
const Creator = function() {
    // fields
    this._solver = new Solver();
    this._solver.initialize();

    // events
    this.progressEvent = function(numbers, summary) { };
    this.finishEvent = function(completed) { };
    this.cancelEvent = function() { return false; };
}

// Creator prototype
Creator.prototype = {

    // initialize the fields
    "initialize": function(grids) {
        // set the grid list
        if (Array.isArray(grids)) {
            this._grids = this._shuffle(grids);
        } else {
            this._grids = [];
        }

        // create a list of clues
        this._clues = [];
        for (let i = 0; i < 81; i++) {
            this._clues.push(false);
        }
    },

    // set clues
    "setClues": function(count) {
        // initialize clues
        for (let i = 0; i < this._clues.length; i++) {
            this._clues[i] = false;
        }

        // set the center cell if the number of clues is odd
        if ((count % 2) == 1) {
            this._clues[Math.floor(this._clues.length / 2)] = true;
            count--;
        }
        count /= 2;

        // set clues in rotationally symmetric cells
        let quad = this._getRandom(count / 2);
        this._setQuadClues(quad);
        this._setTwinClues(count - quad * 2);
    },

    // start creating problems
    "start": function(logic, levels, needs) {
        // initialize the fields
        this._logic = logic;
        this._levels = levels;
        if (Array.isArray(needs)) {
            this._needs = needs;
        } else {
            this._needs = [];
        }
        this._grids = this._shuffle(this._grids);
        this._index = 0;
        this._entity = null;
        this._accept = true;

        // execute
        setTimeout(this._execute.bind(this), 1);
    },

    // set clues for 4-fold rotational symmetry
    "_setQuadClues": function(count) {
        // get the operation target positions
        let target = [];
        for (let i = 0; i < 4; i++) {
            for (let j = i; j < 8 - i; j++) {
                target.push({ "row": i, "col": j });
            }
        }

        // set random positions as clues
        let positions = this._shuffle(target);
        count = Math.min(count, positions.length);
        for (let i = 0; i < count; i++) {
            let pos = positions[i];
            this._clues[pos.row * 9 + pos.col] = true;
            this._clues[(8 - pos.row) + pos.col * 9] = true;
            this._clues[pos.row + (8 - pos.col) * 9] = true;
            this._clues[(8 - pos.row) * 9 + (8 - pos.col)] = true;
        }
    },

    // set clues for 2-fold rotational symmetry
    "_setTwinClues": function(count) {
        // get indexes of cells for which no clues have been obtained yet
        let target = [];
        let half = Math.floor(this._clues.length / 2);
        for (let i = 0; i < half; i++) {
            if (!this._clues[i]) {
                target.push(i);
            }
        }

        // set random positions as clues
        let indexes = this._shuffle(target);
        let max = this._clues.length - 1;
        count = Math.min(count, indexes.length);
        for (let i = 0; i < count; i++) {
            let index = indexes[i];
            this._clues[index] = true;
            this._clues[max - index] = true;
        }
    },

    // execute problem creation
    "_execute": function() {
        // check fields
        if (this._grids.length <= this._index) {
            this.finishEvent(true);
            return;
        }

        // create a problem
        if (this._entity == null) {
            this._entity = this._getEntity();
        }
        let numbers = this._entity.createNext(this._accept);
        if (numbers == null) {
            this._entity = this._getEntity();
            numbers = this._entity.createNext(this._accept);
        }
        this._logic.setSolidList(numbers);
        this._logic.setNumberList([]);
        this._logic.setupCandidates();

        // create a solution
        let result = this._solver.solve(this._logic, this._levels);
        if (result.solutions.length == 1) {
            // if there is only one solution
            let valid = true;
            let i = 0;
            while (valid && i < this._needs.length) {
                if (this._needs[i] && result.summary[i] === 0) {
                    valid = false;
                }
                i++;
            }
            if (valid) {
                // if all required methods are used
                this.progressEvent(numbers, result.summary);
                this._entity = null;
            } else {
                // if at least one required method is not used
                this.progressEvent(null, []);
                this._accept = true;
            }
        } else {
            // if there is no one solution
            this.progressEvent(null, []);
            this._accept = false;
        }

        // check for cancellations
        if (this.cancelEvent()) {
            this.finishEvent(false);
            return;
        }

        // execute more
        setTimeout(this._execute.bind(this), 1);
    },

    // get the next creation entity
    "_getEntity": function() {
        // get the next grid
        let next = this._grids[this._index];
        let entity = new CreatorEntity(next, this._clues);

        // update index
        this._index++;
        return entity;
    },

    // generate integer random numbers
    "_getRandom": function(max) {
        return Math.floor(Math.random() * Math.floor(max));
    },

    // shuffle the array
    "_shuffle": function(target) {
        let before = target.concat();
        let after = [];
        while (0 < before.length) {
            // get elements randomly
            let index = this._getRandom(before.length);
            after.push(before[index]);
            before.splice(index, 1);
        }
        return after;
    },

}

