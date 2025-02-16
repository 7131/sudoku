// Controller class
const Controller = function() {
    // fields
    this._board = new PhysicalBoard(new LogicalBoard());
    this._solver = new Solver();
    this._solver.initialize();

    // events
    window.addEventListener("load", this._initialize.bind(this));
}

// Controller prototype
Controller.prototype = {

    // initialize the private fields and the page
    "_initialize": function(e) {
        // get the elements
        const canvas = document.getElementById("board");
        this._board.setCanvas(canvas, this._selectCell.bind(this));
        this._solveButton = document.getElementById("solve");
        this._resultArea = document.getElementById("result");
        this._messageArea = document.getElementById("message");
        this._dataArea = document.getElementById("data");
        this._countAreas = [];
        this._countAreas.push(document.getElementById("remain"));
        for (let i = 1; i <= 9; i++) {
            this._countAreas.push(document.getElementById("count" + i));
        }
        this._settingBoxes = [];
        let level = 0;
        let box = document.getElementById("level" + level);
        while (box != null) {
            this._settingBoxes.push(box);
            level++;
            box = document.getElementById("level" + level);
        }
        this._dependCheck = document.getElementById("level" + (level - 1));

        // button events
        this._solveButton.addEventListener("click", this._solve.bind(this));
        for (let i = 1; i <= 9; i++) {
            const key = document.getElementById("key" + i);
            key.addEventListener("click", this._pressNumber.bind(this));
        }
        document.getElementById("erase").addEventListener("click", this._eraseNumber.bind(this));
        document.getElementById("load").addEventListener("click", this._load.bind(this));
        document.getElementById("level" + (level - 2)).addEventListener("change", this._changeCheck.bind(this));

        // initial display
        this._board.clear();
        const params = new URLSearchParams(window.location.search);
        if (params.has("data")) {
            const json = params.get("data");
            if (json != "") {
                this._board.setData(json);
            }
        }
        this._showCounters();
        this._clearResult();
    },

    // select a cell
    "_selectCell": function(e) {
        // deselect the current cell
        this._board.drawBack(false);

        // get the cell position
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this._board.selectCell(x, y);

        // draw background
        this._board.drawBack(true);
    },

    // press the number button
    "_pressNumber": function(e) {
        // get the input value
        const value = parseInt(e.currentTarget.innerText, 10);
        this._board.setSolidCell(value);

        // update results
        this._showCounters();
        this._clearResult();
    },

    // erase the number
    "_eraseNumber": function(e) {
        this._board.setSolidCell(0);
        this._showCounters();
        this._clearResult();
    },

    // solve the problem
    "_solve": function(e) {
        this._solveButton.disabled = true;
        this._clearResult();

        // reset the board
        const solids = this._board.logic.getSolidList();
        this._board.clear();
        this._board.setPattern(solids);
        this._board.logic.setupCandidates();

        // set the selected method
        const levels = this._settingBoxes.map(elem => elem.checked);

        // execute
        const initial = this._board.logic.getCurrentStatus();
        const result = this._solver.solve(this._board.logic, levels);
        this._setResult(initial, result);
        this._solveButton.disabled = false;
    },

    // restore from text
    "_load": function(e) {
        const data = this._board.setData(this._dataArea.value);
        if (data == null) {
            alert("The text format is incorrect.");
            return;
        }
        this._showCounters();
        this._clearResult();
    },

    // change the checkbox
    "_changeCheck": function(e) {
        this._dependCheck.checked = false;
        this._dependCheck.disabled = !e.currentTarget.checked;
    },

    // display the counter list
    "_showCounters": function() {
        const counters = this._board.getCounters(true);
        for (let i = 0; i < counters.length; i++) {
            this._countAreas[i].innerHTML = counters[i];
        }
    },

    // clear the result
    "_clearResult": function() {
        this._resultArea.innerHTML = "";

        // set the message area
        this._messageArea.innerHTML = "&nbsp;";
        this._resultArea.appendChild(this._messageArea);
    },

    // show the result
    "_setResult": function(initial, result) {
        this._board.redraw();
        this._messageArea.classList.remove("valid");
        this._messageArea.classList.add("invalid");
        if (result == null) {
            this._messageArea.innerHTML = "There is an error in the settings.";
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
                this._messageArea.classList.remove("invalid");
                this._messageArea.classList.add("valid");
                break;

            default:
                // multiple solutions
                message += "are " + result.solutions.length + " solutions.";
                break;
        }
        this._messageArea.innerHTML = message + " (" + result.summary.join() + ")";

        // create a list of progress
        const progress = [ { "title": "Initial state, candidates are in [ ].", "table": initial } ];
        for (const value of result.progress) {
            progress.push({ "title": "Method " + value.depth, "table": value.table });
        }
        if (1 < result.solutions.length) {
            // when there are multiple solutions
            for (let i = 0; i < result.solutions.length; i++) {
                progress.push({ "title": "Solution " + (i + 1), "table": result.solutions[i] });
            }
        }

        // display progress
        for (const value of progress) {
            const text = document.createElement("p");
            text.innerHTML = value.title;
            this._resultArea.appendChild(text);
            const table = this._convertTable(value.table);
            this._resultArea.appendChild(table);
        }
    },

    // convert to a table
    "_convertTable": function(rows) {
        // set the stylesheet class name
        const horizontal = [ "top", "middle", "bottom" ];
        const vertical = [ "left", "center", "right" ];

        // create a table element
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
                    td.innerHTML = "[" + row[j] + "]";
                } else {
                    td.innerHTML = row[j];
                }
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        table.classList.add("border");
        return table;
    },

}

// start the controller
new Controller();

