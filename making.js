// Controller class
const Controller = function() {
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
        this._keyTable = document.getElementById("key");
        this._eraseButton = document.getElementById("erase");
        this._dataArea = document.getElementById("data");
        this._countAreas = [];
        this._countAreas.push(document.getElementById("remain"));
        for (let i = 1; i <= 9; i++) {
            this._countAreas.push(document.getElementById("count" + i));
        }

        // button events
        document.getElementById("problem").addEventListener("click", this._showProblem.bind(this));
        document.getElementById("solution").addEventListener("click", this._showSolver.bind(this));
        document.getElementById("save").addEventListener("click", this._save.bind(this));
        document.getElementById("load").addEventListener("click", this._load.bind(this));
        const types = [ "solid", "decision", "candidate" ];
        types.forEach(elem => document.getElementById(elem).addEventListener("change", this._changeRadio.bind(this)));
        this._type = types[0];
        for (let i = 1; i <= 9; i++) {
            const key = document.getElementById("key" + i);
            key.addEventListener("click", this._pressNumber.bind(this));
        }
        this._eraseButton.addEventListener("click", this._eraseNumber.bind(this));

        // initial display
        this._board.clear();
        this._showCounters();
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
        switch (this._type) {
            case "decision":
                // decision
                this._eraseButton.innerHTML = "&nbsp;";
                break;

            case "candidate":
                // candidate
                this._eraseButton.innerHTML = "#";
                break;

            default:
                // solid
                this._eraseButton.innerHTML = "X";
                break;
        }
    },

    // press the number button
    "_pressNumber": function(e) {
        // get the input value
        const value = parseInt(e.currentTarget.innerText, 10);
        switch (this._type) {
            case "decision":
                // decision
                this._board.setNumberCell(value);
                break;

            case "candidate":
                // candidate
                this._board.toggleCandidate(value);
                break;

            default:
                // solid
                this._board.setSolidCell(value);
                break;
        }

        // update counters
        this._showCounters();
    },

    // erase the number
    "_eraseNumber": function(e) {
        switch (this._type) {
            case "decision":
                // decision
                this._board.setNumberCell(0);
                break;

            case "candidate":
                // candidate
                this._board.resetCandidate();
                break;

            default:
                // solid
                this._board.setSolidCell(-1);
                break;
        }

        // update counters
        this._showCounters();
    },

    // show the problem on another page
    "_showProblem": function(e) {
        const data = this._board.getData();
        window.open("./puzzle.html?data=" + data, "problem");
    },

    // show the solution page
    "_showSolver": function(e) {
        const data = this._board.getData();
        window.open("./solution.html?data=" + data, "solution");
    },

    // output to text
    "_save": function(e) {
        this._dataArea.value = this._board.getData(null, true, true);
    },

    // restore from text
    "_load": function(e) {
        // grid data
        const data = this._board.setData(this._dataArea.value, true, true);
        if (data == null) {
            alert("The text format is incorrect.");
            return;
        }

        // update counters
        this._showCounters();
    },

    // display the counter list
    "_showCounters": function() {
        const counters = this._board.getCounters();
        for (let i = 0; i < counters.length; i++) {
            this._countAreas[i].innerHTML = counters[i];
        }
    },

}

// start the controller
new Controller();

