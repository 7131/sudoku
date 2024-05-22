// Physical board class
const PhysicalBoard = function(logic) {
    // fields
    this.logic = logic;
    this._index = -1;
}

// Physical board prototype
PhysicalBoard.prototype = {

    // set the canvas element
    "setCanvas": function(canvas, event) {
        // set the board size
        if (canvas.clientWidth == canvas.width && canvas.clientHeight == canvas.height) {
            // if no style is specified
            const width = document.documentElement.clientWidth;
            const height = document.documentElement.clientHeight;
            let size = Math.floor(Math.min(width, height) * 0.8);
            const remain = size % 9;
            if (remain < 2) {
                size += 2 - remain;
            }
            canvas.width = size;
            canvas.height = size;
        } else {
            // if styles are specified
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }
        canvas.style.position = "absolute";
        canvas.style.zIndex = 2;
        this._grid = canvas.getContext("2d");

        // number area (front)
        const face = document.createElement("canvas");
        face.style.position = "absolute";
        face.style.zIndex = 3;
        face.style.webkitTapHighlightColor = "#00000000";
        face.style.cursor = "pointer";
        face.width = canvas.width;
        face.height = canvas.height;
        face.style.border = canvas.style.border;
        face.addEventListener("click", event);
        canvas.parentElement.appendChild(face);
        this._fore = face.getContext("2d");
        this._fore.textBaseline = "middle";
        this._fore.textAlign = "center";
        this._fore.strokeStyle = "red";
        this._fore.lineWidth = 2;

        // background area (backmost)
        const rear = document.createElement("canvas");
        rear.width = canvas.width;
        rear.height = canvas.height;
        rear.style.zIndex = 1;
        rear.style.border = canvas.style.border;
        canvas.parentElement.appendChild(rear);
        this._back = rear.getContext("2d");
        this._back.fillStyle = "gold";

        // drawing sizes
        const nw = canvas.width / 9;
        const nh = canvas.height / 9;
        const ncw = nw / 2 + 2;
        const nch = nh / 2 + 2;
        const cw = nw / 3;
        const ch = nh / 3;

        // coordinates
        this._ax = [ 1 ];
        this._ay = [ 1 ];
        this._nx = [];
        this._ny = [];
        for (let i = 0; i < 9; i++) {
            this._ax.push(Math.floor(this._ax[i] + nw));
            this._ay.push(Math.floor(this._ay[i] + nh));
            this._nx.push(Math.floor(this._ax[i] + ncw));
            this._ny.push(Math.floor(this._ay[i] + nch));
        }
        this._width = this._ax[9];
        this._height = this._ay[9];
        this._cx = [];
        this._cy = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this._cx.push(Math.floor((cw - 2) * (j - 1)) - 1);
                this._cy.push(Math.floor((ch - 2) * (i - 1)) - 1);
            }
        }

        // fonts
        this._large = "bold " + Math.floor(Math.min(nw, nh) * 0.8) + "px sans-serif";
        this._small = "bold " + Math.floor(Math.min(cw, ch)) + "px sans-serif";
        this._solid = "blue";
        this._number = "black";
        this._candidate = "green";
    },

    // initialize the board
    "clear": function() {
        // clear the board
        this._grid.clearRect(0, 0, this._width, this._height);
        this._fore.clearRect(0, 0, this._width, this._height);
        this._back.clearRect(0, 0, this._width, this._height);

        // draw the frame
        for (let i = 0; i < 10; i++) {
            this._grid.beginPath();
            this._grid.lineWidth = 1;
            if ((i % 3) == 0) {
                this._grid.lineWidth = 2;
            }

            // horizontal lines
            this._grid.moveTo(0, this._ay[i]);
            this._grid.lineTo(this._width, this._ay[i]);

            // vertical lines
            this._grid.moveTo(this._ax[i], 0);
            this._grid.lineTo(this._ax[i], this._height);
            this._grid.stroke();
        }
        this._index = -1;
    },

    // select a cell
    "selectCell": function(px, py, avoid) {
        // convert coordinates to index
        let row = -1;
        let col = -1;
        for (let i = 0; i < 9; i++) {
            if (this._ax[i] <= px && px <= this._ax[i + 1]) {
                col = i;
            }
            if (this._ay[i] <= py && py <= this._ay[i + 1]) {
                row = i;
            }
        }
        this._index = this.logic.getIndex(row, col);

        // whether it is a solid value
        if (avoid && this.logic.isSolid(this._index)) {
            this._index = -1;
        }
    },

    // set the pattern
    "setPattern": function(pattern) {
        // set the logical board
        this.logic.initialize();
        this.logic.setSolidList(pattern);

        // draw a list of solid values
        this._fore.clearRect(0, 0, this._width, this._height);
        this._drawSolidList();

        // deselect a cell
        this.drawBack(false);
        this._index = -1;
    },

    // set a solid cell
    "setSolidCell": function(value) {
        // check fields
        if (this._index < 0) {
            return;
        }

        // set the value in the selected cell
        this.logic.setSolid(this._index, value);
        this.logic.setNumber(this._index, 0);
        this.logic.setCandidate(this._index, []);
        this._drawSolid(value);
    },

    // set a number cell
    "setNumberCell": function(value) {
        // check fields
        if (this._index < 0) {
            return;
        }

        // set the value in the selected cell
        this.logic.setSolid(this._index, 0);
        this.logic.setNumber(this._index, value);
        this.logic.setCandidate(this._index, []);
        this._drawNumber(value);
    },

    // reset the candidate
    "resetCandidate": function() {
        // check fields
        if (this._index < 0) {
            return;
        }

        // reset the values in the selected cell
        this.logic.setSolid(this._index, 0);
        this.logic.setNumber(this._index, 0);
        this.logic.setCandidate(this._index, Numbers.all);
        this._drawCandidate(Numbers.all);
    },

    // toggle a candidate value
    "toggleCandidate": function(value) {
        // check fields
        if (this._index < 0) {
            return;
        }

        // switch the value in the selected cell
        this.logic.setSolid(this._index, 0);
        this.logic.setNumber(this._index, 0);
        const candidate = this.logic.getCandidate(this._index);
        candidate.toggle(value);
        this._drawCandidate(candidate.getArray());
    },

    // get a list of counters
    "getCounters": function(initial) {
        // initialize the counters
        const counters = new Array(Numbers.all.length + 1).fill(0);

        // count each number
        const solids = this.logic.getSolidList();
        const numbers = this.logic.getNumberList();
        for (let i = 0; i < numbers.length; i++) {
            const solid = solids[i];
            const number = numbers[i];
            if (Numbers.isValid(solid)) {
                counters[solid]++;
            } else if (!initial && Numbers.isValid(number)) {
                counters[number]++;
            } else {
                counters[0]++;
            }
        }
        return counters;
    },

    // whether it is a solid cell
    "isSolidCell": function() {
        return this.logic.isSolid(this._index);
    },

    // redraw the board
    "redraw": function(detail) {
        this._fore.clearRect(0, 0, this._width, this._height);
        this._drawSolidList();
        this._drawNumberList();
        if (detail) {
            this._drawCandidateList();
        }
    },

    // get the current data
    "getData": function(title, all, stay) {
        // current state
        const solids = this.logic.getSolidList();
        let numbers = null;
        let candidates = null;
        if (all) {
            numbers = this.logic.getNumberList(true);
            candidates = this.logic.getCandidateList(true);
        }

        // delete invalid data
        if (!stay) {
            for (let i = 0; i < solids.length; i++) {
                if (!Numbers.isValid(solids[i])) {
                    solids[i] = 0;
                }
            }
        }

        // create a JSON object
        const now = new Date();
        let description = now.toLocaleString();
        if (title != null) {
            description = title + " (" + description + ")";
        }
        const data = { "description": description, "pattern": solids };
        if (numbers != null) {
            data.numbers = numbers;
        }
        if (candidates != null) {
            data.candidates = candidates.map(elem => elem.getArray());
        }
        return JSON.stringify(data);
    },

    // set the current data
    "setData": function(json, all, stay) {
        // convert to a JSON object
        let data = null;
        try {
            data = JSON.parse(json);
        } catch (ex) {
            return null;
        }

        // arrange the data
        while (Array.isArray(data) && 0 < data.length && Array.isArray(data[0])) {
            data = data[0];
        }
        if (Array.isArray(data)) {
            // for an array
            if (data.length == 0) {
                return null;
            }
            if (data[0].pattern == null) {
                data = { "pattern": data };
            } else {
                data = data[0];
            }
        }
        if (!Array.isArray(data.pattern)) {
            return null;
        }

        // delete invalid data
        if (!stay) {
            for (let i = 0; i < data.pattern.length; i++) {
                if (!Numbers.isValid(data.pattern[i])) {
                    data.pattern[i] = 0;
                }
            }
        }

        // set the pattern
        this.setPattern(data.pattern);
        if (all) {
            this.logic.setNumberList(data.numbers);
            this.logic.setCandidateList(data.candidates);
            this._drawNumberList();
            this._drawCandidateList();
        }
        return data;
    },

    // draw background
    "drawBack": function(fill) {
        // check fields
        if (this._index < 0) {
            return;
        }

        // coordinate calculation
        const pos = this._getPosition(this._index);
        const x = this._ax[pos.col];
        const y = this._ay[pos.row];
        const w = this._ax[pos.col + 1] - x;
        const h = this._ay[pos.row + 1] - y;

        // fill the background
        if (fill) {
            this._back.fillRect(x, y, w, h);
        } else {
            this._back.clearRect(x, y, w, h);
        }
    },

    // draw an x mark
    "drawCross": function(index) {
        // get coordinates
        const pos = this._getPosition(index);
        const left = this._ax[pos.col] + 3;
        const top = this._ay[pos.row] + 3;
        const right = this._ax[pos.col + 1] - 3;
        const bottom = this._ay[pos.row + 1] - 3;

        // draw
        this._fore.beginPath();
        this._fore.moveTo(left, top);
        this._fore.lineTo(right, bottom);
        this._fore.moveTo(right, top);
        this._fore.lineTo(left, bottom);
        this._fore.stroke();
    },

    // draw a solid value
    "_drawSolid": function(value) {
        // check arguments
        if (!Numbers.isValid(value)) {
            if (value < 0) {
                value = "X";
            } else {
                value = "";
            }
        }

        // draw
        this._drawValue(value, this._solid);
    },

    // draw a number
    "_drawNumber": function(value) {
        // check arguments
        if (!Numbers.isValid(value)) {
            value = "";
        }

        // draw
        this._drawValue(value, this._number);
    },

    // draw candidates
    "_drawCandidate": function(values) {
        // check fields
        if (this._index < 0) {
            return;
        }

        // clear
        this._drawNumber(0);
        const pos = this._getPosition(this._index);

        // draw
        this._fore.font = this._small;
        this._fore.fillStyle = this._candidate;
        for (const value of values) {
            const index = Numbers.all.indexOf(value);
            if (0 <= index) {
                const x = this._nx[pos.col] + this._cx[index];
                const y = this._ny[pos.row] + this._cy[index];
                this._fore.fillText(value, x, y);
            }
        }
    },

    // draw a value
    "_drawValue": function(value, color) {
        // check fields
        if (this._index < 0) {
            return;
        }

        // coordinate calculation
        const pos = this._getPosition(this._index);
        const x = this._ax[pos.col];
        const y = this._ay[pos.row];
        const w = this._ax[pos.col + 1] - x;
        const h = this._ay[pos.row + 1] - y;

        // clear
        this._fore.clearRect(x, y, w, h);

        // draw
        this._fore.font = this._large;
        this._fore.fillStyle = color;
        this._fore.fillText(value, this._nx[pos.col], this._ny[pos.row]);
    },

    // draw a list of solid values
    "_drawSolidList": function() {
        const solids = this.logic.getSolidList();

        // specify the font
        this._fore.font = this._large;
        this._fore.fillStyle = this._solid;

        // draw
        for (let i = 0; i < solids.length; i++) {
            let value = solids[i];
            if (!Numbers.isValid(value)) {
                if (value < 0) {
                    value = "X";
                } else {
                    value = "";
                }
            }
            if (value !== "") {
                const pos = this._getPosition(i);
                this._fore.fillText(value, this._nx[pos.col], this._ny[pos.row]);
            }
        }
    },

    // draw a list of number values
    "_drawNumberList": function() {
        const numbers = this.logic.getNumberList();

        // specify the font
        this._fore.font = this._large;
        this._fore.fillStyle = this._number;

        // draw
        for (let i = 0; i < numbers.length; i++) {
            if (Numbers.isValid(numbers[i]) && !this.logic.isSolid(i)) {
                const pos = this._getPosition(i);
                this._fore.fillText(numbers[i], this._nx[pos.col], this._ny[pos.row]);
            }
        }
    },

    // draw a list of candidate values
    "_drawCandidateList": function() {
        const candidates = this.logic.getCandidateList();

        // specify the font
        this._fore.font = this._small;
        this._fore.fillStyle = this._candidate;

        // draw
        for (let i = 0; i < candidates.length; i++) {
            const values = candidates[i].getArray();
            if (0 < values.length && !this.logic.isSolid(i)) {
                const pos = this._getPosition(i);
                for (const value of values) {
                    const index = Numbers.all.indexOf(value);
                    const x = this._nx[pos.col] + this._cx[index];
                    const y = this._ny[pos.row] + this._cy[index];
                    this._fore.fillText(value, x, y);
                }
            }
        }
    },

    // get position
    "_getPosition": function(index) {
        const row = Math.floor(index / 9);
        const col = index % 9;
        return { "row": row, "col": col };
    },

}

