// Numbers class
class Numbers {

    // list of all numbers
    static all = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];

    // whether it is valid number
    static isValid(value) {
        return 0 <= Numbers.all.indexOf(value);
    }

}

// Candidate array class
class CandidateArray {
    #values = [];

    // constructor
    constructor() {
        this.length = 0;
    }

    // clear properties
    clear() {
        this.#values = [];
        this.length = 0;
    }

    // fill all candidate numbers
    fill() {
        this.#values = Numbers.all.concat();
        this.length = this.#values.length;
    }

    // add candidates
    add(other) {
        const others = this.#convertToArray(other).filter(elem => Numbers.isValid(elem) && this.#values.indexOf(elem) < 0);
        this.#values = this.#values.concat(others);
        this.#values.sort(this.#compareNumbers);
        this.length = this.#values.length;
    }

    // remove candidates
    remove(other) {
        const others = this.#convertToArray(other);
        this.#values = this.#values.filter(elem => others.indexOf(elem) < 0);
        this.length = this.#values.length;
    }

    // narrow down candidates
    refine(other) {
        const others = this.#convertToArray(other);
        this.#values = this.#values.filter(elem => 0 <= others.indexOf(elem));
        this.length = this.#values.length;
    }

    // toggle a candidate
    toggle(value) {
        // check arguments
        if (!Numbers.isValid(value)) {
            return;
        }

        // toggle the candidate
        const index = this.#values.indexOf(value);
        if (index < 0) {
            this.#values.push(value);
            this.#values.sort(this.#compareNumbers);
        } else {
            this.#values.splice(index, 1);
        }
        this.length = this.#values.length;
    }

    // get a candidate number
    getNumber(index) {
        // check arguments
        if (index < 0 || this.length <= index) {
            return 0;
        } else {
            return this.#values[index];
        }
    }

    // whether the specified number is included
    has(other) {
        const others = this.#convertToArray(other);
        return others.every(elem => 0 <= this.#values.indexOf(elem));
    }

    // whether the candidates are the same
    areSame(other) {
        const others = this.#convertToArray(other).concat();
        if (others.length != this.length) {
            return false;
        }
        others.sort(this.#compareNumbers);
        return others.every((val, idx) => val == this.#values[idx]);
    }

    // get candidates as an array
    getArray() {
        return this.#values.concat();
    }

    // set a candidate array
    setArray(others) {
        this.clear();
        this.add(others);
    }

    // convert to an array
    #convertToArray(other) {
        if (other instanceof CandidateArray) {
            return other.#values;
        } else if (Array.isArray(other)) {
            return other;
        } else {
            return [ other ];
        }
    }

    // numerical comparison function for sorting
    #compareNumbers(a, b) {
        return a - b;
    }

}

// Logical board class
class LogicalBoard {

    // constructor
    constructor() {
        this.rows = new Array(9).fill().map((_, i) => new Array(9).fill(i * 9).map((val, idx) => val + idx));
        this.cols = new Array(9).fill().map((_, i) => new Array(9).fill(i).map((val, idx) => val + idx * 9));

        // list of indexes by block
        this.blocks = [];
        for (let i = 0; i < 9; i++) {
            const start = (Math.floor(i / 3) * 9 + (i % 3)) * 3;
            const part = new Array(3).fill().map((_, j) => new Array(3).fill(start + j * 9).map((val, idx) => val + idx));
            this.blocks.push(part.flat());
        }

        // create a cell list
        this.cells = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const block = Math.floor(i / 3) * 3 + Math.floor(j / 3);
                const cell = { "solid": 0, "value": 0, "candidate": new CandidateArray(), "row": i, "col": j, "block": block };
                this.cells.push(cell);
            }
        }
        this.length = this.cells.length;
    }

    // initialize the board
    initialize() {
        for (const cell of this.cells) {
            cell.value = 0;
            cell.candidate.clear();
        }
    }

    // get a list of solid values
    getSolidList(limit) {
        // check arguments
        if (limit) {
            if (!this.cells.some(elem => Numbers.isValid(elem.solid))) {
                return null;
            }
        }

        // get values
        return this.cells.map(elem => elem.solid);
    }

    // set a list of solid values
    setSolidList(values) {
        // check arguments
        if (!Array.isArray(values)) {
            return;
        }

        // set values
        const count = Math.min(values.length, this.cells.length);
        for (let i = 0; i < count; i++) {
            const value = values[i];
            if (Numbers.isValid(value)) {
                // valid number
                this.cells[i].solid = value;
            } else {
                // invalid number
                if (value < 0) {
                    this.cells[i].solid = -1;
                } else {
                    this.cells[i].solid = 0;
                }
            }
        }
        for (let i = count; i < this.cells.length; i++) {
            this.cells[i].solid = 0;
        }
    }

    // get a list of number values
    getNumberList(limit) {
        // check arguments
        if (limit) {
            if (!this.cells.some(elem => Numbers.isValid(elem.value))) {
                return null;
            }
        }

        // get values
        return this.cells.map(elem => elem.value);
    }

    // set a list of number values
    setNumberList(values) {
        // check arguments
        if (!Array.isArray(values)) {
            return;
        }

        // set values
        const count = Math.min(values.length, this.cells.length);
        for (let i = 0; i < count; i++) {
            const value = values[i];
            if (Numbers.isValid(value)) {
                // valid number
                this.cells[i].value = value;
            } else {
                // invalid number
                this.cells[i].value = 0;
            }
        }
        for (let i = count; i < this.cells.length; i++) {
            this.cells[i].value = 0;
        }
    }

    // get a list of candidate values
    getCandidateList(limit) {
        // check arguments
        if (limit) {
            if (!this.cells.some(elem => 0 < elem.candidate.length)) {
                return null;
            }
        }

        // get values
        return this.cells.map(elem => elem.candidate);
    }

    // set a list of candidate values
    setCandidateList(list) {
        // check arguments
        if (!Array.isArray(list)) {
            return;
        }

        // set values
        const count = Math.min(list.length, this.cells.length);
        this.cells.slice(0, count).forEach((val, idx) => val.candidate.setArray(list[idx]));
        this.cells.slice(count).forEach(elem => elem.candidate.clear());
    }

    // get the index
    getIndex(row, col) {
        // check arguments
        if (row < 0 || this.rows.length <= row) {
            return -1;
        }
        if (col < 0 || this.rows[row].length <= col) {
            return -1;
        }

        // get from the row table
        return this.rows[row][col];
    }

    // set a solid value
    setSolid(index, value) {
        // check arguments
        if (index < 0 || this.cells.length <= index) {
            return;
        }

        // set a value
        if (Numbers.isValid(value)) {
            this.cells[index].solid = value;
        } else {
            if (value < 0) {
                this.cells[index].solid = -1;
            } else {
                this.cells[index].solid = 0;
            }
        }
    }

    // get a number value
    getNumber(index) {
        // check arguments
        if (index < 0 || this.cells.length <= index) {
            return 0;
        }

        // get a value
        return this.cells[index].value;
    }

    // set a number value
    setNumber(index, value) {
        // check arguments
        if (index < 0 || this.cells.length <= index) {
            return;
        }

        // set a value
        if (Numbers.isValid(value)) {
            this.cells[index].value = value;
        } else {
            this.cells[index].value = 0;
        }
    }

    // get candidate values
    getCandidate(index) {
        // check arguments
        if (index < 0 || this.cells.length <= index) {
            return null;
        }

        // get values
        return this.cells[index].candidate;
    }

    // set candidate values
    setCandidate(index, values) {
        // check arguments
        if (index < 0 || this.cells.length <= index) {
            return;
        }

        // set values
        this.cells[index].candidate.setArray(values);
    }

    // whether it is a solid value
    isSolid(index) {
        // check arguments
        if (index < 0 || this.cells.length <= index) {
            return false;
        }

        // get a value
        return Numbers.isValid(this.cells[index].solid);
    }

    // whether it is a number value
    isNumber(index) {
        // check arguments
        if (index < 0 || this.cells.length <= index) {
            return false;
        }

        // get a value
        return Numbers.isValid(this.cells[index].value);
    }

    // whether it has a candidate value
    hasCandidate(index) {
        // check arguments
        if (index < 0 || this.cells.length <= index) {
            return null;
        }

        // get values
        return 0 < this.cells[index].candidate.length;
    }

    // whether all cells are filled
    isFixed() {
        return this.cells.every(elem => Numbers.isValid(elem.solid) || Numbers.isValid(elem.value));
    }

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
        this.getRowCells(cell.row).forEach(act);
        this.getColCells(cell.col).forEach(act);
        this.getBlockCells(cell.block).forEach(act);
    }

    // setup candidates
    setupCandidates() {
        // initialize all candidates
        this.cells.forEach(elem => elem.candidate.fill());

        // decide with all solid values
        for (let i = 0; i < this.cells.length; i++) {
            if (Numbers.isValid(this.cells[i].solid)) {
                this.decideNumber(i, this.cells[i].solid);
            }
        }
    }

    // get a list of all cells
    getAllCells() {
        return this.cells.concat();
    }

    // get a list of cells in the same row
    getRowCells(row) {
        // check arguments
        if (row < 0 || this.rows.length <= row) {
            return [];
        }

        // select cells
        return this.rows[row].map(this.#selectCell, this);
    }

    // get a list of cells in the same column
    getColCells(col) {
        // check arguments
        if (col < 0 || this.cols.length <= col) {
            return [];
        }

        // select cells
        return this.cols[col].map(this.#selectCell, this);
    }

    // get a list of cells in the same block
    getBlockCells(block) {
        // check arguments
        if (block < 0 || this.blocks.length <= block) {
            return [];
        }

        // select cells
        return this.blocks[block].map(this.#selectCell, this);
    }

    // get the number of all remaining candidates
    getCandidateCount() {
        return this.cells.reduce((acc, cur) => acc + cur.candidate.length, 0);
    }

    // get the current status
    getCurrentStatus() {
        const table = [];
        for (let i = 0; i < this.rows.length; i++) {
            const cells = this.getRowCells(i);
            const row = [];
            for (const cell of cells) {
                if (Numbers.isValid(cell.value)) {
                    row.push(cell.value);
                } else {
                    row.push(cell.candidate.getArray());
                }
            }
            table.push(row);
        }
        return table;
    }

    // copy the logical board
    copy() {
        const logic = new this.constructor();
        logic.setSolidList(this.getSolidList());
        logic.setNumberList(this.getNumberList());
        logic.setCandidateList(this.getCandidateList());
        return logic;
    }

    // get a list of incorrect indexes
    getIncorrectIndexes() {
        const indexes = [];
        indexes.push(this.rows.map(this.getDuplicates, this));
        indexes.push(this.cols.map(this.getDuplicates, this));
        indexes.push(this.blocks.map(this.getDuplicates, this));
        return indexes.flat(Infinity).filter((val, idx, arr) => arr.indexOf(val) == idx);
    }

    // get a list of indexes with duplicate numbers
    getDuplicates(group) {
        // get a list of indexes for each number
        const numbers = new Array(group.length).fill().map(elem => []);
        for (const index of group) {
            // gets the solid value or number that corresponds to the index
            let value = this.cells[index].solid;
            if (!Numbers.isValid(value)) {
                value = this.cells[index].value;
            }
            if (Numbers.isValid(value)) {
                numbers[value % 9].push(index);
            }
        }

        // check if there were any duplicates
        const duplicates = numbers.filter(elem => 1 < elem.length).map(elem => elem.filter(idx => !this.isSolid(idx)));
        return duplicates.flat();
    }

    // whether the boards are the same
    areSame(other) {
        const numbers = other.getNumberList();
        if (numbers.length != this.cells.length) {
            return false;
        }
        return numbers.every((val, idx) => val == this.cells[idx].value);
    }

    // select a cell
    #selectCell(index) {
        return this.cells[index];
    }

}

