// Solver method class
const SolverMethod = function() {
    // fields
    this.lower = null;
    this.depth = 0;
}

// Solver method prototype
SolverMethod.prototype = {

    // reduce candidates
    "reduce": function(logic) {
        let solutions = [];
        let progress = [];
        let before = 730;
        let after = logic.getCandidateCount();
        while (0 < after && after < before) {
            // reduce at the lower level
            if (this.lower != null) {
                let state = this.lower.reduce(logic);
                Array.prototype.push.apply(progress, state.progress);
                Array.prototype.push.apply(solutions, state.solutions);
                after = logic.getCandidateCount();
                if (after == 0) {
                    break;
                }
            }

            // reduce at this level
            Array.prototype.push.apply(solutions, this._createSolutions(logic));
            before = after;
            after = logic.getCandidateCount();
            if (after < before) {
                progress.push({ "depth": this.depth, "table": logic.getCurrentStatus() });
            }
        }

        // if there are multiple solutions
        if (1 < solutions.length) {
            let represent = [ solutions[0] ];
            for (let i = 1; i < solutions.length; i++) {
                // combine the same solutions into one
                let solution = solutions[i];
                const finder = function(elem) { return elem.areSame(solution); };
                if (!represent.some(finder)) {
                    represent.push(solution);
                }
            }
            solutions = represent;
        }
        return { "progress": progress, "solutions": solutions };
    },

    // create a solution (template method)
    "_createSolutions": function(logic) {
    },

}

// Unique candidate method class
const OneCandidateMethod = function() {
    SolverMethod.call(this);
}

// Unique candidate method prototype
OneCandidateMethod.prototype = Object.create(SolverMethod.prototype, {

    // create a solution
    "_createSolutions": { "value": function(logic) {
        let candidates = logic.getCandidateList();
        for (let i = 0; i < candidates.length; i++) {
            let candidate = candidates[i];
            if (candidate.length == 1) {
                // if there is only one candidate, decide it
                logic.decideNumber(i, candidate.getNumber(0));
            }
        }

        // check if finished
        if (logic.isFixed()) {
            return [ logic ];
        } else {
            return [];
        }
    }},

});

// Unique cell method class
const OneCellMethod = function() {
    SolverMethod.call(this);
}

// Unique cell method prototype
OneCellMethod.prototype = Object.create(SolverMethod.prototype, {

    // create a solution
    "_createSolutions": { "value": function(logic) {
        for (let i = 0; i < 9; i++) {
            // process by row, column, and block
            this._reduceInGroup(logic, logic.getRowCells(i));
            this._reduceInGroup(logic, logic.getColCells(i));
            this._reduceInGroup(logic, logic.getBlockCells(i));
        }

        // check if finished
        if (logic.isFixed()) {
            return [ logic ];
        } else {
            return [];
        }
    }},

    // reduce the candidates in the group
    "_reduceInGroup": { "value": function(logic, group) {
        // handle the entire group
        let numbers = [];
        for (let i = 0; i < group.length; i++) {
            let candidate = group[i].candidate;
            for (let j = 0; j < candidate.length; j++) {
                let number = candidate.getNumber(j);
                if (number in numbers) {
                    // if it already exists
                    numbers[number] = null;
                } else {
                    // if it doesn't exist yet
                    numbers[number] = group[i];
                }
            }
        }

        // candidates with only one cell that can enter are decided by that cell
        for (let i = 0; i < Numbers.all.length; i++) {
            let cell = numbers[Numbers.all[i]];
            if (cell != null) {
                let index = logic.getIndex(cell.row, cell.col);
                logic.decideNumber(index, Numbers.all[i]);
            }
        }
    }},

});

// Shared cells method class
const SharedCellMethod = function() {
    SolverMethod.call(this);
}

// Shared cells method prototype
SharedCellMethod.prototype = Object.create(SolverMethod.prototype, {

    // create a solution
    "_createSolutions": { "value": function(logic) {
        // check the intersection of blocks and rows / columns
        for (let i = 0; i < 9; i++) {
            let block = logic.getBlockCells(i);
            for (let j = 0; j < 9; j += 4) {
                // rows
                let row = logic.getRowCells(block[j].row);
                this._reduceOutofIntersection(logic, block, row);

                // columns
                let col = logic.getColCells(block[j].col);
                this._reduceOutofIntersection(logic, block, col);
            }
        }
        return [];
    }},

    // reduce candidates from other than the shared cells
    "_reduceOutofIntersection": { "value": function(logic, block, group) {
        // get the intersection
        let share = [];
        let candidate = new CandidateArray();
        for (let i = 0; i < group.length; i++) {
            let cell = group[i];
            if (cell.block == block[0].block) {
                share.push(cell);
                candidate.add(cell.candidate);
            }
        }

        // process for each candidate value
        for (let i = 0; i < candidate.length; i++) {
            let value = candidate.getNumber(i);
            const finder = function(elem) { return share.indexOf(elem) < 0 && elem.candidate.has(value); };

            // block side
            if (!block.some(finder)) {
                let remain = group.filter(finder);
                for (let j = 0; j < remain.length; j++) {
                    remain[j].candidate.remove(value);
                }
            }

            // other group side
            if (!group.some(finder)) {
                let remain = block.filter(finder);
                for (let j = 0; j < remain.length; j++) {
                    remain[j].candidate.remove(value);
                }
            }
        }
    }},

});

// Twin method class
const TwinMethod = function() {
    SolverMethod.call(this);
}

// Twin method prototype
TwinMethod.prototype = Object.create(SolverMethod.prototype, {

    // create a solution
    "_createSolutions": { "value": function(logic) {
        for (let i = 0; i < 9; i++) {
            // rows
            let row = logic.getRowCells(i);
            this._reduceInTwin(row);
            this._reduceOutofTwin(row);

            // columns
            let col = logic.getColCells(i);
            this._reduceInTwin(col);
            this._reduceOutofTwin(col);

            // blocks
            let block = logic.getBlockCells(i);
            this._reduceInTwin(block);
            this._reduceOutofTwin(block);
        }
        return [];
    }},

    // reduce candidates in the twin cells
    "_reduceInTwin": { "value": function(group) {
        // handle the entire group
        let numbers = [];
        for (let i = 0; i < Numbers.all.length; i++) {
            let number = Numbers.all[i];
            const finder = function(elem) { return elem.candidate.has(number); };
            let cells = group.filter(finder);
            if (cells.length == 2) {
                numbers.push({ "value": number, "cells": cells });
            }
        }

        // check two cells at a time
        while (2 <= numbers.length) {
            let first = numbers.shift();
            const finder = function(elem) { return elem.cells[0] == first.cells[0] && elem.cells[1] == first.cells[1]; };
            let match = numbers.filter(finder);
            if (0 < match.length) {
                let second = match[0];
                numbers.splice(numbers.indexOf(second), 1);

                // reduce candidates
                let values = [ first.value, second.value ];
                for (let i = 0; i < first.cells.length; i++) {
                    first.cells[i].candidate.refine(values);
                }
            }
        }
    }},

    // reduce candidates from other than the twin cells
    "_reduceOutofTwin": { "value": function(group) {
        // handle the entire group
        let cells = [];
        for (let i = 0; i < group.length; i++) {
            if (group[i].candidate.length == 2) {
                cells.push(group[i]);
            }
        }

        // check two cells at a time
        while (2 <= cells.length) {
            let first = cells.shift();
            const finder = function(elem) { return elem.candidate.areSame(first.candidate); };
            let match = cells.filter(finder);
            if (0 < match.length) {
                let second = match[0];
                cells.splice(cells.indexOf(second), 1);

                // reduce candidates
                for (let i = 0; i < group.length; i++) {
                    let cell = group[i];
                    if (cell != first && cell != second) {
                        cell.candidate.remove(first.candidate);
                    }
                }
            }
        }
    }},

});

// Triplet method class
const TripletMethod = function() {
    SolverMethod.call(this);
}

// Triplet method prototype
TripletMethod.prototype = Object.create(SolverMethod.prototype, {

    // create a solution
    "_createSolutions": { "value": function(logic) {
        for (let i = 0; i < 9; i++) {
            // rows
            let row = logic.getRowCells(i);
            this._reduceInTriplet(row);
            this._reduceOutofTriplet(row);

            // columns
            let col = logic.getColCells(i);
            this._reduceInTriplet(col);
            this._reduceOutofTriplet(col);

            // blocks
            let block = logic.getBlockCells(i);
            this._reduceInTriplet(block);
            this._reduceOutofTriplet(block);
        }
        return [];
    }},

    // reduce candidates in the triplet cells
    "_reduceInTriplet": { "value": function(group) {
        // handle the entire group
        let numbers = [];
        for (let i = 0; i < Numbers.all.length; i++) {
            let number = Numbers.all[i];
            const finder = function(elem) { return elem.candidate.has(number); };
            let cells = group.filter(finder);
            if (2 <= cells.length && cells.length <= 3) {
                numbers.push({ "value": number, "cells": cells });
            }
        }

        // check tree cells at a time
        while (3 <= numbers.length) {
            let first = numbers.shift();
            let second = null;
            let third = null;
            let all = [];
            let i = 0;
            while (third == null && i < numbers.length - 1) {
                second = numbers[i];
                let union = this._unionArray(first.cells, second.cells);
                if (union.length <= 3) {
                    let j = i + 1;
                    while (third == null && j < numbers.length) {
                        all = this._unionArray(union, numbers[j].cells);
                        if (all.length == 3) {
                            third = numbers[j];
                            numbers.splice(j, 1);
                            numbers.splice(i, 1);
                        }
                        j++;
                    }
                }
                i++;
            }

            // reduce candidates
            if (third != null) {
                let values = [ first.value, second.value, third.value ];
                for (let i = 0; i < all.length; i++) {
                    all[i].candidate.refine(values);
                }
            }
        }
    }},

    // reduce candidates from other than the triplet cells
    "_reduceOutofTriplet": { "value": function(group) {
        // handle the entire group
        let cells = [];
        for (let i = 0; i < group.length; i++) {
            let length = group[i].candidate.length;
            if (2 <= length && length <= 3) {
                cells.push(group[i]);
            }
        }

        // check tree cells at a time
        while (3 <= cells.length) {
            let first = cells.shift();
            let second = null;
            let third = null;
            let all = new CandidateArray();
            let union = new CandidateArray();
            let i = 0;
            while (third == null && i < cells.length - 1) {
                second = cells[i];
                union.setArray(first.candidate);
                union.add(second.candidate);
                if (union.length <= 3) {
                    let j = i + 1;
                    while (third == null && j < cells.length) {
                        all.setArray(union);
                        all.add(cells[j].candidate);
                        if (all.length == 3) {
                            third = cells[j];
                            cells.splice(j, 1);
                            cells.splice(i, 1);
                        }
                        j++;
                    }
                }
                i++;
            }

            // reduce candidates
            if (third != null) {
                for (let i = 0; i < group.length; i++) {
                    let cell = group[i];
                    if (cell != first && cell != second && cell != third) {
                        cell.candidate.remove(all);
                    }
                }
            }
        }
    }},

    // get the union of arrays
    "_unionArray": { "value": function(first, second) {
        let all = first.concat(second);
        const finder = function(elem, idx, self) { return self.indexOf(elem) == idx; };
        return all.filter(finder);
    }},

});

// X-Wing method class
const XWingMethod = function() {
    SolverMethod.call(this);
}

// X-Wing method prototype
XWingMethod.prototype = Object.create(SolverMethod.prototype, {

    // create a solution
    "_createSolutions": { "value": function(logic) {
        // rows
        for (let top = 0; top < 8; top++) {
            for (let bottom = top + 1; bottom < 9; bottom++) {

                // columns
                for (let left = 0; left < 8; left++) {
                    for (let right = left + 1; right < 9; right++) {
                        this._reduceOutofIntersection(logic, top, bottom, left, right);
                    }
                }
            }
        }
        return [];
    }},

    // reduce candidates from other than the shared cells
    "_reduceOutofIntersection": { "value": function(logic, top, bottom, left, right) {
        // get rows, columns, and their intersections
        let trow = logic.getRowCells(top);
        let brow = logic.getRowCells(bottom);
        let lcol = logic.getColCells(left);
        let rcol = logic.getColCells(right);
        let tl = trow[left];
        let tr = trow[right];
        let bl = brow[left];
        let br = brow[right];
        if (tl.block == br.block) {
            // exit if all cells at the intersection are in the same block
            return;
        }

        // get a list of candidates that exist at all four intersections
        let all = new CandidateArray();
        all.add(tl.candidate);
        all.refine(tr.candidate);
        all.refine(bl.candidate);
        all.refine(br.candidate);
        for (let i = 0; i < all.length; i++) {
            // reduce by row
            let value = all.getNumber(i);
            const rfinder = function(elem) { return elem.col == left || elem.col == right || !elem.candidate.has(value); };
            if (trow.every(rfinder) && brow.every(rfinder)) {
                for (let j = 0; j < 9; j++) {
                    if (j != top && j != bottom) {
                        lcol[j].candidate.remove(value);
                        rcol[j].candidate.remove(value);
                    }
                }
            }

            // reduce by column
            const cfinder = function(elem) { return elem.row == top || elem.row == bottom || !elem.candidate.has(value); };
            if (lcol.every(cfinder) && rcol.every(cfinder)) {
                for (let j = 0; j < 9; j++) {
                    if (j != left && j != right) {
                        trow[j].candidate.remove(value);
                        brow[j].candidate.remove(value);
                    }
                }
            }
        }
    }},

});

// Ariadne method class
const AriadneMethod = function() {
    SolverMethod.call(this);
}

// Ariadne method prototype
AriadneMethod.prototype = Object.create(SolverMethod.prototype, {

    // create a solution
    "_createSolutions": { "value": function(logic) {
        let solutions = [];
        let candidates = logic.getCandidateList();
        for (let i = 0; i < candidates.length; i++) {
            if (1 < candidates[i].length) {
                let complete = this._removeImpossibleCandidate(logic, candidates, i);
                Array.prototype.push.apply(solutions, complete);
            }
        }
        return solutions;
    }},

    // remove impossible candidates
    "_removeImpossibleCandidate": { "value": function(logic, candidates, index) {
        // check the target cell
        let candidate = candidates[index];
        let valids = [];
        let copies = [];
        let complete = [];
        for (let i = 0; i < candidate.length; i++) {
            // assume candidate numbers one by one
            let value = candidate.getNumber(i);
            let copy = logic.copy();
            copy.decideNumber(index, value);
            if (this.lower != null) {
                this.lower.reduce(copy);
            }

            // check the resulting board
            if (this._isValidBoard(copy)) {
                // save the board if appropriate
                valids.push(value);
                copies.push(copy);
                if (copy.isFixed()) {
                    complete.push(copy);
                }
            }
        }
        if (valids.length < candidate.length) {
            // reduce inconsistent candidates
            candidate.refine(valids);
        }

        // check cells other than the target cell
        let all = new CandidateArray();
        let numbers = logic.getNumberList();
        for (let i = 0; i < numbers.length; i++) {
            if (i != index && !Numbers.isValid(numbers[i])) {
                all.clear();
                for (let j = 0; j < copies.length; j++) {
                    let copy = copies[j];
                    let value = copy.getNumber(i);
                    if (Numbers.isValid(value)) {
                        all.add(value);
                    } else {
                        all.add(copy.getCandidate(i));
                    }
                }

                // remove numbers that do not apply to any candidate in the target cell
                candidates[i].refine(all);
            }
        }
        return complete;
    }},

    // whether the current board is valid
    "_isValidBoard": { "value": function(logic) {
        // check for duplicates
        let incorrect = logic.getIncorrectIndexes();
        if (0 < incorrect.length) {
            return false;
        }

        // check there are cells that have no candidates and have not been decided
        for (let i = 0; i < logic.length; i++) {
            if (!logic.hasCandidate(i) && !logic.isSolid(i) && !logic.isNumber(i)) {
                return false;
            }
        }
        return true;
    }},

});

// Solver class
const Solver = function() {
    this._methods = [];
}

// Solver prototype
Solver.prototype = {

    // initialize the fields
    "initialize": function() {
        // set the methods
        this._methods.push(new OneCandidateMethod());
        this._methods.push(new OneCellMethod());
        this._methods.push(new SharedCellMethod());
        this._methods.push(new TwinMethod());
        this._methods.push(new TripletMethod());
        this._methods.push(new XWingMethod());
        this._methods.push(new AriadneMethod());
        this._methods.push(new AriadneMethod());
        for (let i = 0; i < this._methods.length; i++) {
            this._methods[i].depth = i;
        }
    },

    // solve the problem using the specified level of method
    "solve": function(logic, levels) {
        // check arguments
        if (logic == null) {
            return null;
        }
        if (!Array.isArray(levels)) {
            levels = [];
            for (let i = 0; i < this._methods.length; i++) {
                levels.push(true);
            }
        }

        // set the method to use
        let method = null;
        for (let i = 0; i < this._methods.length; i++) {
            let current = this._methods[i];
            if (i < levels.length && levels[i]) {
                current.lower = method;
                method = current;
            }
        }
        if (method == null) {
            return null;
        }

        // call the method
        let result = method.reduce(logic);

        // get the solutions
        if (result.solutions.length == 0 && logic.isFixed()) {
            // if it was completed from the beginning
            let incorrect = logic.getIncorrectIndexes();
            if (incorrect.length == 0) {
                result.solutions.push(logic);
            }
        }
        if (result.solutions.length == 1 && !logic.isFixed()) {
            // if the Ariadne's thread happens to find only one solution
            result.solutions = [];
        }
        const selector = function(elem) { return elem.getCurrentStatus(); };
        result.solutions = result.solutions.map(selector);

        // get the number of times used for each method
        let counts = [];
        for (let i = 0; i < levels.length; i++) {
            if (levels[i]) {
                counts.push(0);
            } else {
                counts.push("-");
            }
        }
        for (let i = 0; i < result.progress.length; i++) {
            counts[result.progress[i].depth]++;
        }
        result.summary = counts;
        return result;
    },

}
