# Sudoku

There are three types of sudoku puzzles: (full) siteswap sudoku, partial siteswap sudoku, and normal sudoku.
There are four applications for each type: to play puzzles, to use the automatic solution, to use the automatic creation, and to make new puzzles by yourself.
You can execute your favorite applications.

# File list

<dl>
  <dt>index.html</dt>
    <dd>This is the entrance page. Usually redirect to the page to play siteswap sudoku puzzles.</dd>
  <dt>default.css</dt>
    <dd>The style sheet for many pages.</dd>
  <dt>puzzle.js</dt>
    <dd>This is a controller that receives input from the puzzles page and outputs the results.</dd>
  <dt>logics.js</dt>
    <dd>Classes for valid numbers, candidate array, and sudoku logical board.</dd>
  <dt>physics.js</dt>
    <dd>Sudoku physical board class.</dd>
  <dt>solution.js</dt>
    <dd>This is a controller that receives input from the automatic solution page and outputs the results.</dd>
  <dt>solver.js</dt>
    <dd>Sudoku puzzle automatic solver and the solving methods it uses.</dd>
  <dt>creation.js</dt>
    <dd>This is a controller that receives input from the automatic creation page and outputs the results.</dd>
  <dt>creator.js</dt>
    <dd>Step-by-step sudoku puzzle automatic creator using the automatic solver.</dd>
  <dt>making.js</dt>
    <dd>This is a controller that receives input from the making puzzles page and outputs the results.</dd>
  <dt>test.css</dt>
    <dd>The style sheet for the test page.</dd>
  <dt>test.js</dt>
    <dd>This is a controller that receives input from the test page and outputs the results to the table.</dd>
  <dt>full / index.html</dt>
    <dd>This is the entrance page of siteswap sudoku applications. Usually redirect to the page to play siteswap sudoku puzzles.</dd>
  <dt>full / puzzle.html</dt>
    <dd>This is the page to play siteswap sudoku puzzles.</dd>
  <dt>full / problems.js</dt>
    <dd>A collection of siteswap sudoku puzzles.</dd>
  <dt>full / extensions.js</dt>
    <dd>Extend the default program by overwriting it for siteswap sudoku.</dd>
  <dt>full / solution.html</dt>
    <dd>This is the page to use the siteswap sudoku automatic solution.</dd>
  <dt>full / creation.html</dt>
    <dd>This is the page to use the siteswap sudoku automatic creation.</dd>
  <dt>full / grids.js</dt>
    <dd>All grids of siteswap sudoku.</dd>
  <dt>full / making.html</dt>
    <dd>This is the page to make new siteswap sudoku puzzles.</dd>
  <dt>full / test.html</dt>
    <dd>This is a page for testing the siteswap sudoku.</dd>
  <dt>normal / index.html</dt>
    <dd>This is the entrance page of normal sudoku applications. Usually redirect to the page to play normal sudoku puzzles.</dd>
  <dt>normal / puzzle.html</dt>
    <dd>This is the page to play normal sudoku puzzles.</dd>
  <dt>normal / problems.js</dt>
    <dd>A collection of normal sudoku puzzles.</dd>
  <dt>normal / extensions.js</dt>
    <dd>Extend the default program by overwriting it for normal sudoku.</dd>
  <dt>normal / solution.html</dt>
    <dd>This is the page to use the normal sudoku automatic solution.</dd>
  <dt>normal / creation.html</dt>
    <dd>This is the page to use the normal sudoku automatic creation.</dd>
  <dt>normal / grids.js</dt>
    <dd>Randomly selected 10,000 standard grids of normal sudoku.</dd>
  <dt>normal / making.html</dt>
    <dd>This is the page to make new normal sudoku puzzles.</dd>
  <dt>normal / test.html</dt>
    <dd>This is a page for testing the normal sudoku.</dd>
  <dt>partial / index.html</dt>
    <dd>This is the entrance page of partial siteswap sudoku applications. Usually redirect to the page to play partial siteswap sudoku puzzles.</dd>
  <dt>partial / puzzle.html</dt>
    <dd>This is the page to play partial siteswap sudoku puzzles.</dd>
  <dt>partial / problems.js</dt>
    <dd>A collection of partial siteswap sudoku puzzles.</dd>
  <dt>partial / extensions.js</dt>
    <dd>Extend the default program by overwriting it for partial siteswap sudoku.</dd>
  <dt>partial / solution.html</dt>
    <dd>This is the page to use the partial siteswap sudoku automatic solution.</dd>
  <dt>partial / creation.html</dt>
    <dd>This is the page to use the partial siteswap sudoku automatic creation.</dd>
  <dt>partial / grids.js</dt>
    <dd>All grids of partial siteswap sudoku except rotation match.</dd>
  <dt>partial / making.html</dt>
    <dd>This is the page to make new partial siteswap sudoku puzzles.</dd>
  <dt>partial / test.html</dt>
    <dd>This is a page for testing the partial siteswap sudoku.</dd>
  <dt>image / *.gif</dt>
    <dd>These are images explaining the rules of sudoku.</dd>
</dl>

