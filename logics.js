// Numbers class
const Numbers = {

    // list of all numbers
    "all": [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ],

    // whether it is valid number
    "isValid": function(value) {
        return 0 <= Numbers.all.indexOf(value);
    }

}

// Candidate array class
const CandidateArray = function() {
    this._values = [];
    this.length = 0;
}

// Candidate array prototype
CandidateArray.prototype = {

    // clear properties
    "clear": function() {
        this._values = [];
        this.length = 0;
    },

    // fill all candidate numbers
    "fill": function() {
        this._values = Numbers.all.concat();
        this.length = this._values.length;
    },

    // add candidates
    "add": function(other) {
        const others = this._convertToArray(other).filter(elem => Numbers.isValid(elem) && this._values.indexOf(elem) < 0);
        this._values = this._values.concat(others);
        this._values.sort(this._compareNumbers);
        this.length = this._values.length;
    },

    // remove candidates
    "remove": function(other) {
        const others = this._convertToArray(other);
        this._values = this._values.filter(elem => others.indexOf(elem) < 0);
        this.length = this._values.length;
    },

    // narrow down candidates
    "refine": function(other) {
        const others = this._convertToArray(other);
        this._values = this._values.filter(elem => 0 <= others.indexOf(elem));
        this.length = this._values.length;
    },

    // toggle a candidate
    "toggle": function(value) {
        // check arguments
        if (!Numbers.isValid(value)) {
            return;
        }

        // toggle the candidate
        const index = this._values.indexOf(value);
        if (index < 0) {
            this._values.push(value);
            this._values.sort(this._compareNumbers);
        } else {
            this._values.splice(index, 1);
        }
        this.length = this._values.length;
    },

    // get a candidate number
    "getNumber": function(index) {
        // check arguments
        if (index < 0 || this.length <= index) {
            return 0;
        } else {
            return this._values[index];
        }
    },

    // whether the specified number is included
    "has": function(other) {
        const others = this._convertToArray(other);
        return others.every(elem => 0 <= this._values.indexOf(elem));
    },

    // whether the candidates are the same
    "areSame": function(other) {
        const others = this._convertToArray(other).concat();
        if (others.length != this.length) {
            return false;
        }
        others.sort(this._compareNumbers);
        return others.every((val, idx) => val == this._values[idx]);
    },

    // get candidates as an array
    "getArray": function() {
        return this._values.concat();
    },

    // set a candidate array
    "setArray": function(others) {
        this.clear();
        this.add(others);
    },

    // convert to an array
    "_convertToArray": function(other) {
        if (other instanceof CandidateArray) {
            return other._values;
        } else if (Array.isArray(other)) {
            return other;
        } else {
            return [ other ];
        }
    },

    // numerical comparison function for sorting
    "_compareNumbers": function(a, b) {
        return a - b;
    },

}

// Logical board class
const LogicalBoard = function() {
    this._rows = new Array(9).fill().map((_, i) => new Array(9).fill(i * 9).map((val, idx) => val + idx));
    this._cols = new Array(9).fill().map((_, i) => new Array(9).fill(i).map((val, idx) => val + idx * 9));

    // list of indexes by block
    this._blocks = [];
    for (let i = 0; i < 9; i++) {
        const start = (Math.floor(i / 3) * 9 + (i % 3)) * 3;
        const part = new Array(3).fill().map((_, j) => new Array(3).fill(start + j * 9).map((val, idx) => val + idx));
        this._blocks.push(part.flat());
    }

    // create a cell list
    this._cells = [];
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const block = Math.floor(i / 3) * 3 + Math.floor(j / 3);
            const cell = { "solid": 0, "value": 0, "candidate": new CandidateArray(), "row": i, "col": j, "block": block };
            this._cells.push(cell);
        }
    }
    this.length = this._cells.length;
}

// Logical board prototype
LogicalBoard.prototype = {

    // initialize the board
    "initialize": function() {
        for (const cell of this._cells) {
            cell.value = 0;
            cell.candidate.clear();
        }
    },

    // get a list of solid values
    "getSolidList": function(limit) {
        // check arguments
        if (limit) {
            if (!this._cells.some(elem => Numbers.isValid(elem.solid))) {
                return null;
            }
        }

        // get values
        return this._cells.map(elem => elem.solid);
    },

    // set a list of solid values
    "setSolidList": function(values) {
        // check arguments
        if (!Array.isArray(values)) {
            return;
        }

        // set values
        const count = Math.min(values.length, this._cells.length);
        for (let i = 0; i < count; i++) {
            const value = values[i];
            if (Numbers.isValid(value)) {
                // valid number
                this._cells[i].solid = value;
            } else {
                // invalid number
                if (value < 0) {
                    this._cells[i].solid = -1;
                } else {
                    this._cells[i].solid = 0;
                }
            }
        }
        for (let i = count; i < this._cells.length; i++) {
            this._cells[i].solid = 0;
        }
    },

    // get a list of number values
    "getNumberList": function(limit) {
        // check arguments
        if (limit) {
            if (!this._cells.some(elem => Numbers.isValid(elem.value))) {
                return null;
            }
        }

        // get values
        return this._cells.map(elem => elem.value);
    },

    // set a list of number values
    "setNumberList": function(values) {
        // check arguments
        if (!Array.isArray(values)) {
            return;
        }

        // set values
        const count = Math.min(values.length, this._cells.length);
        for (let i = 0; i < count; i++) {
            const value = values[i];
            if (Numbers.isValid(value)) {
                // valid number
                this._cells[i].value = value;
            } else {
                // invalid number
                this._cells[i].value = 0;
            }
        }
        for (let i = count; i < this._cells.length; i++) {
            this._cells[i].value = 0;
        }
    },

    // get a list of candidate values
    "getCandidateList": function(limit) {
        // check arguments
        if (limit) {
            if (!this._cells.some(elem => 0 < elem.candidate.length)) {
                return null;
            }
        }

        // get values
        return this._cells.map(elem => elem.candidate);
    },

    // set a list of candidate values
    "setCandidateList": function(list) {
        // check arguments
        if (!Array.isArray(list)) {
            return;
        }

        // set values
        const count = Math.min(list.length, this._cells.length);
        this._cells.slice(0, count).forEach((val, idx) => val.candidate.setArray(list[idx]));
        this._cells.slice(count).forEach(elem => elem.candidate.clear());
    },

    // get the index
    "getIndex": function(row, col) {
        // check arguments
        if (row < 0 || this._rows.length <= row) {
            return -1;
        }
        if (col < 0 || this._rows[row].length <= col) {
            return -1;
        }

        // get from the row table
        return this._rows[row][col];
    },

    // set a solid value
    "setSolid": function(index, value) {
        // check arguments
        if (index < 0 || this._cells.length <= index) {
            return;
        }

        // set a value
        if (Numbers.isValid(value)) {
            this._cells[index].solid = value;
        } else {
            if (value < 0) {
                this._cells[index].solid = -1;
            } else {
                this._cells[index].solid = 0;
            }
        }
    },

    // get a number value
    "getNumber": function(index) {
        // check arguments
        if (index < 0 || this._cells.length <= index) {
            return 0;
        }

        // get a value
        return this._cells[index].value;
    },

    // set a number value
    "setNumber": function(index, value) {
        // check arguments
        if (index < 0 || this._cells.length <= index) {
            return;
        }

        // set a value
        if (Numbers.isValid(value)) {
            this._cells[index].value = value;
        } else {
            this._cells[index].value = 0;
        }
    },

    // get candidate values
    "getCandidate": function(index) {
        // check arguments
        if (index < 0 || this._cells.length <= index) {
            return null;
        }

        // get values
        return this._cells[index].candidate;
    },

    // set candidate values
    "setCandidate": function(index, values) {
        // check arguments
        if (index < 0 || this._cells.length <= index) {
            return;
        }

        // set values
        this._cells[index].candidate.setArray(values);
    },

    // whether it is a solid value
    "isSolid": function(index) {
        // check arguments
        if (index < 0 || this._cells.length <= index) {
            return false;
        }

        // get a value
        return Numbers.isValid(this._cells[index].solid);
    },

    // whether it is a number value
    "isNumber": function(index) {
        // check arguments
        if (index < 0 || this._cells.length <= index) {
            return false;
        }

        // get a value
        return Numbers.isValid(this._cells[index].value);
    },

    // whether it has a candidate value
    "hasCandidate": function(index) {
        // check arguments
        if (index < 0 || this._cells.length <= index) {
            return null;
        }

        // get values
        return 0 < this._cells[index].candidate.length;
    },

    // whether all cells are filled
    "isFixed": function() {
        return this._cells.every(elem => Numbers.isValid(elem.solid) || Numbers.isValid(elem.value));
    },

    // decide the number
    "decideNumber": function(index, value) {
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
    },

    // setup candidates
    "setupCandidates": function() {
        // initialize all candidates
        this._cells.forEach(elem => elem.candidate.fill());

        // decide with all solid values
        for (let i = 0; i < this._cells.length; i++) {
            if (Numbers.isValid(this._cells[i].solid)) {
                this.decideNumber(i, this._cells[i].solid);
            }
        }
    },

    // get a list of all cells
    "getAllCells": function() {
        return this._cells.concat();
    },

    // get a list of cells in the same row
    "getRowCells": function(row) {
        // check arguments
        if (row < 0 || this._rows.length <= row) {
            return [];
        }

        // select cells
        return this._rows[row].map(this._selectCell, this);
    },

    // get a list of cells in the same column
    "getColCells": function(col) {
        // check arguments
        if (col < 0 || this._cols.length <= col) {
            return [];
        }

        // select cells
        return this._cols[col].map(this._selectCell, this);
    },

    // get a list of cells in the same block
    "getBlockCells": function(block) {
        // check arguments
        if (block < 0 || this._blocks.length <= block) {
            return [];
        }

        // select cells
        return this._blocks[block].map(this._selectCell, this);
    },

    // get the number of all remaining candidates
    "getCandidateCount": function() {
        return this._cells.reduce((acc, cur) => acc + cur.candidate.length, 0);
    },

    // get the current status
    "getCurrentStatus": function() {
        const table = [];
        for (let i = 0; i < this._rows.length; i++) {
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
    },

    // copy the logical board
    "copy": function() {
        const logic = new LogicalBoard();
        logic.setSolidList(this.getSolidList());
        logic.setNumberList(this.getNumberList());
        logic.setCandidateList(this.getCandidateList());
        return logic;
    },

    // get a list of incorrect indexes
    "getIncorrectIndexes": function() {
        const indexes = [];
        indexes.push(this._rows.map(this._getDuplicates, this));
        indexes.push(this._cols.map(this._getDuplicates, this));
        indexes.push(this._blocks.map(this._getDuplicates, this));
        return indexes.flat(Infinity).filter((val, idx, arr) => arr.indexOf(val) == idx);
    },

    // whether the boards are the same
    "areSame": function(other) {
        const numbers = other.getNumberList();
        if (numbers.length != this._cells.length) {
            return false;
        }
        return numbers.every((val, idx) => val == this._cells[idx].value);
    },

    // select a cell
    "_selectCell": function(index) {
        return this._cells[index];
    },

    // get a list of indexes with duplicate numbers
    "_getDuplicates": function(group) {
        // get a list of indexes for each number
        const numbers = new Array(group.length).fill().map(elem => []);
        for (const index of group) {
            // gets the solid value or number that corresponds to the index
            let value = this._cells[index].solid;
            if (!Numbers.isValid(value)) {
                value = this._cells[index].value;
            }
            if (Numbers.isValid(value)) {
                numbers[value % 9].push(index);
            }
        }

        // check if there were any duplicates
        const duplicates = numbers.filter(elem => 1 < elem.length).map(elem => elem.filter(idx => !this.isSolid(idx)));
        return duplicates.flat();
    },

}

