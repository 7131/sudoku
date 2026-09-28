let ExtendedGenerator;

if (typeof Generator == "function") {

    // Extended generator class
    ExtendedGenerator = class extends Generator {
        #table;
        #row = 0;
        #col = 0;

        // initialize the fields
        initialize(grids) {
            // set the grid list
            if (Array.isArray(grids)) {
                this.grids = super.shuffle(grids);
            } else {
                this.grids = [];
            }

            // generate a list of clues
            this.clues = new Array(81).fill(false);

            // generate a replacement table
            const first = this.#permutate([ 3, 4, 5 ]);
            const second = this.#permutate([ 6, 7, 8 ]);
            const normal = first.map(head => second.map(elem => head.concat(elem))).flat();
            const reverse = second.map(head => first.map(elem => head.concat(elem))).flat();
            this.#table = normal.concat(reverse);
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
            this.#table = super.shuffle(this.#table);
            this.grids = super.shuffle(this.grids);
            this.index = 0;
            this.#row = 0;
            this.#col = 0;
            this.entity = null;
            this.accept = true;

            // execute
            setTimeout(this.#execute.bind(this), 1);
        }

        // permutate the array
        #permutate(values) {
            // check arguments
            if (values.length <= 1) {
                return [ values.concat() ];
            }

            // recursive processing
            let result = [];
            for (let i = 0; i < values.length; i++) {
                const follow = values.concat();
                const first = follow.splice(i, 1);

                // permutate an array with one less element
                const parts = this.#permutate(follow);
                result = result.concat(parts.map(elem => first.concat(elem)));
            }
            return result;
        }

        // execute generation
        #execute() {
            // check fields
            if (this.#table.length <= this.#col) {
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
                    this.progressEvent(this.#changeNumbers(numbers), result.summary);
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

        // get the next generation entity
        #getEntity() {
            // replace the standard grid
            const grid = this.grids[this.index];
            const conv = this.#convertRow(grid, this.#row);
            const next = this.#convertCol(conv, this.#col);
            const entity = new GeneratorEntity(next, this.clues);

            // update index
            this.index++;
            if (this.grids.length <= this.index) {
                this.index = 0;
                this.#row++;
                if (this.#table.length <= this.#row) {
                    this.#row = 0;
                    this.#col++;
                }
            }
            return entity;
        }

        // convert rows
        #convertRow(sample, index) {
            let numbers = sample.slice(0, 27);
            for (const row of this.#table[index]) {
                const start = row * 9;
                numbers = numbers.concat(sample.slice(start, start + 9));
            }
            return numbers;
        }

        // convert columns
        #convertCol(sample, index) {
            let numbers = [];
            for (let i = 0; i < 9; i++) {
                const start = i * 9;
                numbers = numbers.concat(sample.slice(start, start + 3));
                numbers = numbers.concat(this.#table[index].map(elem => sample[start + elem]));
            }
            return numbers;
        }

        // change numbers
        #changeNumbers(numbers) {
            const map = [ 0 ].concat(super.shuffle(Numbers.all));
            return numbers.map(elem => map[elem]);
        }

    }

}

