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
            const act = elem => elem.candidate.remove(value);
            this.getRowCells(cell.row).forEach(act);
            this.getColCells(cell.col).forEach(act);
            this.getBlockCells(cell.block).forEach(act);

            // remove collisions from the same group
            const row = this.getRowCells(cell.row);
            const col = this.getColCells(cell.col);
            const block = this.getBlockCells(cell.block);
            const pos = (cell.row % 3) * 3 + (cell.col % 3);
            for (let i = 0; i < 9; i++) {
                row[i].candidate.remove((value + cell.col + 8 - i) % 9 + 1);
                col[i].candidate.remove((value + cell.row + 8 - i) % 9 + 1);
                block[i].candidate.remove((value + pos + 8 - i) % 9 + 1);
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
                Array.prototype.push.apply(indexes, this._getCollisions(this._blocks[i]));
            }

            // remove duplicate indexes
            return indexes.filter((elem, idx, self) => self.indexOf(elem) == idx);
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
                    for (const index of indexes) {
                        // exclude solid values
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
            for (const cell of cells) {
                // process all cells in order
                if (cell.candidate.length == 2) {
                    const min = cell.candidate.getNumber(0);
                    const max = cell.candidate.getNumber(1);

                    // rows and columns
                    this._reduceSingleTwin(logic.getRowCells(cell.row), cell.col, min, max);
                    this._reduceSingleTwin(logic.getColCells(cell.col), cell.row, min, max);

                    // blocks
                    const block = logic.getBlockCells(cell.block);
                    const index = block.indexOf(cell);
                    this._reduceSingleTwin(block, index, min, max);
                }
            }

            // 2 cells
            for (let i = 0; i < 9; i++) {
                this._reduceDoubleTwin(logic.getRowCells(i));
                this._reduceDoubleTwin(logic.getColCells(i));
                this._reduceDoubleTwin(logic.getBlockCells(i));
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
            const cells = group.filter(elem => elem.candidate.length == 2);

            // check two cells at a time
            while (2 <= cells.length) {
                // 1st cell
                const cell1 = cells.shift();
                const min1 = cell1.candidate.getNumber(0);
                const max1 = cell1.candidate.getNumber(1);
                const index1 = group.indexOf(cell1);
                for (const cell2 of cells) {
                    // 2nd cell
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

    // Siteswap triplet method class
    const SiteswapTripletMethod = function() {
        SolverMethod.call(this);
    }

    // Siteswap triplet method prototype
    SiteswapTripletMethod.prototype = Object.create(SolverMethod.prototype, {

        // create a solution
        "_createSolutions": { "value": function(logic) {
            const numbers = new CandidateArray();
            for (let i = 0; i < 9; i++) {
                // blocks
                const group = logic.getBlockCells(i);
                for (let j = 0; j < group.length; j++) {
                    const candidate = group[j].candidate.getArray();
                    if (candidate.length == 3) {
                        // get the distance for each triplet
                        const values = [];
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
            const one = values.indexOf(distance);
            const two = values.indexOf(distance * 2);
            const tre = values.indexOf(9 - distance * 3);
            let direction = 1;
            if ((tre < two && two < one) || (two < one && one < tre) || (one < tre && tre < two)) {
                // reverse order
                direction = -1;
            }
            const target = index + direction * distance * 3;
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

