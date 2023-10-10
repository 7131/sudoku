// Column number constants
const ColNum = {
    "NUMBER": 0,
    "TARGET": 1,
    "EXPECT": 2,
    "RESULT": 3,
}

// Controller class
const Controller = function() {
    // fields
    this._logic = new LogicalBoard();
    this._solver = new Solver();
    this._solver.initialize();

    // events
    window.addEventListener("load", this._initialize.bind(this), false);
}

// Controller prototype
Controller.prototype = {

    // initialize the private fields
    "_initialize": function() {
        // get the elements
        this._rows = document.getElementById("table").rows;
        for (let i = 1; i < this._rows.length; i++) {
            // No.
            const number = this._rows[i].cells[ColNum.NUMBER];
            number.innerText = i;
            number.className = "symbol";

            // expected values
            const expects = this._rows[i].cells[ColNum.EXPECT].childNodes;
            expects[0].id = "view-" + i;
            expects[0].addEventListener("click", this._show.bind(this), false);
            expects[1].htmlFor = expects[0].id;
            expects[2].id = "data-" + i;
        }

        // get the last row
        let last = this._rows[this._rows.length - 1];
        if (last.cells[ColNum.TARGET].innerText != "") {
            last = last.parentNode.appendChild(last.cloneNode(true));
        }
        last.cells[ColNum.NUMBER].innerText = "total";
        last.cells[ColNum.TARGET].innerText = "";
        last.cells[ColNum.EXPECT].innerText = "";
        last.cells[ColNum.RESULT].innerText = "";

        // button events
        this._button = document.getElementById("execute");
        this._button.addEventListener("click", this._start.bind(this), false);
    },

    // show or hide the result
    "_show": function(e) {
        // get the display area
        const check = e.currentTarget;
        const area = check.nextSibling.nextSibling;
        if (check.checked) {
            // show
            area.className = "";
        } else {
            // hide
            area.className = "hidden";
        }
    },

    // start all tests
    "_start": function(e) {
        this._button.disabled = true;

        // initialize table
        for (let i = 1; i < this._rows.length; i++) {
            this._rows[i].cells[ColNum.RESULT].innerText = "";
        }
        this._errors = [];

        // execute the first test
        this._index = 1;
        setTimeout(this._execute.bind(this), 10);
    },

    // execute a test
    "_execute": function() {
        // execute
        const row = this._rows[this._index];
        const problem = row.cells[ColNum.TARGET].innerText;
        const element = document.getElementById("data-" + this._index);
        const expect = element.innerText;
        const message = this._getResult(problem, expect);
        if (message == "") {
            row.cells[ColNum.RESULT].innerText = "OK";
            row.cells[ColNum.RESULT].className = "";
        } else {
            row.cells[ColNum.RESULT].innerText = message;
            row.cells[ColNum.RESULT].className = "error";
            this._errors.push(this._index);
        }

        // execute the next test
        this._index++;
        if (this._index < this._rows.length && this._rows[this._index].cells[ColNum.TARGET].innerText != "") {
            setTimeout(this._execute.bind(this), 10);
            return;
        }

        // finished
        let last = this._rows[this._rows.length - 1];
        if (this._errors.length == 0) {
            last.cells[ColNum.RESULT].innerText = "All OK";
        } else {
            last.cells[ColNum.RESULT].innerText = "NG : " + this._errors.join();
            last.cells[ColNum.RESULT].className = "error";
        }
        this._button.disabled = false;
    },

    // get the result message
    "_getResult": function(problem, expect) {
        // get the problem
        let data = {};
        try {
            data = JSON.parse(problem);
        } catch (ex) {
            return "Could not get the puzzle.";
        }

        // get the expected value
        let result = {};
        try {
            result = JSON.parse(expect);
        } catch (ex) {
        }

        // set the board
        this._logic.initialize();
        this._logic.setSolidList(data.pattern);
        this._logic.setupCandidates();

        // run the solver
        const actual = this._solver.solve(this._logic);
        if (actual == null) {
            return "Could not be resolved.";
        }

        // judgement of results
        let message = this._getDifference("progress", result.progress, actual.progress);
        if (message == "") {
            message = this._getDifference("solutions", result.solutions, actual.solutions);
            if (message == "") {
                message = this._getDifference("summary", result.summary, actual.summary);
                if (message == "") {
                    return "";
                }
            }
        }
        return message + "\n" + JSON.stringify(actual);
    },

    // get the difference
    "_getDifference": function(title, expect, actual) {
        // check the actual
        if (!Array.isArray(expect) || !Array.isArray(actual)) {
            return "There is a difference in the " + title + ".";
        }

        // compare the number of elements in arrays
        const count = Math.min(expect.length, actual.length);
        if (count != Math.max(expect.length, actual.length)) {
            return "There is a difference in the number of " + title + ".";
        }

        // compare from the beginning
        for (let i = 0; i < count; i++) {
            if (!this._areSameValues(expect[i], actual[i])) {
                return "There is a difference in the " + title + " #" + (i + 1);
            }
        }
        return "";
    },

    // whether the values are the same
    "_areSameValues": function(expect, actual) {
        // if both are arrays
        if (Array.isArray(expect) && Array.isArray(actual)) {
            if (expect.length != actual.length) {
                return false;
            }
            for (let i = 0; i < expect.length; i++) {
                if (!this._areSameValues(expect[i], actual[i])) {
                    return false;
                }
            }
            return true;
        }

        // if both are objects
        if (typeof expect == "object" && typeof actual == "object") {
            const keys = Object.keys(expect).sort();
            if (!this._areSameValues(keys, Object.keys(actual).sort())) {
                return false;
            }
            for (const key of keys) {
                if (!this._areSameValues(expect[key], actual[key])) {
                    return false;
                }
            }
            return true;
        }

        // others
        return expect === actual;
    },

}

// start the controller
new Controller();

