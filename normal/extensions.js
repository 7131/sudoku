// Creator prototype update
if (typeof Creator === "function") {

    Creator.prototype = Object.create(Creator.prototype, {

        // initialize the fields
        "initialize": { "value": function(grids) {
            // set the grid list
            if (Array.isArray(grids)) {
                this._grids = this._shuffle(grids);
            } else {
                this._grids = [];
            }

            // create a list of clues
            this._clues = new Array(81).fill(false);

            // create a replacement table
            const first = this._permutate([ 3, 4, 5 ]);
            const second = this._permutate([ 6, 7, 8 ]);
            const normal = [];
            const reverse = [];
            for (let i = 0; i < first.length; i++) {
                for (let j = 0; j < second.length; j++) {
                    normal.push(first[i].concat(second[j]));
                    reverse.push(second[i].concat(first[j]));
                }
            }
            this._table = normal.concat(reverse);
        }},

        // start creating problems
        "start": { "value": function(logic, levels, needs) {
            // initialize the fields
            this._logic = logic;
            this._levels = levels;
            if (Array.isArray(needs)) {
                this._needs = needs;
            } else {
                this._needs = [];
            }
            this._table = this._shuffle(this._table);
            this._grids = this._shuffle(this._grids);
            this._index = 0;
            this._row = 0;
            this._col = 0;
            this._entity = null;
            this._accept = true;

            // execute
            setTimeout(this._execute.bind(this), 1);
        }},

        // permutate the array
        "_permutate": { "value": function(values) {
            // check arguments
            if (values.length <= 1) {
                return [ values.concat() ];
            }

            // recursive processing
            const result = [];
            for (let i = 0; i < values.length; i++) {
                const follow = values.concat();
                const first = follow.splice(i, 1);

                // permutate an array with one less element
                const parts = this._permutate(follow);
                for (const part of parts) {
                    result.push(first.concat(part));
                }
            }
            return result;
        }},

        // execute problem creation
        "_execute": { "value": function() {
            // check fields
            if (this._table.length <= this._col) {
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
            const result = this._solver.solve(this._logic, this._levels);
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
                    this.progressEvent(this._changeNumbers(numbers), result.summary);
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
        }},

        // get the next creation entity
        "_getEntity": { "value": function() {
            // replace the standard grid
            const grid = this._grids[this._index];
            const conv = this._convertRow(grid, this._row);
            const next = this._convertCol(conv, this._col);
            const entity = new CreatorEntity(next, this._clues);

            // update index
            this._index++;
            if (this._grids.length <= this._index) {
                this._index = 0;
                this._row++;
                if (this._table.length <= this._row) {
                    this._row = 0;
                    this._col++;
                }
            }
            return entity;
        }},

        // convert rows
        "_convertRow": { "value": function(sample, index) {
            const numbers = sample.slice(0, 27);
            for (const row of this._table[index]) {
                const start = row * 9;
                Array.prototype.push.apply(numbers, sample.slice(start, start + 9));
            }
            return numbers;
        }},

        // convert columns
        "_convertCol": { "value": function(sample, index) {
            const numbers = [];
            for (let i = 0; i < 9; i++) {
                const start = i * 9;
                Array.prototype.push.apply(numbers, sample.slice(start, start + 3));
                for (const col of this._table[index]) {
                    numbers.push(sample[start + col]);
                }
            }
            return numbers;
        }},

        // change numbers
        "_changeNumbers": { "value": function(numbers) {
            const map = [ 0 ].concat(this._shuffle(Numbers.all));
            return numbers.map(elem => map[elem]);
        }},

    });
    Creator.prototype.constructor = Creator;

}

