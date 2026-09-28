// Solver method class
class SolverMethod {

    // constructor
    constructor() {
        // fields
        this.lower = null;
        this.depth = 0;
    }

    // reduce candidates
    reduce(logic) {
        let progress = [];
        let solutions = [];
        let before = 730;
        let after = logic.getCandidateCount();
        while (0 < after && after < before) {
            // reduce at the lower level
            if (this.lower != null) {
                const state = this.lower.reduce(logic);
                progress = progress.concat(state.progress);
                solutions = solutions.concat(state.solutions);
                after = logic.getCandidateCount();
                if (after == 0) {
                    break;
                }
            }

            // reduce at this level
            solutions = solutions.concat(this.generateSolutions(logic));
            before = after;
            after = logic.getCandidateCount();
            if (after < before) {
                progress.push({ "depth": this.depth, "table": logic.getCurrentStatus() });
            }
        }

        // if there are multiple solutions
        if (1 < solutions.length) {
            const represent = [ solutions[0] ];
            for (let i = 1; i < solutions.length; i++) {
                // combine the same solutions into one
                const solution = solutions[i];
                if (!represent.some(elem => elem.areSame(solution))) {
                    represent.push(solution);
                }
            }
            solutions = represent;
        }
        return { "progress": progress, "solutions": solutions };
    }

    // generate a solution (template method)
    generateSolutions(logic) {
    }

}

// Unique candidate method class
class OneCandidateMethod extends SolverMethod {

    // generate a solution
    generateSolutions(logic) {
        const candidates = logic.getCandidateList();
        for (let i = 0; i < candidates.length; i++) {
            const candidate = candidates[i];
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
    }

}

// Unique cell method class
class OneCellMethod extends SolverMethod {

    // generate a solution
    generateSolutions(logic) {
        for (let i = 0; i < 9; i++) {
            // process by row, column, and block
            this.#reduceInGroup(logic, logic.getRowCells(i));
            this.#reduceInGroup(logic, logic.getColCells(i));
            this.#reduceInGroup(logic, logic.getBlockCells(i));
        }

        // check if finished
        if (logic.isFixed()) {
            return [ logic ];
        } else {
            return [];
        }
    }

    // reduce the candidates in the group
    #reduceInGroup(logic, group) {
        // handle the entire group
        const numbers = [];
        for (const cell of group) {
            const candidate = cell.candidate;
            for (let i = 0; i < candidate.length; i++) {
                const number = candidate.getNumber(i);
                if (number in numbers) {
                    // if it already exists
                    numbers[number] = null;
                } else {
                    // if it doesn't exist yet
                    numbers[number] = cell;
                }
            }
        }

        // candidates with only one cell that can enter are decided by that cell
        for (const number of Numbers.all) {
            const cell = numbers[number];
            if (cell != null) {
                const index = logic.getIndex(cell.row, cell.col);
                logic.decideNumber(index, number);
            }
        }
    }

}

// Shared cells method class
class SharedCellMethod extends SolverMethod {

    // generate a solution
    generateSolutions(logic) {
        // check the intersection of blocks and rows / columns
        for (let i = 0; i < 9; i++) {
            const block = logic.getBlockCells(i);
            for (let j = 0; j < 9; j += 4) {
                // rows
                const row = logic.getRowCells(block[j].row);
                this.#reduceOutOfIntersection(logic, block, row);

                // columns
                const col = logic.getColCells(block[j].col);
                this.#reduceOutOfIntersection(logic, block, col);
            }
        }
        return [];
    }

    // reduce candidates from other than the shared cells
    #reduceOutOfIntersection(logic, block, group) {
        // get the intersection
        const share = [];
        const candidate = new CandidateArray();
        for (const cell of group.filter(elem => elem.block == block[0].block)) {
            share.push(cell);
            candidate.add(cell.candidate);
        }

        // process for each candidate value
        for (let i = 0; i < candidate.length; i++) {
            const value = candidate.getNumber(i);
            const find = elem => share.indexOf(elem) < 0 && elem.candidate.has(value);

            // block side
            if (!block.some(find)) {
                group.filter(find).forEach(elem => elem.candidate.remove(value));
            }

            // other group side
            if (!group.some(find)) {
                block.filter(find).forEach(elem => elem.candidate.remove(value));
            }
        }
    }

}

// Twin method class
class TwinMethod extends SolverMethod {

    // generate a solution
    generateSolutions(logic) {
        for (let i = 0; i < 9; i++) {
            // rows
            const row = logic.getRowCells(i);
            this.#reduceInTwin(row);
            this.#reduceOutOfTwin(row);

            // columns
            const col = logic.getColCells(i);
            this.#reduceInTwin(col);
            this.#reduceOutOfTwin(col);

            // blocks
            const block = logic.getBlockCells(i);
            this.#reduceInTwin(block);
            this.#reduceOutOfTwin(block);
        }
        return [];
    }

    // reduce candidates in the twin cells
    #reduceInTwin(group) {
        // handle the entire group
        const numbers = [];
        for (const number of Numbers.all) {
            const cells = group.filter(elem => elem.candidate.has(number));
            if (cells.length == 2) {
                numbers.push({ "value": number, "cells": cells });
            }
        }

        // check two cells at a time
        while (2 <= numbers.length) {
            const first = numbers.shift();
            const match = numbers.filter(elem => elem.cells[0] == first.cells[0] && elem.cells[1] == first.cells[1]);
            if (0 < match.length) {
                const second = match[0];
                numbers.splice(numbers.indexOf(second), 1);

                // reduce candidates
                const values = [ first.value, second.value ];
                first.cells.forEach(elem => elem.candidate.refine(values));
            }
        }
    }

    // reduce candidates from other than the twin cells
    #reduceOutOfTwin(group) {
        // handle the entire group
        const cells = group.filter(elem => elem.candidate.length == 2);

        // check two cells at a time
        while (2 <= cells.length) {
            const first = cells.shift();
            const match = cells.filter(elem => elem.candidate.areSame(first.candidate));
            if (0 < match.length) {
                const second = match[0];
                cells.splice(cells.indexOf(second), 1);

                // reduce candidates
                group.filter(elem => elem != first && elem != second).forEach(elem => elem.candidate.remove(first.candidate));
            }
        }
    }

}

// Triplet method class
class TripletMethod extends SolverMethod {

    // generate a solution
    generateSolutions(logic) {
        for (let i = 0; i < 9; i++) {
            // rows
            const row = logic.getRowCells(i);
            this.#reduceInTriplet(row);
            this.#reduceOutOfTriplet(row);

            // columns
            const col = logic.getColCells(i);
            this.#reduceInTriplet(col);
            this.#reduceOutOfTriplet(col);

            // blocks
            const block = logic.getBlockCells(i);
            this.#reduceInTriplet(block);
            this.#reduceOutOfTriplet(block);
        }
        return [];
    }

    // reduce candidates in the triplet cells
    #reduceInTriplet(group) {
        // handle the entire group
        const numbers = [];
        for (const number of Numbers.all) {
            const cells = group.filter(elem => elem.candidate.has(number));
            if (2 <= cells.length && cells.length <= 3) {
                numbers.push({ "value": number, "cells": cells });
            }
        }

        // check tree cells at a time
        while (3 <= numbers.length) {
            const first = numbers.shift();
            let second = null;
            let third = null;
            let all = [];
            let i = 0;
            while (third == null && i < numbers.length - 1) {
                second = numbers[i];
                const union = this.#unionArray(first.cells, second.cells);
                if (union.length <= 3) {
                    let j = i + 1;
                    while (third == null && j < numbers.length) {
                        all = this.#unionArray(union, numbers[j].cells);
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
                const values = [ first.value, second.value, third.value ];
                all.forEach(elem => elem.candidate.refine(values));
            }
        }
    }

    // reduce candidates from other than the triplet cells
    #reduceOutOfTriplet(group) {
        // handle the entire group
        const cells = group.filter(elem => 2 <= elem.candidate.length && elem.candidate.length <= 3);

        // check tree cells at a time
        while (3 <= cells.length) {
            const first = cells.shift();
            let second = null;
            let third = null;
            const all = new CandidateArray();
            const union = new CandidateArray();
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
                group.filter(elem => elem != first && elem != second && elem != third).forEach(elem => elem.candidate.remove(all));
            }
        }
    }

    // get the union of arrays
    #unionArray(first, second) {
        return first.concat(second).filter((val, idx, self) => self.indexOf(val) == idx);
    }

}

// X-Wing method class
class XWingMethod extends SolverMethod {

    // generate a solution
    generateSolutions(logic) {
        // rows
        for (let top = 0; top < 8; top++) {
            for (let bottom = top + 1; bottom < 9; bottom++) {

                // columns
                for (let left = 0; left < 8; left++) {
                    for (let right = left + 1; right < 9; right++) {
                        this.#reduceOutOfIntersection(logic, top, bottom, left, right);
                    }
                }
            }
        }
        return [];
    }

    // reduce candidates from other than the shared cells
    #reduceOutOfIntersection(logic, top, bottom, left, right) {
        // get rows, columns, and their intersections
        const trow = logic.getRowCells(top);
        const brow = logic.getRowCells(bottom);
        const lcol = logic.getColCells(left);
        const rcol = logic.getColCells(right);
        const tl = trow[left];
        const tr = trow[right];
        const bl = brow[left];
        const br = brow[right];
        if (tl.block == br.block) {
            // exit if all cells at the intersection are in the same block
            return;
        }

        // get a list of candidates that exist at all four intersections
        const all = new CandidateArray();
        all.add(tl.candidate);
        all.refine(tr.candidate);
        all.refine(bl.candidate);
        all.refine(br.candidate);
        for (let i = 0; i < all.length; i++) {
            // reduce by row
            const value = all.getNumber(i);
            const rfind = elem => elem.col == left || elem.col == right || !elem.candidate.has(value);
            if (trow.every(rfind) && brow.every(rfind)) {
                for (let j = 0; j < 9; j++) {
                    if (j != top && j != bottom) {
                        lcol[j].candidate.remove(value);
                        rcol[j].candidate.remove(value);
                    }
                }
            }

            // reduce by column
            const cfind = elem => elem.row == top || elem.row == bottom || !elem.candidate.has(value);
            if (lcol.every(cfind) && rcol.every(cfind)) {
                for (let j = 0; j < 9; j++) {
                    if (j != left && j != right) {
                        trow[j].candidate.remove(value);
                        brow[j].candidate.remove(value);
                    }
                }
            }
        }
    }

}

// Ariadne method class
class AriadneMethod extends SolverMethod {

    // generate a solution
    generateSolutions(logic) {
        let solutions = [];
        const candidates = logic.getCandidateList();
        for (let i = 0; i < candidates.length; i++) {
            if (1 < candidates[i].length) {
                const complete = this.#removeImpossibleCandidate(logic, candidates, i);
                solutions = solutions.concat(complete);
            }
        }
        return solutions;
    }

    // remove impossible candidates
    #removeImpossibleCandidate(logic, candidates, index) {
        // check the target cell
        const candidate = candidates[index];
        const valids = [];
        const copies = [];
        const complete = [];
        for (let i = 0; i < candidate.length; i++) {
            // assume candidate numbers one by one
            const value = candidate.getNumber(i);
            const copy = logic.copy();
            copy.decideNumber(index, value);
            if (this.lower != null) {
                this.lower.reduce(copy);
            }

            // check the resulting board
            if (this.#isValidBoard(copy)) {
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
        const all = new CandidateArray();
        const numbers = logic.getNumberList();
        for (let i = 0; i < numbers.length; i++) {
            if (i != index && !Numbers.isValid(numbers[i])) {
                all.clear();
                for (const copy of copies) {
                    const value = copy.getNumber(i);
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
    }

    // whether the current board is valid
    #isValidBoard(logic) {
        // check for duplicates
        const incorrect = logic.getIncorrectIndexes();
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
    }

}

// Solver class
class Solver {

    // constructor
    constructor() {
        this.methods = [];
    }

    // initialize the fields
    initialize() {
        // set the methods
        this.methods.push(new OneCandidateMethod());
        this.methods.push(new OneCellMethod());
        this.methods.push(new SharedCellMethod());
        this.methods.push(new TwinMethod());
        this.methods.push(new TripletMethod());
        this.methods.push(new XWingMethod());
        this.methods.push(new AriadneMethod());
        this.methods.push(new AriadneMethod());
        this.methods.forEach((val, idx) => val.depth = idx);
    }

    // solve the problem using the specified level of method
    solve(logic, levels) {
        // check arguments
        if (logic == null || logic.getSolidList(true) == null) {
            return null;
        }
        if (!Array.isArray(levels)) {
            levels = new Array(this.methods.length).fill(true);
        }

        // set the method to use
        let method = null;
        for (let i = 0; i < this.methods.length; i++) {
            const current = this.methods[i];
            if (i < levels.length && levels[i]) {
                current.lower = method;
                method = current;
            }
        }
        if (method == null) {
            return null;
        }

        // call the method
        const result = method.reduce(logic);

        // get the solutions
        if (result.solutions.length == 0 && logic.isFixed()) {
            // if it was completed from the beginning
            const incorrect = logic.getIncorrectIndexes();
            if (incorrect.length == 0) {
                result.solutions.push(logic);
            }
        }
        if (result.solutions.length == 1 && !logic.isFixed()) {
            // if the Ariadne's thread happens to find only one solution
            result.solutions = [];
        }
        result.solutions = result.solutions.map(elem => elem.getCurrentStatus());

        // get the number of times used for each method
        const counts = [];
        for (const level of levels) {
            if (level) {
                counts.push(0);
            } else {
                counts.push("-");
            }
        }
        result.progress.forEach(elem => counts[elem.depth]++);
        result.summary = counts;
        return result;
    }

}

