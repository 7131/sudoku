// Controller class
class Controller {
    #board;
    #keyTable;
    #eraseButton;
    #dataArea;
    #consequence;
    #countAreas = [];
    #type = "solid";

    // constructor
    constructor() {
        if (typeof ExtendedLogicalBoard == "function") {
            this.#board = new PhysicalBoard(new ExtendedLogicalBoard());
        } else {
            this.#board = new PhysicalBoard(new LogicalBoard());
        }

        // events
        window.addEventListener("load", this.#initialize.bind(this));
    }

    // initialize the private fields and the page
    #initialize(e) {
        // get the elements
        const canvas = document.getElementById("board");
        this.#board.setCanvas(canvas, this.#selectCell.bind(this));
        this.#keyTable = document.getElementById("key");
        this.#eraseButton = document.getElementById("erase");
        this.#dataArea = document.getElementById("data");
        this.#consequence = document.getElementById("consequence");
        this.#countAreas.push(document.getElementById("remain"));
        for (let i = 1; i <= 9; i++) {
            this.#countAreas.push(document.getElementById(`count${i}`));
        }

        // button events
        document.getElementById("problem").addEventListener("click", this.#showProblem.bind(this));
        document.getElementById("solution").addEventListener("click", this.#showSolver.bind(this));
        document.getElementById("save").addEventListener("click", this.#save.bind(this));
        document.getElementById("load").addEventListener("click", this.#load.bind(this));
        const types = [ "solid", "decision", "candidate" ];
        types.forEach(elem => document.getElementById(elem).addEventListener("change", this.#changeRadio.bind(this)));
        for (let i = 1; i <= 9; i++) {
            const key = document.getElementById(`key${i}`);
            key.addEventListener("click", this.#pressNumber.bind(this));
        }
        this.#eraseButton.addEventListener("click", this.#eraseNumber.bind(this));

        // initial display
        this.#board.clear();
        this.#showCounters();
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

    // select a radio button
    #changeRadio(e) {
        // check the status
        if (!e.currentTarget.checked) {
            return;
        }

        // set the status
        this.#keyTable.classList.remove(this.#type);
        this.#type = e.currentTarget.id;
        this.#keyTable.classList.add(this.#type);
        switch (this.#type) {
            case "decision":
                // decision
                this.#eraseButton.textContent = "";
                break;

            case "candidate":
                // candidate
                this.#eraseButton.textContent = "#";
                break;

            default:
                // solid
                this.#eraseButton.textContent = "X";
                break;
        }
    }

    // press the number button
    #pressNumber(e) {
        // get the input value
        const value = parseInt(e.currentTarget.textContent, 10);
        switch (this.#type) {
            case "decision":
                // decision
                this.#board.setNumberCell(value);
                break;

            case "candidate":
                // candidate
                this.#board.toggleCandidate(value);
                break;

            default:
                // solid
                this.#board.setSolidCell(value);
                break;
        }

        // update the result
        this.#showCounters();
        this.#clearResult();
    }

    // erase the number
    #eraseNumber(e) {
        switch (this.#type) {
            case "decision":
                // decision
                this.#board.setNumberCell(0);
                break;

            case "candidate":
                // candidate
                this.#board.resetCandidate();
                break;

            default:
                // solid
                this.#board.setSolidCell(-1);
                break;
        }

        // update the result
        this.#showCounters();
        this.#clearResult();
    }

    // show the problem on another page
    #showProblem(e) {
        const data = this.#board.getData();
        window.open(`./puzzle.html?data=${data}`, "problem");
        this.#clearResult();
    }

    // show the solution page
    #showSolver(e) {
        const data = this.#board.getData();
        window.open(`./solution.html?data=${data}`, "solution");
        this.#clearResult();
    }

    // output to text
    #save(e) {
        this.#dataArea.value = this.#board.getData(null, true, true);
        this.#clearResult();
    }

    // restore from text
    #load(e) {
        this.#clearResult();
        const data = this.#board.setData(this.#dataArea.value, true, true);
        if (data == null) {
            this.#consequence.textContent = "The text format is incorrect.";
            return;
        }
        this.#showCounters();
    }

    // display the counter list
    #showCounters() {
        this.#board.getCounters().forEach((val, idx) => this.#countAreas[idx].textContent = val);
    }

    // clear the result
    #clearResult() {
        this.#consequence.textContent = "";
    }

}

// start the controller
new Controller();

