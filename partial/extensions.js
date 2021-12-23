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
            const cell = this._cells[index];
            cell.value = value;
            cell.candidate.clear();

            // remove candidates from the same group
            const action = function(elem) { return elem.candidate.remove(value); };
            this.getRowCells(cell.row).forEach(action);
            this.getColCells(cell.col).forEach(action);
            this.getBlockCells(cell.block).forEach(action);

            // remove collisions from the same group
            const row = this.getRowCells(cell.row);
            const col = this.getColCells(cell.col);
            for (let i = 0; i < 9; i++) {
                row[i].candidate.remove((value + cell.col + 8 - i) % 9 + 1);
                col[i].candidate.remove((value + cell.row + 8 - i) % 9 + 1);
            }
        }},

        // get a list of incorrect indexes
        "getIncorrectIndexes": { "value": function() {
            // check for duplicate numbers
            const indexes = [];
            for (let i = 0; i < 9; i++) {
                Array.prototype.push.apply(indexes, this._getDuplicates(this._rows[i]));
                Array.prototype.push.apply(indexes, this._getDuplicates(this._cols[i]));
                Array.prototype.push.apply(indexes, this._getDuplicates(this._blocks[i]));
            }

            // check if they are siteswaps
            for (let i = 0; i < 9; i++) {
                Array.prototype.push.apply(indexes, this._getCollisions(this._rows[i]));
                Array.prototype.push.apply(indexes, this._getCollisions(this._cols[i]));
            }

            // remove duplicate indexes
            const finder = function(elem, idx, self) { return self.indexOf(elem) == idx; };
            return indexes.filter(finder);
        }},

        // get a list of collision indexes
        "_getCollisions": { "value": function(group) {
            // get a list of drop points for each number
            const numbers = [];
            for (let i = 0; i < group.length; i++) {
                const index = group[i];

                // solid value or numerical value
                let value = this._cells[index].solid;
                if (!Numbers.isValid(value)) {
                    value = this._cells[index].value;
                }
                if (Numbers.isValid(value)) {
                    const drop = (value + i) % 9;
                    if (!Array.isArray(numbers[drop])) {
                        numbers[drop] = [];
                    }
                    numbers[drop].push(index);
                }
            }

            // check if there was a collision
            const collisions = [];
            for (let i = 0; i < 9; i++) {
                const indexes = numbers[i];
                if (Array.isArray(indexes) && 1 < indexes.length) {
                    for (let j = 0; j < indexes.length; j++) {
                        // exclude solid values
                        const index = indexes[j];
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
            // 1 cell
            const cells = logic.getAllCells();
            for (let i = 0; i < cells.length; i++) {
                // process all cells in order
                const cell = cells[i];
                if (cell.candidate.length == 2) {
                    const min = cell.candidate.getNumber(0);
                    const max = cell.candidate.getNumber(1);

                    // rows and columns
                    this._reduceSingleTwin(logic.getRowCells(cell.row), cell.col, min, max);
                    this._reduceSingleTwin(logic.getColCells(cell.col), cell.row, min, max);
                }
            }

            // 2 cells
            for (let i = 0; i < 9; i++) {
                this._reduceDoubleTwin(logic.getRowCells(i));
                this._reduceDoubleTwin(logic.getColCells(i));
            }
            return [];
        }},

        // reduce candidates from the other cells based on the value in the twin cell
        "_reduceSingleTwin": { "value": function(group, index, min, max) {
            const distance = max - min;
            group[(index + distance) % 9].candidate.remove(min);
            group[(index + 9 - distance) % 9].candidate.remove(max);
        }},

        // reduce candidates from the other cells based on the values in the two cells
        "_reduceDoubleTwin": { "value": function(group) {
            // handle the entire group
            const cells = [];
            for (let i = 0; i < group.length; i++) {
                if (group[i].candidate.length == 2) {
                    cells.push(group[i]);
                }
            }

            // check two cells at a time
            while (2 <= cells.length) {
                // 1st cell
                const cell1 = cells.shift();
                const min1 = cell1.candidate.getNumber(0);
                const max1 = cell1.candidate.getNumber(1);
                const index1 = group.indexOf(cell1);
                for (let i = 0; i < cells.length; i++) {
                    // 2nd cell
                    const cell2 = cells[i];
                    const min2 = cell2.candidate.getNumber(0);
                    const max2 = cell2.candidate.getNumber(1);
                    const index2 = group.indexOf(cell2);

                    // get the distances
                    const distance = index2 - index1;
                    const min1min2 = (min1 - min2 + 9) % 9;
                    const min1max2 = (min1 - max2 + 9) % 9;
                    const max1min2 = (max1 - min2 + 9) % 9;
                    const max1max2 = (max1 - max2 + 9) % 9;
                    if ((min1 == min2 && max1max2 == distance) || (min1 == max2 && max1min2 == distance)) {
                        this._reduceSameNumber(group, index1, index2, min1);
                        this._reduceDescending(group, index1, index2, max1);
                    } else if ((max1 == min2 && min1max2 == distance) || (max1 == max2 && min1min2 == distance)) {
                        this._reduceSameNumber(group, index1, index2, max1);
                        this._reduceDescending(group, index1, index2, min1);
                    } else if ((min1min2 == distance && max1max2 == distance) || (min1max2 == distance && max1min2 == distance)) {
                        this._reduceDescending(group, index1, index2, min1);
                        this._reduceDescending(group, index1, index2, max1);
                    }
                }
            }
        }},

        // reduce candidates with the same number
        "_reduceSameNumber": { "value": function(group, index1, index2, number) {
            for (let i = 0; i < group.length; i++) {
                if (i != index1 && i != index2) {
                    group[i].candidate.remove(number);
                }
            }
        }},

        // reduce candidates while descending numbers
        "_reduceDescending": { "value": function(group, index1, index2, number1) {
            for (let i = 0; i < group.length; i++) {
                if (i != index1 && i != index2) {
                    const number = (index1 - i + number1 + 8) % 9 + 1;
                    group[i].candidate.remove(number);
                }
            }
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
            this._methods.push(new XWingMethod());
            this._methods.push(new AriadneMethod());
            this._methods.push(new AriadneMethod());
            for (let i = 0; i < this._methods.length; i++) {
                this._methods[i].depth = i;
            }
        }},

    });

}

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
            this._clues = [];
            for (let i = 0; i < 81; i++) {
                this._clues.push(false);
            }

            // create a replacement table
            this._table = [
                [ 0, 3, 6 ],
                [ 3, 6, 0 ],
                [ 6, 0, 3 ],
            ];
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

        // execute problem creation
        "_execute": { "value": function() {
            // check fields
            if (this._table.length <= this._row) {
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
        }},

        // get the next creation entity
        "_getEntity": { "value": function() {
            // replace the standard grid
            let next = this._grids[this._index];
            next = this._convertRow(next, this._row);
            next = this._convertCol(next, this._col);
            const entity = new CreatorEntity(next, this._clues);

            // update index
            this._index++;
            if (this._grids.length <= this._index) {
                this._index = 0;
                this._col++;
                if (this._table.length <= this._col) {
                    this._col = 0;
                    this._row++;
                }
            }
            return entity;
        }},

        // convert rows
        "_convertRow": { "value": function(sample, index) {
            const map = this._table[index];
            const numbers = [];
            for (let i = 0; i < map.length; i++) {
                const start = map[i] * 9;
                Array.prototype.push.apply(numbers, sample.slice(start, start + 27));
            }
            return numbers;
        }},

        // convert columns
        "_convertCol": { "value": function(sample, index) {
            const map = this._table[index];
            const numbers = [];
            for (let i = 0; i < 81; i += 9) {
                for (let j = 0; j < map.length; j++) {
                    const start = i + map[j];
                    Array.prototype.push.apply(numbers, sample.slice(start, start + 3));
                }
            }
            return numbers;
        }},

    });

}

