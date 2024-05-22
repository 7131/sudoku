// Controller class
const Controller = function() {
    // fields
    this._board = new PhysicalBoard(new LogicalBoard());
    this._creator = new Creator();
    this._creator.initialize(Grids);

    // events
    window.addEventListener("load", this._initialize.bind(this));
}

// Controller prototype
Controller.prototype = {

    // initialize the private fields and the page
    "_initialize": function(e) {
        // get the elements
        const canvas = document.getElementById("board");
        this._board.setCanvas(canvas);
        this._createButton = document.getElementById("create");
        this._messageArea = document.getElementById("message");
        this._problemButton = document.getElementById("problem");
        this._countClues = document.getElementById("count_clues");
        this._startButton = document.getElementById("start");
        this._stopButton = document.getElementById("stop");
        this._countTry = document.getElementById("count_try");
        this._countCreate = document.getElementById("count_create");
        this._outputArea = document.getElementById("data_output");
        let group = document.getElementsByName("group0");
        this._dependRadios = document.getElementsByName("group1");
        let level = 2;
        let depend = document.getElementsByName("group" + level);
        while (0 < depend.length) {
            group = this._dependRadios;
            this._dependRadios = depend;
            level++;
            depend = document.getElementsByName("group" + level);
        }
        this._invalidRadio = group[0];

        // button events
        this._createButton.addEventListener("click", this._create.bind(this));
        this._problemButton.addEventListener("click", this._showProblem.bind(this));
        this._startButton.addEventListener("click", this._start.bind(this));
        this._stopButton.addEventListener("click", this._stop.bind(this));
        this._countClues.addEventListener("input", this._inputClues.bind(this));
        for (const radio of group) {
            radio.addEventListener("change", this._changeRadio.bind(this));
        }
        this._creator.progressEvent = this._showProgress.bind(this);
        this._creator.finishEvent = this._showResult.bind(this);
        this._creator.cancelEvent = this._canceled.bind(this);

        // range of conditions
        this._minClues = this._getInt(document.getElementById("min_clues").innerText);
        this._maxClues = this._getInt(document.getElementById("max_clues").innerText);
        this._countClues.min = this._minClues;
        this._countClues.max = this._maxClues;

        // initial display
        this._board.clear();
        this._problemButton.disabled = true;
        this._stopButton.disabled = true;
        this._setRadios(true);
    },

    // create one problem
    "_create": function(e) {
        this._output = 1;
        this._execute();
    },

    // show the problem on another page
    "_showProblem": function(e) {
        // check the data
        if (this._problems.length == 0) {
            this._problemButton.disabled = true;
            return;
        }

        // if there are too many problems, reduce to 8 or less
        const count = Math.min(this._problems.length, 8);
        const problems = [];
        for (let i = 0; i < count; i++) {
            problems.push(this._problems[i]);
        }

        // get the data
        const data = JSON.stringify(problems);
        window.open("./puzzle.html?data=" + data, "problem");
    },

    // create multiple problems
    "_start": function(e) {
        this._output = this._getInt(document.getElementById("count_output").value);
        this._execute();
    },

    // stop creating problems
    "_stop": function(e) {
        this._stopButton.disabled = true;
    },

    // input the number of clues
    "_inputClues": function(e) {
        const clues = this._getInt(this._countClues.value);
        if (clues < this._minClues || this._maxClues < clues) {
            // invalid
            this._countClues.className = "error";
        } else {
            // valid
            this._countClues.className = "";
        }
    },

    // select a radio button
    "_changeRadio": function(e) {
        this._setRadios(e.currentTarget == this._invalidRadio);
    },

    // execute creation
    "_execute": function() {
        // get the input values
        const clues = this._getInt(this._countClues.value);
        if (clues < this._minClues || this._maxClues < clues) {
            return;
        }
        const levels = this._getRadioGroup(0, false);
        const needs = this._getRadioGroup(2, true);

        // reset the board
        this._board.clear();
        this._board.logic.initialize();

        // initialize the page
        this._messageArea.innerText = "Running...";
        this._outputArea.value = "";
        this._countTry.innerText = 0;
        this._countCreate.innerText = 0;
        this._createButton.disabled = true;
        this._problemButton.disabled = true;
        this._startButton.disabled = true;
        this._stopButton.disabled = false;

        // start creation
        this._trial = 0;
        this._problems = [];
        this._creator.setClues(clues);
        this._creator.start(this._board.logic, levels, needs);
    },

    // get a list of radio button settings
    "_getRadioGroup": function(col, checked) {
        // process radio buttons in order
        const group = [];
        let row = 0;
        let radio = document.getElementById("group" + row + "_" + col);
        while (radio != null) {
            // set depending on whether or not there is checked
            group.push(radio.checked == checked);
            row++;
            radio = document.getElementById("group" + row + "_" + col);
        }
        return group;
    },

    // display progress
    "_showProgress": function(numbers, summary) {
        // check arguments
        this._trial++;
        this._countTry.innerText = this._trial.toLocaleString();
        if (numbers != null) {
            // valid data
            const now = new Date();
            const message = now.toLocaleString() + " (" + summary.join() + ")";
            const data = { "description": message, "pattern": numbers };
            this._problems.push(data);
            this._countCreate.innerText = this._problems.length.toLocaleString();
        }

        // check if finished
        if (0 < this._output && this._output <= this._problems.length) {
            this._stopButton.disabled = true;
        }
    },

    // show the result
    "_showResult": function(completed) {
        // show problems
        if (0 < this._problems.length) {
            this._board.setPattern(this._problems[0].pattern);
            this._outputArea.value = JSON.stringify(this._problems);
            this._problemButton.disabled = false;
        }

        // finalize
        this._messageArea.innerText = "";
        this._createButton.disabled = false;
        this._startButton.disabled = false;
        this._stopButton.disabled = true;
    },

    // whether it was canceled
    "_canceled": function() {
        return this._stopButton.disabled;
    },

    // set radio buttons
    "_setRadios": function(invalid) {
        // if it cannot be entered, select the first radio button
        if (invalid) {
            this._dependRadios[0].checked = true;
        }

        // set whether input is possible
        for (const radio of this._dependRadios) {
            radio.disabled = invalid;
        }
    },

    // get an integer value
    "_getInt": function(text) {
        const after = text.replace(/,/g, "");
        let number = parseInt(after, 10);
        if (isNaN(number)) {
            number = 0;
        }
        return number;
    },

}

// start the controller
new Controller();

