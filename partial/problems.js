const Problems = [
    {
        "description": "Puzzle 1 - You can solve this puzzle without any knowledge of siteswap.",
        "pattern": [
            0, 6, 0, 5, 0, 0, 8, 3, 0,
            0, 0, 0, 0, 7, 0, 0, 0, 0,
            7, 0, 3, 0, 0, 6, 0, 0, 9,
            0, 0, 4, 8, 3, 0, 2, 0, 1,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            1, 0, 6, 0, 5, 9, 7, 0, 0,
            8, 0, 0, 2, 0, 0, 5, 0, 4,
            0, 0, 0, 0, 4, 0, 0, 0, 0,
            0, 5, 9, 0, 0, 3, 0, 2, 0,
        ],
    },
    {
        "description": "Puzzle 2 - Knowledge of siteswap is required.",
        "pattern": [
            8, 0, 0, 0, 0, 7, 0, 0, 1,
            0, 0, 0, 0, 0, 1, 8, 3, 0,
            0, 9, 0, 8, 0, 0, 0, 0, 0,
            7, 5, 0, 0, 8, 0, 4, 0, 0,
            1, 0, 0, 0, 5, 0, 0, 0, 3,
            0, 0, 9, 0, 2, 0, 0, 5, 6,
            0, 0, 0, 0, 0, 8, 0, 1, 0,
            0, 7, 2, 9, 0, 0, 0, 0, 0,
            3, 0, 0, 6, 0, 0, 0, 0, 5,
        ],
    },
    {
        "description": "Puzzle 3 (2,0,0,0,0,0,0,0,0)",
        "pattern": [
            0, 0, 0, 2, 6, 0, 5, 0, 0,
            0, 0, 4, 0, 0, 0, 0, 0, 0,
            2, 0, 0, 0, 0, 4, 0, 6, 0,
            0, 0, 6, 0, 8, 0, 0, 0, 3,
            3, 0, 0, 6, 0, 5, 0, 0, 8,
            9, 0, 0, 0, 7, 0, 6, 0, 0,
            0, 7, 0, 9, 0, 0, 0, 0, 2,
            0, 0, 0, 0, 0, 0, 1, 0, 0,
            0, 0, 9, 0, 5, 3, 0, 0, 0,
        ],
    },
    {
        "description": "Puzzle 4 (3,1,0,0,0,0,0,0,0)",
        "pattern": [
            0, 0, 9, 0, 0, 0, 0, 8, 0,
            0, 1, 0, 2, 5, 0, 0, 3, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 1,
            0, 0, 0, 0, 0, 0, 0, 2, 0,
            0, 4, 0, 5, 8, 2, 0, 6, 0,
            0, 8, 0, 0, 0, 0, 0, 0, 0,
            9, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 7, 0, 0, 2, 5, 0, 9, 0,
            0, 2, 0, 0, 0, 0, 1, 0, 0,
        ],
    },
    {
        "description": "Puzzle 5 (4,1,1,0,0,0,0,0,0)",
        "pattern": [
            6, 0, 0, 0, 0, 0, 0, 0, 9,
            0, 0, 2, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 1, 0, 2, 6,
            0, 0, 1, 0, 0, 0, 9, 0, 0,
            0, 0, 0, 0, 2, 0, 0, 0, 0,
            0, 0, 4, 0, 0, 0, 3, 0, 0,
            7, 2, 0, 3, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 2, 0, 0,
            4, 0, 0, 0, 0, 0, 0, 0, 7,
        ],
    },
    {
        "description": "Puzzle 6 (9,1,1,1,0,0,0,0,0)",
        "pattern": [
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 2, 0, 0,
            0, 0, 0, 0, 0, 1, 0, 0, 9,
            0, 0, 3, 0, 0, 0, 0, 1, 4,
            0, 0, 0, 0, 6, 0, 0, 0, 0,
            8, 5, 0, 0, 0, 0, 6, 0, 0,
            9, 0, 0, 2, 0, 0, 0, 0, 0,
            0, 0, 4, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
    },
    {
        "description": "Puzzle 7 (5,2,2,1,2,0,0,0,0)",
        "pattern": [
            0, 0, 0, 0, 3, 0, 8, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 2, 0, 0, 5, 0, 0, 0, 0,
            1, 0, 0, 4, 0, 3, 0, 0, 6,
            0, 0, 0, 0, 8, 0, 0, 2, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 4, 0, 6, 0, 0, 0, 0,
        ],
    },
    {
        "description": "Puzzle 8 (3,1,1,0,2,1,0,0,0)",
        "pattern": [
            0, 0, 0, 0, 0, 0, 4, 9, 0,
            5, 1, 0, 0, 0, 0, 0, 3, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 5, 0, 0, 3, 0, 0, 0,
            0, 0, 0, 0, 7, 0, 0, 0, 0,
            0, 0, 0, 2, 0, 0, 9, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 2, 0, 0, 0, 0, 0, 4, 9,
            0, 5, 1, 0, 0, 0, 0, 0, 0,
        ],
    },
    {
        "description": "Puzzle 9 (3,1,2,1,2,0,1,0,0)",
        "pattern": [
            0, 0, 0, 0, 0, 0, 8, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            7, 0, 6, 0, 0, 0, 5, 0, 4,
            0, 0, 0, 9, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 4, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 2, 0, 0, 0,
            6, 0, 5, 0, 0, 0, 4, 0, 3,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 2, 0, 0, 0, 0, 0, 0,
        ],
    },
    {
        "description": "Puzzle 10 (4,0,2,2,1,0,0,1,0)",
        "pattern": [
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 9, 0, 0, 3,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            5, 0, 0, 8, 0, 0, 2, 6, 0,
            8, 0, 0, 2, 9, 7, 0, 0, 1,
            0, 3, 7, 0, 0, 1, 0, 0, 4,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            6, 0, 0, 9, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
    },
];

