// Controller class
const Controller = function() {
    // get the query string
    let data;
    const params = new URLSearchParams(window.location.search);
    if (params.has("data")) {
        try {
            data = JSON.parse(params.get("data"));
            if (!Array.isArray(data)) {
                data = [ data ];
            }
        } catch (ex) {
        }
    }
    if (Array.isArray(data)) {
        this._problems = data;
    } else {
        this._problems = Problems;
    }

    // fields
    this._board = new PhysicalBoard(new LogicalBoard());

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
        this._problemSelector = document.getElementById("problem");
        this._descriptionArea = document.getElementById("description");
        this._keyTable = document.getElementById("key");
        this._eraseButton = document.getElementById("erase");
        this._judgeButton = document.getElementById("judge");
        this._resultArea = document.getElementById("result");
        this._dataArea = document.getElementById("data");
        this._countAreas = [];
        this._countAreas.push(document.getElementById("remain"));
        for (let i = 1; i <= 9; i++) {
            this._countAreas.push(document.getElementById(`count${i}`));
        }

        // set up a problem list
        const title = document.createElement("option");
        title.value = 0;
        title.selected = true;
        title.textContent = "Select...";
        this._problemSelector.textContent = "";
        this._problemSelector.appendChild(title);
        for (let i = 1; i <= this._problems.length; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            this._problemSelector.appendChild(option);
        }

        // button events
        document.getElementById("display").addEventListener("click", this._display.bind(this));
        document.getElementById("save").addEventListener("click", this._save.bind(this));
        document.getElementById("load").addEventListener("click", this._load.bind(this));
        const types = [ "decision", "candidate" ];
        types.forEach(elem => document.getElementById(elem).addEventListener("change", this._changeRadio.bind(this)));
        this._type = types[0];
        for (let i = 1; i <= 9; i++) {
            const key = document.getElementById(`key${i}`);
            key.addEventListener("click", this._pressNumber.bind(this));
        }
        this._eraseButton.addEventListener("click", this._eraseNumber.bind(this));
        this._judgeButton.addEventListener("click", this._judge.bind(this));
        this._problemSelector.addEventListener("change", this._selectProblem.bind(this));

        // initial display
        this._board.clear();
        this._index = -1;
        if (this._problems.length == 1) {
            this._index = 0;
            this._problemSelector.value = 1;
            this._descriptionArea.textContent = this._problems[this._index].description;
            this._board.setPattern(this._problems[this._index].pattern);
        }
        this._showCounters();
        this._clearResult();
    },

    // select a problem
    "_selectProblem": function(e) {
        this._index = parseInt(this._problemSelector.value, 10) - 1;
        if (0 <= this._index && this._index < this._problems.length) {
            this._descriptionArea.textContent = this._problems[this._index].description;
        } else {
            this._descriptionArea.textContent = "";
        }
    },

    // display a problem
    "_display": function(e) {
        if (0 <= this._index && this._index < this._problems.length) {
            this._board.setPattern(this._problems[this._index].pattern);
        } else {
            this._board.setPattern([]);
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
        this._board.selectCell(x, y, true);
        if (this._board.isSolidCell()) {
            return;
        }

        // draw background
        this._board.drawBack(true);
    },

    // select a radio button
    "_changeRadio": function(e) {
        // check the status
        if (!e.currentTarget.checked) {
            return;
        }

        // set the status
        this._keyTable.classList.remove(this._type);
        this._type = e.currentTarget.id;
        this._keyTable.classList.add(this._type);
        if (this._type == "candidate") {
            // candidate
            this._eraseButton.textContent = "#";
        } else {
            // decision
            this._eraseButton.innerHTML = "&nbsp;";
        }
    },

    // press the number button
    "_pressNumber": function(e) {
        // get the input value
        const value = parseInt(e.currentTarget.textContent, 10);
        if (this._type == "candidate") {
            // candidate
            this._board.toggleCandidate(value);
        } else {
            // decision
            this._board.setNumberCell(value);
        }

        // update results
        this._showCounters();
        this._clearResult();
    },

    // erase the number
    "_eraseNumber": function(e) {
        // get the status
        if (this._type == "candidate") {
            // candidate
            this._board.resetCandidate();
        } else {
            // decision
            this._board.setNumberCell(0);
        }

        // update results
        this._showCounters();
        this._clearResult();
    },

    // judge the result
    "_judge": function(e) {
        // get incorrect cells
        const indexes = this._board.logic.getIncorrectIndexes();
        let reason = "";
        if (0 < indexes.length) {
            reason = "There are mistakes in the numbers.";
            indexes.forEach(this._board.drawCross, this._board);
        } else if (!this._board.logic.isFixed()) {
            reason = "There are unfilled cells.";
        }

        // show the result
        if (reason == "") {
            this._resultArea.classList.remove("invalid");
            this._resultArea.classList.add("valid");
            this._resultArea.textContent = "Correct";
        } else {
            this._resultArea.classList.remove("valid");
            this._resultArea.classList.add("invalid");
            this._resultArea.textContent = `Incorrect (${reason})`;
        }
        this._judgeButton.disabled = true;
    },

    // output to text
    "_save": function(e) {
        let title = "Data";
        if (0 <= this._index && this._index < this._problems.length) {
            title = `Puzzle ${this._index + 1}`;
        }
        this._dataArea.value = this._board.getData(title, true);
    },

    // restore from text
    "_load": function(e) {
        // grid data
        const data = this._board.setData(this._dataArea.value, true);
        if (data == null) {
            alert("The text format is incorrect.");
            return;
        }

        // title
        if (data.description == null) {
            this._descriptionArea.textContent = "(No title)";
        } else {
            this._descriptionArea.textContent = data.description;
        }
        this._showCounters();
        this._clearResult();
    },

    // display the counter list
    "_showCounters": function() {
        this._board.getCounters().forEach((val, idx) => this._countAreas[idx].textContent = val);
    },

    // clear the result
    "_clearResult": function() {
        if (this._judgeButton.disabled) {
            this._board.redraw(true);
        }
        this._resultArea.innerHTML = "&nbsp;";
        this._judgeButton.disabled = false;
    },

}

// start the controller
new Controller();

