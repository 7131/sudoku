// Logical board prototype update
if (typeof LogicalBoard === "function") {

    LogicalBoard.prototype = Object.create(LogicalBoard.prototype, {

        // decide the number
        "decideNumber": { "value": function(index, value) {
            // check arguments
            if (index < 0 || this._cells.length <= index || !Numbers.isValid(value)) {
                return;
            }

            // decide the number in the specified cell
            let cell = this._cells[index];
            cell.value = value;
            cell.candidate.clear();

            // remove candidates from the same group
            const action = function(elem) { return elem.candidate.remove(value); };
            this.getRowCells(cell.row).forEach(action);
            this.getColCells(cell.col).forEach(action);
            this.getBlockCells(cell.block).forEach(action);

            // remove collisions from the same group
            let row = this.getRowCells(cell.row);
            let col = this.getColCells(cell.col);
            let block = this.getBlockCells(cell.block);
            let pos = (cell.row % 3) * 3 + (cell.col % 3);
            for (let i = 0; i < 9; i++) {
                row[i].candidate.remove((value + cell.col + 8 - i) % 9 + 1);
                col[i].candidate.remove((value + cell.row + 8 - i) % 9 + 1);
                block[i].candidate.remove((value + pos + 8 - i) % 9 + 1);
            }
        }},

        // get a list of incorrect indexes
        "getIncorrectIndexes": { "value": function() {
            // check for duplicate numbers
            let indexes = [];
            for (let i = 0; i < 9; i++) {
                Array.prototype.push.apply(indexes, this._getDuplicates(this._rows[i]));
                Array.prototype.push.apply(indexes, this._getDuplicates(this._cols[i]));
                Array.prototype.push.apply(indexes, this._getDuplicates(this._blocks[i]));
            }

            // check if they are siteswaps
            for (let i = 0; i < 9; i++) {
                Array.prototype.push.apply(indexes, this._getCollisions(this._rows[i]));
                Array.prototype.push.apply(indexes, this._getCollisions(this._cols[i]));
                Array.prototype.push.apply(indexes, this._getCollisions(this._blocks[i]));
            }

            // remove duplicate indexes
            const finder = function(elem, idx, self) { return self.indexOf(elem) == idx; };
            return indexes.filter(finder);
        }},

        // get a list of collision indexes
        "_getCollisions": { "value": function(group) {
            // get a list of drop points for each number
            let numbers = [];
            for (let i = 0; i < group.length; i++) {
                let index = group[i];

                // solid value or numerical value
                let value = this._cells[index].solid;
                if (!Numbers.isValid(value)) {
                    value = this._cells[index].value;
                }
                if (Numbers.isValid(value)) {
                    let drop = (value + i) % 9;
                    if (!Array.isArray(numbers[drop])) {
                        numbers[drop] = [];
                    }
                    numbers[drop].push(index);
                }
            }

            // check if there was a collision
            let collisions = [];
            for (let i = 0; i < 9; i++) {
                let indexes = numbers[i];
                if (Array.isArray(indexes) && 1 < indexes.length) {
                    for (let j = 0; j < indexes.length; j++) {
                        // exclude solid values
                        let index = indexes[j];
                        if (!this.isSolid(index)) {
                            collisions.push(index);
                        }
                    }
                }
            }
            return collisions;
        }},

    });

}

// Solver prototype update
if (typeof Solver === "function") {

    // Siteswap twin method class
    const SiteswapTwinMethod = function() {
        SolverMethod.call(this);
    }

    // Siteswap twin method prototype
    SiteswapTwinMethod.prototype = Object.create(SolverMethod.prototype, {

        // create a solution
        "_createSolutions": { "value": function(logic) {
            let cells = logic.getAllCells();
            for (let i = 0; i < cells.length; i++) {
                // process all cells in order
                let cell = cells[i];
                if (cell.candidate.length == 2) {
                    let min = cell.candidate.getNumber(0);
                    let max = cell.candidate.getNumber(1);

                    // rows and columns
                    this._reduceOutofTwin(logic.getRowCells(cell.row), cell.col, min, max);
                    this._reduceOutofTwin(logic.getColCells(cell.col), cell.row, min, max);

                    // blocks
                    let block = logic.getBlockCells(cell.block);
                    let index = block.indexOf(cell);
                    this._reduceOutofTwin(block, index, min, max);
                }
            }
            return [];
        }},

        // reduce candidates from other than the twin cells
        "_reduceOutofTwin": { "value": function(group, index, min, max) {
            let distance = max - min;
            group[(index + distance) % 9].candidate.remove(min);
            group[(index + 9 - distance) % 9].candidate.remove(max);
        }},

    });

    // Siteswap triplet method class
    const SiteswapTripletMethod = function() {
        SolverMethod.call(this);
    }

    // Siteswap triplet method prototype
    SiteswapTripletMethod.prototype = Object.create(SolverMethod.prototype, {

        // create a solution
        "_createSolutions": { "value": function(logic) {
            let numbers = new CandidateArray();
            for (let i = 0; i < 9; i++) {
                // blocks
                let group = logic.getBlockCells(i);
                for (let j = 0; j < group.length; j++) {
                    let candidate = group[j].candidate.getArray();
                    if (candidate.length == 3) {
                        // get the distance for each triplet
                        let values = [];
                        values.push(candidate[1] - candidate[0]);
                        values.push(candidate[2] - candidate[1]);
                        values.push(candidate[0] - candidate[2] + 9);
                        numbers.setArray(values);
                        if (numbers.areSame([ 1, 2, 6 ])) {
                            this._reduceOutofTriplet(group, j, candidate, values, 1);
                        } else if (numbers.areSame([ 2, 4, 3 ])) {
                            this._reduceOutofTriplet(group, j, candidate, values, 2);
                        }
                    }
                }
            }
            return [];
        }},

        // reduce candidates from other than the triplet cells
        "_reduceOutofTriplet": { "value": function(group, index, candidate, values, distance) {
            // get the positional relationship between candidates
            let one = values.indexOf(distance);
            let two = values.indexOf(distance * 2);
            let tre = values.indexOf(9 - distance * 3);
            let direction = 1;
            if ((tre < two && two < one) || (two < one && one < tre) || (one < tre && tre < two)) {
                // reverse order
                direction = -1;
            }
            let target = index + direction * distance * 3;
            if (target < 0 || group.length <= target) {
                return;
            }

            // remove a candidate from target cell
            let number = candidate[one];
            if (direction < 0) {
                number = candidate[tre];
            }
            group[target].candidate.remove(number);
        }},

    });

    Solver.prototype = Object.create(Solver.prototype, {

        // initialize the fields
        "initialize": { "value": function() {
            // set the methods
            this._methods.push(new OneCandidateMethod());
            this._methods.push(new OneCellMethod());
            this._methods.push(new SharedCellMethod());
            this._methods.push(new TwinMethod());
            this._methods.push(new SiteswapTwinMethod());
            this._methods.push(new TripletMethod());
            this._methods.push(new SiteswapTripletMethod());
            this._methods.push(new XWingMethod());
            this._methods.push(new AriadneMethod());
            this._methods.push(new AriadneMethod());
            for (let i = 0; i < this._methods.length; i++) {
                this._methods[i].depth = i;
            }
        }},

    });

}

