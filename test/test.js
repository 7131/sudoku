// Sudoku test class
class SudokuTest extends TestTable {
    #logic;
    #solver;

    // constructor
    constructor(id, body, data) {
        super(id, body);
        super.generate(data);
        if (typeof ExtendedLogicalBoard == "function") {
            this.#logic = new ExtendedLogicalBoard();
        } else {
            this.#logic = new LogicalBoard();
        }
        if (typeof ExtendedSolver == "function") {
            this.#solver = new ExtendedSolver();
        } else {
            this.#solver = new Solver();
        }
        this.#solver.initialize();
    }

    // test start
    start(method) {
        super.clearCol("result");
        this.index = 0;
        setTimeout(this.#test.bind(this), 0, 0, []);
    }

    // execute test
    #test(index, errors) {
        if (index < this.dataCount) {
            // test row
            if (typeof this.progressEvent == "function") {
                this.progressEvent(index);
            }
            const message = this.#executeRow(index);
            if (message == "") {
                super.setText(index, "result", "OK");
            } else {
                super.setText(index, "result", message, "error");
                errors.push(index + 1);
            }
            setTimeout(this.#test.bind(this), 0, index + 1, errors);
        } else {
            // result row
            if (errors.length == 0) {
                super.setFoot("result", "All OK");
            } else {
                super.setFoot("result", `NG: ${errors.join()}`, "error");
            }
            if (typeof this.completeEvent == "function") {
                this.completeEvent();
            }
        }
    }

    // execute by row
    #executeRow(index) {
        const params = JSON.parse(super.getText(index, "params"));
        const expect = JSON.parse(super.getText(index, "expect"));
        this.#logic.initialize();
        this.#logic.setSolidList(params.pattern);
        this.#logic.setupCandidates();

        // run the solver
        const actual = this.#solver.solve(this.#logic);
        if (actual == null) {
            return "Could not be resolved.";
        }

        // judgement of results
        let message = this.#getDifference("progress", expect.progress, actual.progress);
        if (message == "") {
            message = this.#getDifference("solutions", expect.solutions, actual.solutions);
            if (message == "") {
                message = this.#getDifference("summary", expect.summary, actual.summary);
                if (message == "") {
                    return "";
                }
            }
        }
        return `${message}\n${JSON.stringify(actual)}`;
    }

    // get the difference
    #getDifference(title, expect, actual) {
        if (!Array.isArray(expect) || !Array.isArray(actual)) {
            return `There is a difference in the ${title}.`;
        }

        // compare the number of elements in arrays
        const count = Math.min(expect.length, actual.length);
        if (count != Math.max(expect.length, actual.length)) {
            return `There is a difference in the number of ${title}.`;
        }

        // compare from the beginning
        for (let i = 0; i < count; i++) {
            if (!this.#areSameValues(expect[i], actual[i])) {
                return `There is a difference in the ${title} #${i + 1}`;
            }
        }
        return "";
    }

    // whether the values are the same
    #areSameValues(expect, actual) {
        // if both are arrays
        if (Array.isArray(expect) && Array.isArray(actual)) {
            if (expect.length != actual.length) {
                return false;
            }
            for (let i = 0; i < expect.length; i++) {
                if (!this.#areSameValues(expect[i], actual[i])) {
                    return false;
                }
            }
            return true;
        }

        // if both are objects
        if (typeof expect == "object" && typeof actual == "object") {
            const keys = Object.keys(expect).sort();
            if (!this.#areSameValues(keys, Object.keys(actual).sort())) {
                return false;
            }
            return keys.every(elem => this.#areSameValues(expect[elem], actual[elem]));
        }

        // others
        return expect === actual;
    }

}

// Controller class
class Controller {
    #tests = { "full": FullData, "partial": PartialData, "normal": NormalData };
    #buttons = new Map();

    // constructor
    constructor() {
        window.addEventListener("load", this.#initialize.bind(this));
    }

    // initialize the page
    #initialize(e) {
        for (const id in this.#tests) {
            const section = document.getElementById(id);
            if (section == null) {
                continue;
            }
            const table = section.querySelector("table");
            if (table == null || table.tBodies.length == 0) {
                continue;
            }
            const button = section.querySelector("button");

            // test settings
            const test = new SudokuTest(id, table.tBodies[0], this.#tests[id]);
            test.completeEvent = () => button.disabled = false;

            // get button
            button.addEventListener("click", this.#executeTest.bind(this));
            this.#buttons.set(button, test);
        }
    }

    // execute a test
    #executeTest(e) {
        const button = e.currentTarget;
        button.disabled = true;
        const instance = this.#buttons.get(button);
        instance.start();
    }

}

// start the controller
new Controller();

