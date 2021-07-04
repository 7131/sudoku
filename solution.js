// Controller class
const Controller = function() {
    // get the query string
    this._json = "";
    if (window.location.search != "") {
        let results = window.location.search.match(/[?&]data=([^&#]*)/);
        if (2 <= results.length) {
            this._json = decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    }

    // fields
    this._board = new PhysicalBoard(new LogicalBoard());
    this._solver = new Solver();
    this._solver.initialize();

    // events
    window.addEventListener("load", this._initialize.bind(this), false);
}

// Controller prototype
Controller.prototype = {

    // initialize the private fields and the page
    "_initialize": function(e) {
        // get the elements
        let canvas = document.getElementById("board");
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
        let level = 1;
        let box = document.getElementById("level" + level);
        while (box != null) {
            this._settingBoxes.push(box);
            level++;
            box = document.getElementById("level" + level);
        }
        this._dependCheck = document.getElementById("level" + (level - 1));

        // button events
        this._solveButton.addEventListener("click", this._solve.bind(this), false);
        for (let i = 1; i <= 9; i++) {
            let key = document.getElementById("key" + i);
            key.addEventListener("click", this._pressNumber.bind(this), false);
        }
        document.getElementById("erase").addEventListener("click", this._eraseNumber.bind(this), false);
        document.getElementById("load").addEventListener("click", this._load.bind(this), false);
        document.getElementById("level" + (level - 2)).addEventListener("change", this._changeCheck.bind(this), false);

        // initial display
        this._board.clear();
        if (this._json != "") {
            this._board.setData(this._json);
        }
        this._showCounters();
        this._clearResult();
    },

    // select a cell
    "_selectCell": function(e) {
        // deselect the current cell
        this._board.drawBack(false);

        // get the cell position
        let rect = e.currentTarget.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        this._board.selectCell(x, y);

        // draw background
        this._board.drawBack(true);
    },

    // press the number button
    "_pressNumber": function(e) {
        // get the input value
        let value = parseInt(e.currentTarget.innerText, 10);
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
        let solids = this._board.logic.getSolidList();
        this._board.clear();
        this._board.setPattern(solids);
        this._board.logic.setupCandidates();

        // set the selected method
        const selector = function(elem) { return elem.checked; };
        let levels = this._settingBoxes.map(selector);

        // execute
        let initial = this._board.logic.getCurrentStatus();
        let result = this._solver.solve(this._board.logic, levels);
        this._setResult(initial, result);
        this._solveButton.disabled = false;
    },

    // restore from text
    "_load": function(e) {
        let data = this._board.setData(this._dataArea.value);
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
        let counters = this._board.getCounters(true);
        for (let i = 0; i < counters.length; i++) {
            this._countAreas[i].innerHTML = counters[i];
        }
    },

    // clear the result
    "_clearResult": function() {
        this._resultArea.innerHTML = "";

        // set the message area
        this._messageArea.className = "";
        this._messageArea.innerHTML = "&nbsp;";
        this._resultArea.appendChild(this._messageArea);
    },

    // show the result
    "_setResult": function(initial, result) {
        this._board.redraw();

        // show the message
        let name = "invalid";
        let message = "There ";
        switch (result.solutions.length) {
            case 0:
                // no solution
                message += "is no solution.";
                break;

            case 1:
                // one solution
                name = "valid";
                message += "is only one solution.";
                break;

            default:
                // multiple solutions
                message += "are " + result.solutions.length + " solutions.";
                break;
        }
        this._messageArea.className = name;
        this._messageArea.innerHTML = message + " (" + result.summary.join() + ")";

        // create a list of progress
        let progress = [ { "title": "Initial state, candidates are in [ ].", "table": initial } ];
        for (let i = 0; i < result.progress.length; i++) {
            progress.push({ "title": "Method " + (result.progress[i].depth + 1), "table": result.progress[i].table });
        }
        if (1 < result.solutions.length) {
            // when there are multiple solutions
            progress.pop();
            for (let i = 0; i < result.solutions.length; i++) {
                progress.push({ "title": "Solution " + (i + 1), "table": result.solutions[i] });
            }
        }

        // display progress
        for (let i = 0; i < progress.length; i++) {
            let text = document.createElement("p");
            text.innerHTML = progress[i].title;
            this._resultArea.appendChild(text);
            let table = this._convertTable(progress[i].table);
            table.className = "border";
            this._resultArea.appendChild(table);
        }
    },

    // convert to a table
    "_convertTable": function(rows) {
        // set the stylesheet class name
        let horizontal = [ "top", "middle", "bottom" ];
        let vertical = [ "left", "center", "right" ];

        // create a table element
        let table = document.createElement("table");
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            let hidx = i % 3;
            let tr = document.createElement("tr");
            for (let j = 0; j < row.length; j++) {
                let vidx = j % 3;
                let td = document.createElement("td");
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
        return table;
    },

}

// start the controller
new Controller();

