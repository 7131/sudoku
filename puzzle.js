// Controller class
const Controller = function() {
    // get the query string
    let data = null;
    if (window.location.search != "") {
        const results = window.location.search.match(/[?&]data=([^&#]*)/);
        if (2 <= results.length) {
            // get a JSON string
            const json = decodeURIComponent(results[1].replace(/\+/g, " "));
            try {
                data = JSON.parse(json);
                if (!Array.isArray(data)) {
                    data = [ data ];
                }
            } catch (ex) {
            }
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
    window.addEventListener("load", this._initialize.bind(this), false);
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
            this._countAreas.push(document.getElementById("count" + i));
        }

        // set up a problem list
        const title = document.createElement("option");
        title.value = 0;
        title.selected = true;
        title.innerHTML = "Select...";
        this._problemSelector.innerHTML = "";
        this._problemSelector.appendChild(title);
        for (let i = 1; i <= this._problems.length; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.innerHTML = i;
            this._problemSelector.appendChild(option);
        }

        // button events
        document.getElementById("display").addEventListener("click", this._display.bind(this), false);
        document.getElementById("save").addEventListener("click", this._save.bind(this), false);
        document.getElementById("load").addEventListener("click", this._load.bind(this), false);
        const types = [ "decision", "candidate" ];
        for (let i = 0; i < types.length; i++) {
            const radio = document.getElementById(types[i]);
            radio.addEventListener("change", this._changeRadio.bind(this), false);
        }
        this._type = types[0];
        this._keyTable.className = this._type;
        for (let i = 1; i <= 9; i++) {
            const key = document.getElementById("key" + i);
            key.addEventListener("click", this._pressNumber.bind(this), false);
        }
        this._eraseButton.addEventListener("click", this._eraseNumber.bind(this), false);
        this._judgeButton.addEventListener("click", this._judge.bind(this), false);
        this._problemSelector.addEventListener("change", this._selectProblem.bind(this), false);

        // initial display
        this._board.clear();
        this._index = -1;
        if (this._problems.length == 1) {
            this._index = 0;
            this._problemSelector.value = 1;
            this._descriptionArea.innerHTML = this._problems[this._index].description;
            this._board.setPattern(this._problems[this._index].pattern);
        }
        this._showCounters();
        this._clearResult();
    },

    // select a problem
    "_selectProblem": function(e) {
        this._index = parseInt(this._problemSelector.value, 10) - 1;
        if (0 <= this._index && this._index < this._problems.length) {
            this._descriptionArea.innerHTML = this._problems[this._index].description;
        } else {
            this._descriptionArea.innerHTML = "";
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
        this._type = e.currentTarget.id;
        this._keyTable.className = this._type;
        if (this._type == "candidate") {
            // candidate
            this._eraseButton.innerHTML = "#";
        } else {
            // decision
            this._eraseButton.innerHTML = "&nbsp;";
        }
    },

    // press the number button
    "_pressNumber": function(e) {
        // get the input value
        const value = parseInt(e.currentTarget.innerText, 10);
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
            for (let i = 0; i < indexes.length; i++) {
                this._board.drawCross(indexes[i]);
            }
        } else if (!this._board.logic.isFixed()) {
            reason = "There are unfilled cells.";
        }

        // show the result
        if (reason == "") {
            this._resultArea.className = "valid";
            this._resultArea.innerHTML = "Correct";
        } else {
            this._resultArea.className = "invalid";
            this._resultArea.innerHTML = "Incorrect (" + reason + ")";
        }
        this._judgeButton.disabled = true;
    },

    // output to text
    "_save": function(e) {
        let title = "Data";
        if (0 <= this._index && this._index < this._problems.length) {
            title = "Puzzle " + (this._index + 1);
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
            this._descriptionArea.innerHTML = "(No title)";
        } else {
            this._descriptionArea.innerHTML = data.description;
        }
        this._showCounters();
        this._clearResult();
    },

    // display the counter list
    "_showCounters": function() {
        const counters = this._board.getCounters();
        for (let i = 0; i < counters.length; i++) {
            this._countAreas[i].innerHTML = counters[i];
        }
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

