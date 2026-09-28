// Generator entity class
class GeneratorEntity {
    #sample;
    #clues;
    #child;
    #shrink = [];
    #index = -1;

    // constructor
    constructor(sample, clues) {
        // fields
        this.#sample = sample;
        this.#clues = clues;

        // generate reduction clues
        const count = Math.floor(this.#clues.length / 2);
        for (let i = 0; i < count; i++) {
            if (this.#clues[i]) {
                // when a clue is set in the cell
                const copy = this.#clues.concat();
                copy[i] = false;
                copy[copy.length - 1 - i] = false;
                this.#shrink.push(copy);
            }
        }
        if (this.#clues.length % 2 == 1 && this.#clues[count]) {
            // when a clue is set in the center cell
            const copy = this.#clues.concat();
            copy[count] = false;
            this.#shrink.push(copy);
        }
    }

    // generate the next problem
    generateNext(accept) {
        if (this.#index < 0) {
            // this clues problem
            this.#index = 0;
            return this.#generateProblem();
        }
        if (this.#index == 0) {
            if (accept && 0 < this.#shrink.length) {
                // first reduction clues
                this.#child = new GeneratorEntity(this.#sample, this.#shrink[0]);
                this.#index = 1;
            } else {
                // if this clues problem is not accepted
                return null;
            }
        }

        // reduction clues problem
        let numbers = this.#child.generateNext(accept);
        if (numbers == null && this.#index < this.#shrink.length) {
            this.#child = new GeneratorEntity(this.#sample, this.#shrink[this.#index]);
            this.#index++;
            numbers = this.#child.generateNext(accept);
        }
        return numbers;
    }

    // generate a problem
    #generateProblem() {
        const numbers = [];
        for (let i = 0; i < this.#sample.length; i++) {
            // get clues
            if (this.#clues[i]) {
                numbers.push(this.#sample[i]);
            } else {
                numbers.push(0);
            }
        }
        return numbers;
    }

}

// Generator class
class Generator {

    // constructor
    constructor() {
        // properties
        if (typeof ExtendedSolver == "function") {
            this.solver = new ExtendedSolver();
        } else {
            this.solver = new Solver();
        }
        this.solver.initialize();

        // events
        this.progressEvent = function (numbers, summary) { };
        this.finishEvent = function (completed) { };
        this.cancelEvent = function () { return false; };
    }

    // initialize the fields
    initialize(grids) {
        // set the grid list
        if (Array.isArray(grids)) {
            this.grids = this.shuffle(grids);
        } else {
            this.grids = [];
        }

        // generate a list of clues
        this.clues = [];
        for (let i = 0; i < 81; i++) {
            this.clues.push(false);
        }
    }

    // set clues
    setClues(count) {
        // initialize clues
        this.clues.fill(false);

        // set the center cell if the number of clues is odd
        if ((count % 2) == 1) {
            this.clues[Math.floor(this.clues.length / 2)] = true;
            count--;
        }
        count /= 2;

        // set clues in rotationally symmetric cells
        const quad = this.#getRandom(count / 2);
        this.#setQuadClues(quad);
        this.#setTwinClues(count - quad * 2);
    }

    // start generating problems
    start(logic, levels, needs) {
        // initialize the fields
        this.logic = logic;
        this.levels = levels;
        if (Array.isArray(needs)) {
            this.needs = needs;
        } else {
            this.needs = [];
        }
        this.grids = this.shuffle(this.grids);
        this.index = 0;
        this.entity = null;
        this.accept = true;

        // execute
        setTimeout(this.#execute.bind(this), 1);
    }

    // shuffle the array
    shuffle(target) {
        const before = target.concat();
        const after = [];
        while (0 < before.length) {
            // get elements randomly
            const index = this.#getRandom(before.length);
            after.push(before[index]);
            before.splice(index, 1);
        }
        return after;
    }

    // set clues for 4-fold rotational symmetry
    #setQuadClues(count) {
        // get the operation target positions
        const target = [];
        for (let i = 0; i < 4; i++) {
            for (let j = i; j < 8 - i; j++) {
                target.push({ "row": i, "col": j });
            }
        }

        // set random positions as clues
        const positions = this.shuffle(target);
        count = Math.min(count, positions.length);
        for (let i = 0; i < count; i++) {
            const pos = positions[i];
            this.clues[pos.row * 9 + pos.col] = true;
            this.clues[(8 - pos.row) + pos.col * 9] = true;
            this.clues[pos.row + (8 - pos.col) * 9] = true;
            this.clues[(8 - pos.row) * 9 + (8 - pos.col)] = true;
        }
    }

    // set clues for 2-fold rotational symmetry
    #setTwinClues(count) {
        // get indexes of cells for which no clues have been obtained yet
        const target = [];
        const half = Math.floor(this.clues.length / 2);
        for (let i = 0; i < half; i++) {
            if (!this.clues[i]) {
                target.push(i);
            }
        }

        // set random positions as clues
        const indexes = this.shuffle(target);
        const max = this.clues.length - 1;
        count = Math.min(count, indexes.length);
        for (let i = 0; i < count; i++) {
            const index = indexes[i];
            this.clues[index] = true;
            this.clues[max - index] = true;
        }
    }

    // execute generation
    #execute() {
        // check fields
        if (this.grids.length <= this.index) {
            this.finishEvent(true);
            return;
        }

        // generate a problem
        if (this.entity == null) {
            this.entity = this.#getEntity();
        }
        let numbers = this.entity.generateNext(this.accept);
        if (numbers == null) {
            this.entity = this.#getEntity();
            numbers = this.entity.generateNext(this.accept);
        }
        this.logic.setSolidList(numbers);
        this.logic.setNumberList([]);
        this.logic.setupCandidates();

        // generate a solution
        const result = this.solver.solve(this.logic, this.levels);
        if (result.solutions.length == 1) {
            // if there is only one solution
            let valid = true;
            let i = 0;
            while (valid && i < this.needs.length) {
                if (this.needs[i] && result.summary[i] === 0) {
                    valid = false;
                }
                i++;
            }
            if (valid) {
                // if all required methods are used
                this.progressEvent(numbers, result.summary);
                this.entity = null;
            } else {
                // if at least one required method is not used
                this.progressEvent(null, []);
                this.accept = true;
            }
        } else {
            // if there is no one solution
            this.progressEvent(null, []);
            this.accept = false;
        }

        // check for cancellations
        if (this.cancelEvent()) {
            this.finishEvent(false);
            return;
        }

        // execute more
        setTimeout(this.#execute.bind(this), 1);
    }

    // get the next generator entity
    #getEntity() {
        // get the next grid
        const next = this.grids[this.index];
        const entity = new GeneratorEntity(next, this.clues);

        // update index
        this.index++;
        return entity;
    }

    // generate integer random numbers
    #getRandom(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

}

