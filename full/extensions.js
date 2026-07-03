let ExtendedLogicalBoard, ExtendedSolver;

if (typeof LogicalBoard == "function") {

    // Extended logical board class
    ExtendedLogicalBoard = class extends LogicalBoard {

        // decide the number
        decideNumber(index, value) {
            // check arguments
            if (index < 0 || this.cells.length <= index || !Numbers.isValid(value)) {
                return;
            }

            // decide the number in the specified cell
            const cell = this.cells[index];
            cell.value = value;
            cell.candidate.clear();

            // remove candidates from the same group
            const act = elem => elem.candidate.remove(value);
            super.getRowCells(cell.row).forEach(act);
            super.getColCells(cell.col).forEach(act);
            super.getBlockCells(cell.block).forEach(act);

            // remove collisions from the same group
            const row = super.getRowCells(cell.row);
            const col = super.getColCells(cell.col);
            const block = super.getBlockCells(cell.block);
            const pos = (cell.row % 3) * 3 + (cell.col % 3);
            for (let i = 0; i < 9; i++) {
                row[i].candidate.remove((value + cell.col + 8 - i) % 9 + 1);
                col[i].candidate.remove((value + cell.row + 8 - i) % 9 + 1);
                block[i].candidate.remove((value + pos + 8 - i) % 9 + 1);
            }
        }

        // get a list of incorrect indexes
        getIncorrectIndexes() {
            // check for duplicate numbers
            const indexes = [];
            indexes.push(this.rows.map(super.getDuplicates, this));
            indexes.push(this.cols.map(super.getDuplicates, this));
            indexes.push(this.blocks.map(super.getDuplicates, this));

            // check if they are siteswaps
            indexes.push(this.rows.map(this.#getCollisions, this));
            indexes.push(this.cols.map(this.#getCollisions, this));
            indexes.push(this.blocks.map(this.#getCollisions, this));

            // remove duplicate indexes
            return indexes.flat(Infinity).filter((val, idx, arr) => arr.indexOf(val) == idx);
        }

        // get a list of collision indexes
        #getCollisions(group) {
            // get a list of drop points for each number
            const numbers = new Array(group.length).fill().map(elem => []);
            for (let i = 0; i < group.length; i++) {
                const index = group[i];

                // solid value or numerical value
                let value = this.cells[index].solid;
                if (!Numbers.isValid(value)) {
                    value = this.cells[index].value;
                }
                if (Numbers.isValid(value)) {
                    numbers[(value + i) % 9].push(index);
                }
            }

            // check if there was a collision
            const collisions = numbers.filter(elem => 1 < elem.length).map(elem => elem.filter(idx => !super.isSolid(idx)));
            return collisions.flat();
        }

    }

}

if (typeof Solver == "function") {

    // Siteswap twin method class
    class SiteswapTwinMethod extends SolverMethod {

        // create a solution
        createSolutions(logic) {
            // 1 cell
            const cells = logic.getAllCells();
            for (const cell of cells) {
                // process all cells in order
                if (cell.candidate.length == 2) {
                    const min = cell.candidate.getNumber(0);
                    const max = cell.candidate.getNumber(1);

                    // rows and columns
                    this.#reduceSingleTwin(logic.getRowCells(cell.row), cell.col, min, max);
                    this.#reduceSingleTwin(logic.getColCells(cell.col), cell.row, min, max);

                    // blocks
                    const block = logic.getBlockCells(cell.block);
                    const index = block.indexOf(cell);
                    this.#reduceSingleTwin(block, index, min, max);
                }
            }

            // 2 cells
            for (let i = 0; i < 9; i++) {
                this.#reduceDoubleTwin(logic.getRowCells(i));
                this.#reduceDoubleTwin(logic.getColCells(i));
                this.#reduceDoubleTwin(logic.getBlockCells(i));
            }
            return [];
        }

        // reduce candidates from the other cells based on the value in the twin cell
        #reduceSingleTwin(group, index, min, max) {
            const distance = max - min;
            group[(index + distance) % 9].candidate.remove(min);
            group[(index + 9 - distance) % 9].candidate.remove(max);
        }

        // reduce candidates from the other cells based on the values in the two cells
        #reduceDoubleTwin(group) {
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
                        this.#reduceSameNumber(group, index1, index2, min1);
                        this.#reduceDescending(group, index1, index2, max1);
                    } else if ((max1 == min2 && min1max2 == distance) || (max1 == max2 && min1min2 == distance)) {
                        this.#reduceSameNumber(group, index1, index2, max1);
                        this.#reduceDescending(group, index1, index2, min1);
                    } else if ((min1min2 == distance && max1max2 == distance) || (min1max2 == distance && max1min2 == distance)) {
                        this.#reduceDescending(group, index1, index2, min1);
                        this.#reduceDescending(group, index1, index2, max1);
                    }
                }
            }
        }

        // reduce candidates with the same number
        #reduceSameNumber(group, index1, index2, number) {
            group.filter((val, idx) => idx != index1 && idx != index2).forEach(elem => elem.candidate.remove(number));
        }

        // reduce candidates while descending numbers
        #reduceDescending(group, index1, index2, number1) {
            for (let i = 0; i < group.length; i++) {
                if (i != index1 && i != index2) {
                    const number = (index1 - i + number1 + 8) % 9 + 1;
                    group[i].candidate.remove(number);
                }
            }
        }

    }

    // Siteswap triplet method class
    class SiteswapTripletMethod extends SolverMethod {

        // create a solution
        createSolutions(logic) {
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
                            this.#reduceOutOfTriplet(group, j, candidate, values, 1);
                        } else if (numbers.areSame([ 2, 4, 3 ])) {
                            this.#reduceOutOfTriplet(group, j, candidate, values, 2);
                        }
                    }
                }
            }
            return [];
        }

        // reduce candidates from other than the triplet cells
        #reduceOutOfTriplet(group, index, candidate, values, distance) {
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
        }

    }

    // Extended solver class
    ExtendedSolver = class extends Solver {

        // initialize the fields
        initialize() {
            // set the methods
            this.methods.push(new OneCandidateMethod());
            this.methods.push(new OneCellMethod());
            this.methods.push(new SharedCellMethod());
            this.methods.push(new TwinMethod());
            this.methods.push(new SiteswapTwinMethod());
            this.methods.push(new TripletMethod());
            this.methods.push(new SiteswapTripletMethod());
            this.methods.push(new XWingMethod());
            this.methods.push(new AriadneMethod());
            this.methods.push(new AriadneMethod());
            this.methods.forEach((val, idx) => val.depth = idx);
        }

    }

}

