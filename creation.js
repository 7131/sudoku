// Controller class
class Controller {
    #board;
    #creator;
    #createButton;
    #messageArea;
    #problemButton;
    #countClues;
    #startButton;
    #stopButton;
    #countTry;
    #countCreate;
    #outputArea;
    #dependRadios;
    #invalidRadio;
    #minClues;
    #maxClues;
    #output = 1;
    #trial = 0;
    #problems = [];
    #now = new Date();

    // constructor
    constructor() {
        if (typeof ExtendedLogicalBoard == "function") {
            this.#board = new PhysicalBoard(new ExtendedLogicalBoard());
        } else {
            this.#board = new PhysicalBoard(new LogicalBoard());
        }
        if (typeof ExtendedCreator == "function") {
            this.#creator = new ExtendedCreator();
        } else {
            this.#creator = new Creator();
        }

        // events
        window.addEventListener("load", this.#initialize.bind(this));
    }

    // initialize the private fields and the page
    #initialize(e) {
        // get the elements
        const canvas = document.getElementById("board");
        this.#board.setCanvas(canvas);
        this.#createButton = document.getElementById("create");
        this.#messageArea = document.getElementById("message");
        this.#problemButton = document.getElementById("problem");
        this.#countClues = document.getElementById("count_clues");
        this.#startButton = document.getElementById("start");
        this.#stopButton = document.getElementById("stop");
        this.#countTry = document.getElementById("count_try");
        this.#countCreate = document.getElementById("count_create");
        this.#outputArea = document.getElementById("data_output");
        let group = document.getElementsByName("group0");
        this.#dependRadios = document.getElementsByName("group1");
        let level = 2;
        let depend = document.getElementsByName(`group${level}`);
        while (0 < depend.length) {
            group = this.#dependRadios;
            this.#dependRadios = depend;
            level++;
            depend = document.getElementsByName(`group${level}`);
        }
        this.#invalidRadio = group[0];
        this.#creator.initialize(Grids);

        // button events
        this.#createButton.addEventListener("click", this.#create.bind(this));
        this.#problemButton.addEventListener("click", this.#showProblem.bind(this));
        this.#startButton.addEventListener("click", this.#start.bind(this));
        this.#stopButton.addEventListener("click", this.#stop.bind(this));
        this.#countClues.addEventListener("input", this.#inputClues.bind(this));
        group.forEach(elem => elem.addEventListener("change", this.#changeRadio.bind(this)));
        this.#creator.progressEvent = this.#showProgress.bind(this);
        this.#creator.finishEvent = this.#showResult.bind(this);
        this.#creator.cancelEvent = this.#canceled.bind(this);

        // range of conditions
        this.#minClues = this.#getInt(document.getElementById("min_clues").textContent);
        this.#maxClues = this.#getInt(document.getElementById("max_clues").textContent);
        this.#countClues.min = this.#minClues;
        this.#countClues.max = this.#maxClues;

        // initial display
        this.#board.clear();
        this.#problemButton.disabled = true;
        this.#stopButton.disabled = true;
        this.#setRadios(true);
    }

    // create one problem
    #create(e) {
        this.#output = 1;
        this.#execute();
    }

    // show the problem on another page
    #showProblem(e) {
        // check the data
        if (this.#problems.length == 0) {
            this.#problemButton.disabled = true;
            return;
        }

        // get the data
        const count = Math.min(this.#problems.length, 8);
        const data = JSON.stringify(this.#problems.slice(0, count));
        window.open(`./puzzle.html?data=${data}`, "problem");
    }

    // create multiple problems
    #start(e) {
        this.#output = this.#getInt(document.getElementById("count_output").value);
        this.#execute();
    }

    // stop creating problems
    #stop(e) {
        this.#stopButton.disabled = true;
    }

    // input the number of clues
    #inputClues(e) {
        const clues = this.#getInt(this.#countClues.value);
        if (clues < this.#minClues || this.#maxClues < clues) {
            // invalid
            this.#countClues.classList.add("error");
        } else {
            // valid
            this.#countClues.classList.remove("error");
        }
    }

    // select a radio button
    #changeRadio(e) {
        this.#setRadios(e.currentTarget == this.#invalidRadio);
    }

    // execute creation
    #execute() {
        // get the input values
        const clues = this.#getInt(this.#countClues.value);
        if (clues < this.#minClues || this.#maxClues < clues) {
            return;
        }
        const levels = this.#getRadioGroup(0, false);
        const needs = this.#getRadioGroup(2, true);

        // reset the board
        this.#board.clear();
        this.#board.logic.initialize();

        // initialize the page
        this.#messageArea.textContent = "Running...";
        this.#outputArea.value = "";
        this.#countTry.textContent = 0;
        this.#countCreate.textContent = 0;
        this.#createButton.disabled = true;
        this.#problemButton.disabled = true;
        this.#startButton.disabled = true;
        this.#stopButton.disabled = false;

        // start creation
        this.#trial = 0;
        this.#problems = [];
        this.#now = new Date();
        this.#creator.setClues(clues);
        this.#creator.start(this.#board.logic, levels, needs);
    }

    // get a list of radio button settings
    #getRadioGroup(col, checked) {
        // process radio buttons in order
        const group = [];
        let row = 0;
        let radio = document.getElementById(`group${row}_${col}`);
        while (radio != null) {
            // set depending on whether or not there is checked
            group.push(radio.checked == checked);
            row++;
            radio = document.getElementById(`group${row}_${col}`);
        }
        return group;
    }

    // display progress
    #showProgress(numbers, summary) {
        // check arguments
        this.#trial++;
        this.#countTry.textContent = this.#trial.toLocaleString();
        if (numbers != null) {
            // valid data
            let name = this.#getDateString(this.#now);
            if (1 < this.#output) {
                name += `_${this.#problems.length + 1}`;
            }
            const message = `${name} (${summary.join()})`;
            const data = { "description": message, "pattern": numbers };
            this.#problems.push(data);
            this.#countCreate.textContent = this.#problems.length.toLocaleString();
        }

        // check if finished
        if (0 < this.#output && this.#output <= this.#problems.length) {
            this.#stopButton.disabled = true;
        }
    }

    // show the result
    #showResult(completed) {
        // show problems
        if (0 < this.#problems.length) {
            this.#board.setPattern(this.#problems[0].pattern);
            this.#outputArea.value = JSON.stringify(this.#problems);
            this.#problemButton.disabled = false;
        }

        // finalize
        this.#messageArea.textContent = "";
        this.#createButton.disabled = false;
        this.#startButton.disabled = false;
        this.#stopButton.disabled = true;
    }

    // whether it was canceled
    #canceled() {
        return this.#stopButton.disabled;
    }

    // set radio buttons
    #setRadios(invalid) {
        // if it cannot be entered, select the first radio button
        if (invalid) {
            this.#dependRadios[0].checked = true;
        }

        // set whether input is possible
        this.#dependRadios.forEach(elem => elem.disabled = invalid);
    }

    // get the integer value
    #getInt(text) {
        const after = text.replace(/,/g, "");
        let number = parseInt(after, 10);
        if (isNaN(number)) {
            number = 0;
        }
        return number;
    }

    // get the date string
    #getDateString(date) {
        const month = `0${date.getMonth() + 1}`.slice(-2);
        const day = `0${date.getDate()}`.slice(-2);
        const hour = `0${date.getHours()}`.slice(-2);
        const minute = `0${date.getMinutes()}`.slice(-2);
        const second = `0${date.getSeconds()}`.slice(-2);
        return `${date.getFullYear()}${month}${day}_${hour}${minute}${second}`;
    }

}

// start the controller
new Controller();

