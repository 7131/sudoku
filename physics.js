// Physical board class
class PhysicalBoard {
    #grid;
    #fore;
    #back;
    #width;
    #height;
    #large;
    #small;
    #index = -1;
    #ax = [ 1 ];
    #ay = [ 1 ];
    #nx = [];
    #ny = [];
    #cx = [];
    #cy = [];
    #solid = "blue";
    #number = "black";
    #candidate = "green";

    // constructor
    constructor(logic) {
        this.logic = logic;
    }

    // set the canvas element
    setCanvas(canvas, event) {
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
        this.#grid = canvas.getContext("2d");

        // number area (front)
        const face = document.createElement("canvas");
        face.id = "face";
        face.width = canvas.width;
        face.height = canvas.height;
        face.addEventListener("click", event);
        canvas.parentElement.appendChild(face);
        this.#fore = face.getContext("2d");
        this.#fore.textBaseline = "middle";
        this.#fore.textAlign = "center";
        this.#fore.strokeStyle = "red";
        this.#fore.lineWidth = 2;

        // background area (backmost)
        const rear = document.createElement("canvas");
        rear.id = "rear";
        rear.width = canvas.width;
        rear.height = canvas.height;
        canvas.parentElement.appendChild(rear);
        this.#back = rear.getContext("2d");
        this.#back.fillStyle = "gold";

        // drawing sizes
        const nw = canvas.width / 9;
        const nh = canvas.height / 9;
        const ncw = nw / 2 + 2;
        const nch = nh / 2 + 2;
        const cw = nw / 3;
        const ch = nh / 3;

        // coordinates
        for (let i = 0; i < 9; i++) {
            this.#ax.push(Math.floor(this.#ax[i] + nw));
            this.#ay.push(Math.floor(this.#ay[i] + nh));
            this.#nx.push(Math.floor(this.#ax[i] + ncw));
            this.#ny.push(Math.floor(this.#ay[i] + nch));
        }
        this.#width = this.#ax[9];
        this.#height = this.#ay[9];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.#cx.push(Math.floor((cw - 2) * (j - 1)) - 1);
                this.#cy.push(Math.floor((ch - 2) * (i - 1)) - 1);
            }
        }

        // fonts
        this.#large = `bold ${Math.floor(Math.min(nw, nh) * 0.8)}px sans-serif`;
        this.#small = `bold ${Math.floor(Math.min(cw, ch))}px sans-serif`;
    }

    // initialize the board
    clear() {
        // clear the board
        this.#grid.clearRect(0, 0, this.#width, this.#height);
        this.#fore.clearRect(0, 0, this.#width, this.#height);
        this.#back.clearRect(0, 0, this.#width, this.#height);

        // draw the frame
        for (let i = 0; i < 10; i++) {
            this.#grid.beginPath();
            this.#grid.lineWidth = 1;
            if ((i % 3) == 0) {
                this.#grid.lineWidth = 2;
            }

            // horizontal lines
            this.#grid.moveTo(0, this.#ay[i]);
            this.#grid.lineTo(this.#width, this.#ay[i]);

            // vertical lines
            this.#grid.moveTo(this.#ax[i], 0);
            this.#grid.lineTo(this.#ax[i], this.#height);
            this.#grid.stroke();
        }
        this.#index = -1;
    }

    // select a cell
    selectCell(px, py, avoid) {
        // convert coordinates to index
        let row = -1;
        let col = -1;
        for (let i = 0; i < 9; i++) {
            if (this.#ax[i] <= px && px <= this.#ax[i + 1]) {
                col = i;
            }
            if (this.#ay[i] <= py && py <= this.#ay[i + 1]) {
                row = i;
            }
        }
        this.#index = this.logic.getIndex(row, col);

        // whether it is a solid value
        if (avoid && this.logic.isSolid(this.#index)) {
            this.#index = -1;
        }
    }

    // set the pattern
    setPattern(pattern) {
        // set the logical board
        this.logic.initialize();
        this.logic.setSolidList(pattern);

        // draw a list of solid values
        this.#fore.clearRect(0, 0, this.#width, this.#height);
        this.#drawSolidList();

        // deselect a cell
        this.drawBack(false);
        this.#index = -1;
    }

    // set a solid cell
    setSolidCell(value) {
        // check fields
        if (this.#index < 0) {
            return;
        }

        // set the value in the selected cell
        this.logic.setSolid(this.#index, value);
        this.logic.setNumber(this.#index, 0);
        this.logic.setCandidate(this.#index, []);
        this.#drawSolid(value);
    }

    // set a number cell
    setNumberCell(value) {
        // check fields
        if (this.#index < 0) {
            return;
        }

        // set the value in the selected cell
        this.logic.setSolid(this.#index, 0);
        this.logic.setNumber(this.#index, value);
        this.logic.setCandidate(this.#index, []);
        this.#drawNumber(value);
    }

    // reset the candidate
    resetCandidate() {
        // check fields
        if (this.#index < 0) {
            return;
        }

        // reset the values in the selected cell
        this.logic.setSolid(this.#index, 0);
        this.logic.setNumber(this.#index, 0);
        this.logic.setCandidate(this.#index, Numbers.all);
        this.#drawCandidate(Numbers.all);
    }

    // toggle a candidate value
    toggleCandidate(value) {
        // check fields
        if (this.#index < 0) {
            return;
        }

        // switch the value in the selected cell
        this.logic.setSolid(this.#index, 0);
        this.logic.setNumber(this.#index, 0);
        const candidate = this.logic.getCandidate(this.#index);
        candidate.toggle(value);
        this.#drawCandidate(candidate.getArray());
    }

    // get a list of counters
    getCounters(initial) {
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
    }

    // whether it is a solid cell
    isSolidCell() {
        return this.logic.isSolid(this.#index);
    }

    // redraw the board
    redraw(detail) {
        this.#fore.clearRect(0, 0, this.#width, this.#height);
        this.#drawSolidList();
        this.#drawNumberList();
        if (detail) {
            this.#drawCandidateList();
        }
    }

    // get the current data
    getData(title, all, stay) {
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
            description = `${title} (${description})`;
        }
        const data = { "description": description, "pattern": solids };
        if (numbers != null) {
            data.numbers = numbers;
        }
        if (candidates != null) {
            data.candidates = candidates.map(elem => elem.getArray());
        }
        return JSON.stringify(data);
    }

    // set the current data
    setData(json, all, stay) {
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
            this.#drawNumberList();
            this.#drawCandidateList();
        }
        return data;
    }

    // draw background
    drawBack(fill) {
        // check fields
        if (this.#index < 0) {
            return;
        }

        // coordinate calculation
        const pos = this.#getPosition(this.#index);
        const x = this.#ax[pos.col];
        const y = this.#ay[pos.row];
        const w = this.#ax[pos.col + 1] - x;
        const h = this.#ay[pos.row + 1] - y;

        // fill the background
        if (fill) {
            this.#back.fillRect(x, y, w, h);
        } else {
            this.#back.clearRect(x, y, w, h);
        }
    }

    // draw an x mark
    drawCross(index) {
        // get coordinates
        const pos = this.#getPosition(index);
        const left = this.#ax[pos.col] + 3;
        const top = this.#ay[pos.row] + 3;
        const right = this.#ax[pos.col + 1] - 3;
        const bottom = this.#ay[pos.row + 1] - 3;

        // draw
        this.#fore.beginPath();
        this.#fore.moveTo(left, top);
        this.#fore.lineTo(right, bottom);
        this.#fore.moveTo(right, top);
        this.#fore.lineTo(left, bottom);
        this.#fore.stroke();
    }

    // draw a solid value
    #drawSolid(value) {
        // check arguments
        if (!Numbers.isValid(value)) {
            if (value < 0) {
                value = "X";
            } else {
                value = "";
            }
        }

        // draw
        this.#drawValue(value, this.#solid);
    }

    // draw a number
    #drawNumber(value) {
        // check arguments
        if (!Numbers.isValid(value)) {
            value = "";
        }

        // draw
        this.#drawValue(value, this.#number);
    }

    // draw candidates
    #drawCandidate(values) {
        // check fields
        if (this.#index < 0) {
            return;
        }

        // clear
        this.#drawNumber(0);
        const pos = this.#getPosition(this.#index);

        // draw
        this.#fore.font = this.#small;
        this.#fore.fillStyle = this.#candidate;
        for (const value of values) {
            const index = Numbers.all.indexOf(value);
            if (0 <= index) {
                const x = this.#nx[pos.col] + this.#cx[index];
                const y = this.#ny[pos.row] + this.#cy[index];
                this.#fore.fillText(value, x, y);
            }
        }
    }

    // draw a value
    #drawValue(value, color) {
        // check fields
        if (this.#index < 0) {
            return;
        }

        // coordinate calculation
        const pos = this.#getPosition(this.#index);
        const x = this.#ax[pos.col];
        const y = this.#ay[pos.row];
        const w = this.#ax[pos.col + 1] - x;
        const h = this.#ay[pos.row + 1] - y;

        // clear
        this.#fore.clearRect(x, y, w, h);

        // draw
        this.#fore.font = this.#large;
        this.#fore.fillStyle = color;
        this.#fore.fillText(value, this.#nx[pos.col], this.#ny[pos.row]);
    }

    // draw a list of solid values
    #drawSolidList() {
        const solids = this.logic.getSolidList();

        // specify the font
        this.#fore.font = this.#large;
        this.#fore.fillStyle = this.#solid;

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
                const pos = this.#getPosition(i);
                this.#fore.fillText(value, this.#nx[pos.col], this.#ny[pos.row]);
            }
        }
    }

    // draw a list of number values
    #drawNumberList() {
        const numbers = this.logic.getNumberList();

        // specify the font
        this.#fore.font = this.#large;
        this.#fore.fillStyle = this.#number;

        // draw
        for (let i = 0; i < numbers.length; i++) {
            if (Numbers.isValid(numbers[i]) && !this.logic.isSolid(i)) {
                const pos = this.#getPosition(i);
                this.#fore.fillText(numbers[i], this.#nx[pos.col], this.#ny[pos.row]);
            }
        }
    }

    // draw a list of candidate values
    #drawCandidateList() {
        const candidates = this.logic.getCandidateList();

        // specify the font
        this.#fore.font = this.#small;
        this.#fore.fillStyle = this.#candidate;

        // draw
        for (let i = 0; i < candidates.length; i++) {
            const values = candidates[i].getArray();
            if (0 < values.length && !this.logic.isSolid(i)) {
                const pos = this.#getPosition(i);
                for (const value of values) {
                    const index = Numbers.all.indexOf(value);
                    const x = this.#nx[pos.col] + this.#cx[index];
                    const y = this.#ny[pos.row] + this.#cy[index];
                    this.#fore.fillText(value, x, y);
                }
            }
        }
    }

    // get position
    #getPosition(index) {
        const row = Math.floor(index / 9);
        const col = index % 9;
        return { "row": row, "col": col };
    }

}

