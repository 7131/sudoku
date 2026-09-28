// Controller class
class Controller {
    #board;
    #solver;
    #solveButton;
    #resultArea;
    #messageArea;
    #dataArea;
    #consequence;
    #dependCheck;
    #countAreas = [];
    #settingBoxes = [];

    // constructor
    constructor() {
        if (typeof ExtendedLogicalBoard == "function") {
            this.#board = new PhysicalBoard(new ExtendedLogicalBoard());
        } else {
            this.#board = new PhysicalBoard(new LogicalBoard());
        }
        if (typeof ExtendedSolver == "function") {
            this.#solver = new ExtendedSolver();
        } else {
            this.#solver = new Solver();
        }

        // events
        window.addEventListener("load", this.#initialize.bind(this));
    }

    // initialize the private fields and the page
    #initialize(e) {
        // get the elements
        const canvas = document.getElementById("board");
        this.#board.setCanvas(canvas, this.#selectCell.bind(this));
        this.#solveButton = document.getElementById("solve");
        this.#resultArea = document.getElementById("result");
        this.#messageArea = document.getElementById("message");
        this.#dataArea = document.getElementById("data");
        this.#consequence = document.getElementById("consequence");
        this.#countAreas.push(document.getElementById("remain"));
        for (let i = 1; i <= 9; i++) {
            this.#countAreas.push(document.getElementById(`count${i}`));
        }
        let level = 0;
        let box = document.getElementById(`level${level}`);
        while (box != null) {
            this.#settingBoxes.push(box);
            level++;
            box = document.getElementById(`level${level}`);
        }
        this.#dependCheck = document.getElementById(`level${level - 1}`);
        this.#solver.initialize();

        // button events
        this.#solveButton.addEventListener("click", this.#solve.bind(this));
        for (let i = 1; i <= 9; i++) {
            const key = document.getElementById(`key${i}`);
            key.addEventListener("click", this.#pressNumber.bind(this));
        }
        document.getElementById("erase").addEventListener("click", this.#eraseNumber.bind(this));
        document.getElementById("load").addEventListener("click", this.#load.bind(this));
        document.getElementById(`level${level - 2}`).addEventListener("change", this.#changeCheck.bind(this));

        // initial display
        this.#board.clear();
        const params = new URLSearchParams(window.location.search);
        if (params.has("data")) {
            const json = params.get("data");
            if (json != "") {
                this.#board.setData(json);
            }
        }
        this.#showCounters();
        this.#clearResult();
    }

    // select a cell
    #selectCell(e) {
        // deselect the current cell
        this.#board.drawBack(false);

        // get the cell position
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.#board.selectCell(x, y);

        // draw background
        this.#board.drawBack(true);
    }

    // press the number button
    #pressNumber(e) {
        // get the input value
        const value = parseInt(e.currentTarget.textContent, 10);
        this.#board.setSolidCell(value);

        // update results
        this.#showCounters();
        this.#clearResult();
    }

    // erase the number
    #eraseNumber(e) {
        this.#board.setSolidCell(0);
        this.#showCounters();
        this.#clearResult();
    }

    // solve the problem
    #solve(e) {
        this.#solveButton.disabled = true;
        this.#clearResult();

        // reset the board
        const solids = this.#board.logic.getSolidList();
        this.#board.clear();
        this.#board.setPattern(solids);
        this.#board.logic.setupCandidates();

        // set the selected method
        const levels = this.#settingBoxes.map(elem => elem.checked);

        // execute
        const initial = this.#board.logic.getCurrentStatus();
        const result = this.#solver.solve(this.#board.logic, levels);
        this.#setResult(initial, result);
        this.#solveButton.disabled = false;
    }

    // restore from text
    #load(e) {
        this.#clearResult();
        const data = this.#board.setData(this.#dataArea.value);
        if (data == null) {
            this.#consequence.textContent = "The text format is incorrect.";
            return;
        }
        this.#showCounters();
    }

    // change the checkbox
    #changeCheck(e) {
        this.#dependCheck.checked = false;
        this.#dependCheck.disabled = !e.currentTarget.checked;
    }

    // display the counter list
    #showCounters() {
        this.#board.getCounters(true).forEach((val, idx) => this.#countAreas[idx].textContent = val);
    }

    // clear the result
    #clearResult() {
        this.#consequence.textContent = "";
        this.#resultArea.textContent = "";
        this.#messageArea.textContent = "";
        this.#resultArea.appendChild(this.#messageArea);
    }

    // show the result
    #setResult(initial, result) {
        this.#board.redraw();
        this.#messageArea.classList.remove("valid");
        this.#messageArea.classList.add("invalid");
        if (result == null) {
            this.#messageArea.textContent = "There is an error in the settings.";
            return;
        }

        // show the message
        let message = "There ";
        switch (result.solutions.length) {
            case 0:
                // no solution
                message += "is no solution.";
                break;

            case 1:
                // one solution
                message += "is only one solution.";
                this.#messageArea.classList.remove("invalid");
                this.#messageArea.classList.add("valid");
                break;

            default:
                // multiple solutions
                message += `are ${result.solutions.length} solutions.`;
                break;
        }
        this.#messageArea.textContent = `${message}(${result.summary.join()})`;

        // generate a list of progress
        const progress = [ { "title": "Initial state, candidates are in [ ].", "table": initial } ];
        result.progress.forEach(elem => progress.push({ "title": `Method ${elem.depth}`, "table": elem.table }));
        if (1 < result.solutions.length) {
            result.solutions.forEach((val, idx) => progress.push({ "title": `Solution ${idx + 1}`, "table": val }));
        }

        // display progress
        for (const value of progress) {
            const text = document.createElement("p");
            text.textContent = value.title;
            this.#resultArea.appendChild(text);
            const table = this.#convertTable(value.table);
            this.#resultArea.appendChild(table);
        }
    }

    // convert to a table
    #convertTable(rows) {
        // set the stylesheet class name
        const horizontal = [ "top", "middle", "bottom" ];
        const vertical = [ "left", "center", "right" ];

        // generate a table element
        const table = document.createElement("table");
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const hidx = i % 3;
            const tr = document.createElement("tr");
            for (let j = 0; j < row.length; j++) {
                const vidx = j % 3;
                const td = document.createElement("td");
                td.classList.add(horizontal[hidx]);
                td.classList.add(vertical[vidx]);
                if (Array.isArray(row[j])) {
                    td.textContent = `[${row[j].join()}]`;
                } else {
                    td.textContent = row[j];
                }
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        table.classList.add("border");
        return table;
    }

}

// start the controller
new Controller();

