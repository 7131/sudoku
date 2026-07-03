// Controller class
class Controller {
    #problems;
    #board;
    #problemSelector;
    #descriptionArea;
    #displayButton;
    #keyTable;
    #eraseButton;
    #judgeButton;
    #resultArea;
    #dataArea;
    #consequence;
    #countAreas = [];
    #type = "decision";
    #index = -1;

    // constructor
    constructor() {
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
            this.#problems = data;
        } else {
            this.#problems = Problems;
        }

        // fields
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
        this.#problemSelector = document.getElementById("problem");
        this.#descriptionArea = document.getElementById("description");
        this.#displayButton = document.getElementById("display");
        this.#keyTable = document.getElementById("key");
        this.#eraseButton = document.getElementById("erase");
        this.#judgeButton = document.getElementById("judge");
        this.#resultArea = document.getElementById("result");
        this.#dataArea = document.getElementById("data");
        this.#consequence = document.getElementById("consequence");
        this.#countAreas.push(document.getElementById("remain"));
        for (let i = 1; i <= 9; i++) {
            this.#countAreas.push(document.getElementById(`count${i}`));
        }

        // set up a problem list
        const title = document.createElement("option");
        title.value = 0;
        title.selected = true;
        title.textContent = "Select...";
        this.#problemSelector.textContent = "";
        this.#problemSelector.appendChild(title);
        for (let i = 1; i <= this.#problems.length; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            this.#problemSelector.appendChild(option);
        }

        // button events
        const types = [ "decision", "candidate" ];
        types.forEach(elem => document.getElementById(elem).addEventListener("change", this.#changeRadio.bind(this)));
        for (let i = 1; i <= 9; i++) {
            const key = document.getElementById(`key${i}`);
            key.addEventListener("click", this.#pressNumber.bind(this));
        }
        this.#displayButton.addEventListener("click", this.#display.bind(this));
        this.#eraseButton.addEventListener("click", this.#eraseNumber.bind(this));
        this.#judgeButton.addEventListener("click", this.#judge.bind(this));
        this.#problemSelector.addEventListener("change", this.#selectProblem.bind(this));
        document.getElementById("save").addEventListener("click", this.#save.bind(this));
        document.getElementById("load").addEventListener("click", this.#load.bind(this));

        // initial display
        this.#board.clear();
        if (this.#problems.length == 1) {
            this.#index = 0;
            this.#problemSelector.value = 1;
            this.#descriptionArea.textContent = this.#problems[this.#index].description;
            this.#board.setPattern(this.#problems[this.#index].pattern);
        }
        this.#displayButton.disabled = true;
        this.#showCounters();
        this.#clearResult();
    }

    // select a problem
    #selectProblem(e) {
        this.#index = parseInt(this.#problemSelector.value, 10) - 1;
        if (0 <= this.#index && this.#index < this.#problems.length) {
            this.#descriptionArea.textContent = this.#problems[this.#index].description;
            this.#displayButton.disabled = false;
        } else {
            this.#descriptionArea.textContent = "";
            this.#displayButton.disabled = true;
        }
    }

    // display a problem
    #display(e) {
        this.#board.setPattern(this.#problems[this.#index].pattern);
        this.#displayButton.disabled = true;
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
        this.#board.selectCell(x, y, true);
        if (this.#board.isSolidCell()) {
            return;
        }

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
        if (this.#type == "candidate") {
            // candidate
            this.#eraseButton.textContent = "#";
        } else {
            // decision
            this.#eraseButton.textContent = "";
        }
    }

    // press the number button
    #pressNumber(e) {
        // get the input value
        const value = parseInt(e.currentTarget.textContent, 10);
        if (this.#type == "candidate") {
            // candidate
            this.#board.toggleCandidate(value);
        } else {
            // decision
            this.#board.setNumberCell(value);
        }

        // update results
        this.#showCounters();
        this.#clearResult();
    }

    // erase the number
    #eraseNumber(e) {
        // get the status
        if (this.#type == "candidate") {
            // candidate
            this.#board.resetCandidate();
        } else {
            // decision
            this.#board.setNumberCell(0);
        }

        // update results
        this.#showCounters();
        this.#clearResult();
    }

    // judge the result
    #judge(e) {
        this.#clearResult();

        // get incorrect cells
        const indexes = this.#board.logic.getIncorrectIndexes();
        let reason = "";
        if (0 < indexes.length) {
            reason = "There are mistakes in the numbers.";
            indexes.forEach(this.#board.drawCross, this.#board);
        } else if (!this.#board.logic.isFixed()) {
            reason = "There are unfilled cells.";
        }

        // show the result
        if (reason == "") {
            this.#resultArea.classList.remove("invalid");
            this.#resultArea.classList.add("valid");
            this.#resultArea.textContent = "Correct";
        } else {
            this.#resultArea.classList.remove("valid");
            this.#resultArea.classList.add("invalid");
            this.#resultArea.textContent = `Incorrect (${reason})`;
        }
        this.#judgeButton.disabled = true;
    }

    // output to text
    #save(e) {
        let title = "Data";
        if (0 <= this.#index && this.#index < this.#problems.length) {
            title = `Puzzle ${this.#index + 1}`;
        }
        this.#dataArea.value = this.#board.getData(title, true);
        this.#clearResult();
    }

    // restore from text
    #load(e) {
        this.#clearResult();

        // grid data
        const data = this.#board.setData(this.#dataArea.value, true);
        if (data == null) {
            this.#consequence.textContent = "The text format is incorrect.";
            return;
        }
        this.#index = -1;
        this.#problemSelector.value = 0;
        this.#displayButton.disabled = true;

        // title
        if (data.description == null) {
            this.#descriptionArea.textContent = "(No title)";
        } else {
            this.#descriptionArea.textContent = data.description;
        }
        this.#showCounters();
    }

    // display the counter list
    #showCounters() {
        this.#board.getCounters().forEach((val, idx) => this.#countAreas[idx].textContent = val);
    }

    // clear the result
    #clearResult() {
        if (this.#judgeButton.disabled) {
            this.#board.redraw(true);
        }
        this.#resultArea.textContent = "";
        this.#consequence.textContent = "";
        this.#judgeButton.disabled = false;
    }

}

// start the controller
new Controller();

