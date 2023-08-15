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
        const others = this._convertToArray(other);
        for (let i = 0; i < others.length; i++) {
            const value = others[i];
            if (Numbers.isValid(value) && this._values.indexOf(value) < 0) {
                this._values.push(value);
            }
        }
        this._values.sort(this._compareNumbers);
        this.length = this._values.length;
    },

    // remove candidates
    "remove": function(other) {
        const others = this._convertToArray(other);
        for (let i = 0; i < others.length; i++) {
            const index = this._values.indexOf(others[i]);
            if (0 <= index) {
                this._values.splice(index, 1);
            }
        }
        this.length = this._values.length;
    },

    // narrow down candidates
    "refine": function(other) {
        const others = this._convertToArray(other);
        const intersect = [];
        for (let i = 0; i < this._values.length; i++) {
            const value = this._values[i];
            if (0 <= others.indexOf(value)) {
                intersect.push(value);
            }
        }
        this._values = intersect;
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
        for (let i = 0; i < others.length; i++) {
            if (this._values.indexOf(others[i]) < 0) {
                return false;
            }
        }
        return true;
    },

    // whether the candidates are the same
    "areSame": function(other) {
        const others = this._convertToArray(other);
        if (others.length != this.length) {
            return false;
        }
        const remain = others.concat();
        for (let i = 0; i < this._values.length; i++) {
            const index = remain.indexOf(this._values[i]);
            if (index < 0) {
                return false;
            }
            remain.splice(index, 1);
        }
        return true;
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
    // list of indexes by row
    this._rows = [];
    let index = 0;
    for (let i = 0; i < 9; i++) {
        const part = [];
        for (let j = 0; j < 9; j++) {
            part.push(index);
            index++;
        }
        this._rows.push(part);
    }

    // list of indexes by column
    this._cols = [];
    for (let i = 0; i < 9; i++) {
        const part = [];
        for (let j = 0; j < 81; j += 9) {
            part.push(i + j);
        }
        this._cols.push(part);
    }

    // list of indexes by block
    this._blocks = [];
    for (let i = 0; i < 9; i++) {
        const part = [];
        const start = (Math.floor(i / 3) * 9 + (i % 3)) * 3;
        for (let j = 0; j < 3; j++) {
            index = start + j * 9;
            for (let k = 0; k < 3; k++) {
                part.push(index + k);
            }
        }
        this._blocks.push(part);
    }

    // create a cell list
    this._cells = [];
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const block = Math.floor(i / 3) * 3 + Math.floor(j / 3);
            const cell = { "solid": 0, "value": 0, "candidate": new CandidateArray(), "row": i, "col": j, "block": block, };
            this._cells.push(cell);
        }
    }
    this.length = 81;
}

// Logical board prototype
LogicalBoard.prototype = {

    // initialize the board
    "initialize": function() {
        for (let i = 0; i < this.length; i++) {
            this._cells[i].value = 0;
            this._cells[i].candidate.clear();
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
        for (let i = 0; i < count; i++) {
            this._cells[i].candidate.setArray(list[i]);
        }
        for (let i = count; i < this._cells.length; i++) {
            this._cells[i].candidate.clear();
        }
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
        for (let i = 0; i < this._cells.length; i++) {
            this._cells[i].candidate.fill();
        }

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
            for (let j = 0; j < cells.length; j++) {
                const cell = cells[j];
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
        // check for duplicate numbers
        const indexes = [];
        for (let i = 0; i < 9; i++) {
            Array.prototype.push.apply(indexes, this._getDuplicates(this._rows[i]));
            Array.prototype.push.apply(indexes, this._getDuplicates(this._cols[i]));
            Array.prototype.push.apply(indexes, this._getDuplicates(this._blocks[i]));
        }

        // remove duplicate indexes
        return indexes.filter((elem, idx, self) => self.indexOf(elem) == idx);
    },

    // whether the boards are the same
    "areSame": function(other) {
        // size
        const numbers = other.getNumberList();
        if (numbers.length != this._cells.length) {
            return false;
        }

        // numbers
        for (let i = 0; i < numbers.length; i++) {
            if (numbers[i] != this._cells[i].value) {
                return false;
            }
        }
        return true;
    },

    // select a cell
    "_selectCell": function(index) {
        return this._cells[index];
    },

    // get a list of indexes with duplicate numbers
    "_getDuplicates": function(group) {
        // get a list of indexes for each number
        const numbers = [];
        for (let i = 0; i < group.length; i++) {
            const index = group[i];

            // gets the solid value or number that corresponds to the index
            let value = this._cells[index].solid;
            if (!Numbers.isValid(value)) {
                value = this._cells[index].value;
            }
            if (Numbers.isValid(value)) {
                if (!Array.isArray(numbers[value])) {
                    numbers[value] = [];
                }
                numbers[value].push(index);
            }
        }

        // get a list of indexes
        const duplicates = [];
        for (let i = 0; i < Numbers.all.length; i++) {
            const indexes = numbers[Numbers.all[i]];
            if (Array.isArray(indexes) && 1 < indexes.length) {
                for (let j = 0; j < indexes.length; j++) {
                    // exclude solid values
                    const index = indexes[j];
                    if (!this.isSolid(index)) {
                        duplicates.push(index);
                    }
                }
            }
        }
        return duplicates;
    },

}

