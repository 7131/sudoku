const Problems = [
    {
        "description": "Puzzle 1 (3,0,0,0,0,0,0,0)",
        "pattern": [
            0, 4, 0, 3, 0, 5, 0, 2, 0,
            3, 0, 0, 0, 2, 0, 0, 4, 8,
            7, 0, 9, 8, 0, 1, 0, 0, 0,
            4, 0, 0, 0, 0, 0, 8, 1, 7,
            0, 0, 0, 9, 0, 7, 0, 0, 0,
            5, 1, 7, 0, 0, 0, 0, 0, 2,
            0, 0, 0, 1, 0, 2, 9, 0, 6,
            2, 7, 0, 0, 9, 0, 0, 0, 1,
            0, 5, 0, 6, 0, 3, 0, 7, 0,
        ],
    },
    {
        "description": "Puzzle 2 (4,0,0,0,0,0,0,0)",
        "pattern": [
            3, 0, 0, 0, 4, 7, 8, 5, 0,
            4, 0, 0, 0, 0, 0, 9, 0, 0,
            0, 0, 7, 0, 3, 0, 0, 0, 0,
            8, 0, 0, 0, 0, 9, 7, 6, 0,
            2, 0, 4, 0, 0, 0, 5, 0, 3,
            0, 1, 6, 8, 0, 0, 0, 0, 2,
            0, 0, 0, 0, 9, 0, 6, 0, 0,
            0, 0, 2, 0, 0, 0, 0, 0, 8,
            0, 7, 3, 6, 1, 0, 0, 0, 9,
        ],
    },
    {
        "description": "Puzzle 3 (5,0,0,0,0,0,0,0)",
        "pattern": [
            6, 1, 0, 0, 0, 3, 0, 0, 8,
            5, 0, 0, 0, 7, 0, 0, 0, 3,
            0, 3, 8, 4, 6, 0, 0, 0, 0,
            9, 0, 0, 0, 0, 0, 0, 3, 0,
            7, 4, 0, 0, 1, 0, 0, 2, 6,
            0, 6, 0, 0, 0, 0, 0, 0, 4,
            0, 0, 0, 0, 3, 1, 6, 9, 0,
            1, 0, 0, 0, 2, 0, 0, 0, 5,
            3, 0, 0, 5, 0, 0, 0, 4, 7,
        ],
    },
    {
        "description": "Puzzle 4 (7,0,0,0,0,0,0,0)",
        "pattern": [
            0, 0, 8, 0, 9, 7, 1, 3, 0,
            1, 0, 6, 0, 0, 0, 9, 0, 0,
            4, 0, 0, 0, 0, 0, 0, 8, 2,
            8, 0, 0, 1, 0, 3, 0, 0, 0,
            0, 0, 0, 0, 4, 0, 0, 0, 0,
            0, 0, 0, 8, 0, 2, 0, 0, 9,
            5, 7, 0, 0, 0, 0, 0, 0, 8,
            0, 0, 2, 0, 0, 0, 7, 0, 1,
            0, 8, 4, 5, 7, 0, 3, 0, 0,
        ],
    },
    {
        "description": "Puzzle 5 (8,0,0,0,0,0,0,0)",
        "pattern": [
            0, 5, 0, 0, 0, 7, 2, 0, 0,
            7, 0, 0, 9, 0, 0, 0, 8, 0,
            1, 0, 0, 0, 0, 0, 4, 0, 6,
            0, 0, 0, 1, 0, 5, 0, 0, 7,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            5, 0, 0, 8, 0, 2, 0, 0, 0,
            9, 0, 4, 0, 0, 0, 0, 0, 5,
            0, 2, 0, 0, 0, 6, 0, 0, 3,
            0, 0, 3, 7, 0, 0, 0, 4, 0,
        ],
    },
    {
        "description": "Puzzle 6 (4,1,0,0,0,0,0,0)",
        "pattern": [
            0, 4, 7, 9, 0, 0, 0, 0, 5,
            0, 0, 0, 0, 0, 5, 0, 4, 3,
            3, 0, 5, 0, 4, 0, 0, 0, 0,
            0, 7, 0, 5, 0, 0, 0, 0, 9,
            1, 0, 8, 0, 3, 0, 6, 0, 7,
            5, 0, 0, 0, 0, 6, 0, 2, 0,
            0, 0, 0, 0, 6, 0, 9, 0, 8,
            2, 8, 0, 3, 0, 0, 0, 0, 0,
            6, 0, 0, 0, 0, 4, 5, 7, 0,
        ],
    },
    {
        "description": "Puzzle 7 (6,2,0,0,0,0,0,0)",
        "pattern": [
            0, 5, 6, 0, 0, 0, 0, 0, 2,
            0, 0, 0, 0, 0, 2, 0, 0, 0,
            9, 0, 0, 3, 8, 0, 4, 0, 7,
            6, 9, 0, 0, 0, 4, 1, 0, 0,
            0, 2, 0, 0, 0, 0, 0, 3, 0,
            0, 0, 3, 7, 0, 0, 0, 9, 6,
            4, 0, 5, 0, 6, 8, 0, 0, 9,
            0, 0, 0, 5, 0, 0, 0, 0, 0,
            2, 0, 0, 0, 0, 0, 5, 7, 0,
        ],
    },
    {
        "description": "Puzzle 8 (7,1,0,0,0,0,0,0)",
        "pattern": [
            0, 0, 0, 5, 7, 6, 0, 0, 0,
            7, 0, 1, 0, 0, 0, 0, 0, 0,
            0, 8, 9, 0, 0, 0, 7, 0, 0,
            8, 0, 0, 7, 0, 3, 0, 0, 9,
            4, 0, 0, 0, 9, 0, 0, 0, 2,
            3, 0, 0, 2, 0, 4, 0, 0, 5,
            0, 0, 4, 0, 0, 0, 6, 1, 0,
            0, 0, 0, 0, 0, 0, 4, 0, 7,
            0, 0, 0, 4, 3, 1, 0, 0, 0,
        ],
    },
    {
        "description": "Puzzle 9 (9,2,0,0,0,0,0,0)",
        "pattern": [
            1, 0, 0, 0, 0, 0, 3, 0, 0,
            0, 0, 5, 0, 0, 3, 0, 0, 0,
            2, 0, 3, 0, 0, 1, 6, 0, 5,
            0, 2, 0, 1, 4, 0, 0, 0, 7,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            9, 0, 0, 0, 8, 6, 0, 5, 0,
            3, 0, 4, 9, 0, 0, 7, 0, 1,
            0, 0, 0, 7, 0, 0, 8, 0, 0,
            0, 0, 8, 0, 0, 0, 0, 0, 3,
        ],
    },
    {
        "description": "Puzzle 10 (10,2,0,0,0,0,0,0)",
        "pattern": [
            0, 9, 0, 0, 6, 8, 0, 7, 4,
            0, 0, 1, 0, 0, 0, 0, 0, 2,
            0, 0, 0, 0, 1, 0, 0, 0, 6,
            0, 0, 0, 0, 0, 5, 4, 8, 0,
            0, 0, 0, 0, 9, 0, 0, 0, 0,
            0, 3, 8, 1, 0, 0, 0, 0, 0,
            3, 0, 0, 0, 2, 0, 0, 0, 0,
            9, 0, 0, 0, 0, 0, 2, 0, 0,
            5, 2, 0, 7, 4, 0, 0, 3, 0,
        ],
    },
    {
        "description": "Puzzle 11 (4,3,1,0,0,0,0,0)",
        "pattern": [
            0, 8, 0, 4, 0, 6, 5, 9, 0,
            0, 0, 0, 0, 0, 8, 0, 0, 7,
            0, 0, 0, 9, 5, 0, 0, 0, 8,
            8, 0, 3, 0, 0, 0, 9, 0, 2,
            0, 1, 0, 0, 0, 0, 0, 3, 0,
            9, 0, 7, 0, 0, 0, 1, 0, 6,
            5, 0, 0, 0, 3, 7, 0, 0, 0,
            3, 0, 0, 6, 0, 0, 0, 0, 0,
            0, 7, 4, 2, 0, 5, 0, 8, 0,
        ],
    },
    {
        "description": "Puzzle 12 (8,2,1,0,0,0,0,0)",
        "pattern": [
            3, 0, 0, 6, 0, 9, 0, 8, 0,
            0, 9, 0, 0, 0, 0, 0, 0, 7,
            0, 0, 2, 0, 1, 0, 9, 0, 4,
            2, 0, 9, 0, 0, 0, 0, 0, 1,
            0, 0, 7, 0, 2, 0, 6, 0, 0,
            5, 0, 0, 0, 0, 0, 4, 0, 8,
            7, 0, 1, 0, 5, 0, 8, 0, 0,
            9, 0, 0, 0, 0, 0, 0, 1, 0,
            0, 3, 0, 1, 0, 6, 0, 0, 5,
        ],
    },
    {
        "description": "Puzzle 13 (12,2,1,0,0,0,0,0)",
        "pattern": [
            2, 6, 0, 0, 0, 0, 8, 7, 0,
            0, 1, 7, 0, 0, 9, 0, 0, 0,
            5, 0, 8, 0, 0, 0, 0, 1, 0,
            0, 4, 0, 0, 2, 0, 0, 0, 0,
            0, 0, 0, 1, 4, 8, 0, 0, 0,
            0, 0, 0, 0, 6, 0, 0, 2, 0,
            0, 8, 0, 0, 0, 0, 6, 0, 4,
            0, 0, 0, 7, 0, 0, 1, 8, 0,
            0, 5, 6, 0, 0, 0, 0, 9, 2,
        ],
    },
    {
        "description": "Puzzle 14 (5,3,1,1,0,0,0,0)",
        "pattern": [
            0, 8, 0, 3, 0, 0, 0, 2, 0,
            3, 0, 0, 2, 0, 7, 0, 0, 8,
            0, 2, 0, 0, 5, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 1, 3, 0, 5,
            0, 0, 5, 0, 0, 0, 4, 0, 0,
            6, 0, 7, 5, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0, 3, 0,
            2, 0, 0, 6, 0, 3, 0, 0, 7,
            0, 5, 0, 0, 0, 2, 0, 1, 0,
        ],
    },
    {
        "description": "Puzzle 15 (11,5,1,2,0,0,0,0)",
        "pattern": [
            0, 0, 0, 9, 0, 0, 0, 3, 7,
            0, 0, 0, 0, 8, 0, 6, 0, 0,
            0, 9, 0, 0, 5, 0, 0, 1, 0,
            0, 0, 0, 6, 0, 0, 0, 0, 8,
            0, 2, 5, 0, 1, 0, 3, 9, 0,
            7, 0, 0, 0, 0, 2, 0, 0, 0,
            0, 3, 0, 0, 7, 0, 0, 8, 0,
            0, 0, 8, 0, 2, 0, 0, 0, 0,
            2, 4, 0, 0, 0, 3, 0, 0, 0,
        ],
    },
    {
        "description": "Puzzle 16 (8,2,0,0,1,0,0,0)",
        "pattern": [
            0, 4, 0, 0, 0, 6, 0, 2, 0,
            3, 0, 6, 1, 2, 0, 0, 0, 0,
            0, 0, 8, 0, 0, 9, 3, 0, 0,
            4, 0, 7, 0, 0, 0, 0, 9, 0,
            2, 0, 3, 0, 1, 0, 6, 0, 5,
            0, 8, 0, 0, 0, 0, 4, 0, 7,
            0, 0, 2, 8, 0, 0, 9, 0, 0,
            0, 0, 0, 0, 6, 1, 7, 0, 2,
            0, 6, 0, 7, 0, 0, 0, 3, 0,
        ],
    },
    {
        "description": "Puzzle 17 (9,3,0,0,1,0,0,0)",
        "pattern": [
            0, 0, 7, 0, 0, 4, 0, 0, 0,
            0, 9, 0, 0, 8, 1, 4, 5, 0,
            0, 1, 0, 0, 0, 0, 0, 0, 0,
            3, 4, 0, 0, 0, 7, 0, 0, 0,
            0, 7, 6, 0, 9, 0, 8, 1, 0,
            0, 0, 0, 1, 0, 0, 0, 6, 7,
            0, 0, 0, 0, 0, 0, 0, 3, 0,
            0, 3, 4, 5, 7, 0, 0, 9, 0,
            0, 0, 0, 6, 0, 0, 2, 0, 0,
        ],
    },
    {
        "description": "Puzzle 18 (6,2,1,0,1,0,0,0)",
        "pattern": [
            0, 3, 0, 0, 0, 0, 0, 4, 0,
            0, 0, 1, 0, 8, 5, 0, 0, 0,
            7, 0, 0, 2, 0, 0, 0, 0, 9,
            4, 1, 6, 0, 0, 0, 0, 2, 0,
            0, 0, 8, 1, 2, 4, 6, 0, 0,
            0, 9, 0, 0, 0, 0, 3, 1, 4,
            6, 0, 0, 0, 0, 7, 0, 0, 1,
            0, 0, 0, 6, 5, 0, 4, 0, 0,
            0, 8, 0, 0, 0, 0, 0, 3, 0,
        ],
    },
    {
        "description": "Puzzle 19 (3,3,1,0,0,1,0,0)",
        "pattern": [
            1, 0, 0, 0, 3, 0, 0, 0, 6,
            0, 2, 0, 1, 0, 5, 4, 0, 0,
            0, 4, 0, 0, 0, 0, 0, 1, 2,
            0, 0, 0, 2, 0, 0, 8, 6, 0,
            6, 0, 0, 0, 0, 0, 0, 0, 9,
            0, 3, 5, 0, 0, 6, 0, 0, 0,
            5, 7, 0, 0, 0, 0, 0, 8, 0,
            0, 0, 9, 5, 0, 1, 0, 2, 0,
            2, 0, 0, 0, 6, 0, 0, 0, 5,
        ],
    },
    {
        "description": "Puzzle 20 (8,4,1,1,0,1,0,0)",
        "pattern": [
            0, 6, 0, 7, 0, 0, 0, 0, 8,
            0, 0, 0, 0, 0, 0, 2, 3, 0,
            0, 0, 0, 0, 1, 0, 0, 5, 9,
            0, 7, 4, 9, 0, 0, 3, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 1, 0, 0, 2, 9, 8, 0,
            8, 4, 0, 0, 5, 0, 0, 0, 0,
            0, 1, 3, 0, 0, 0, 0, 0, 0,
            5, 0, 0, 0, 0, 8, 0, 1, 0,
        ],
    },
    {
        "description": "Puzzle 21 (4,6,2,1,0,1,1,0)",
        "pattern": [
            0, 0, 0, 0, 0, 0, 3, 0, 0,
            8, 0, 0, 0, 9, 7, 0, 4, 0,
            0, 0, 0, 0, 0, 4, 0, 8, 1,
            0, 1, 0, 0, 0, 0, 5, 0, 0,
            7, 0, 0, 5, 0, 6, 0, 0, 4,
            0, 0, 6, 0, 0, 0, 0, 1, 0,
            5, 8, 0, 9, 0, 0, 0, 0, 0,
            0, 2, 0, 1, 8, 0, 0, 0, 7,
            0, 0, 7, 0, 0, 0, 0, 0, 0,
        ],
    },
    {
        "description": "Puzzle 22 (4,2,2,1,0,0,1,0)",
        "pattern": [
            0, 0, 4, 0, 0, 8, 0, 7, 0,
            3, 7, 0, 0, 0, 0, 5, 0, 8,
            0, 9, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 3, 2, 0, 7, 0, 0, 0,
            0, 5, 1, 0, 6, 0, 9, 4, 0,
            0, 0, 0, 1, 0, 9, 7, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 2, 0,
            2, 0, 6, 0, 0, 0, 0, 1, 7,
            0, 8, 0, 4, 0, 0, 3, 0, 0,
        ],
    },
    {
        "description": "Puzzle 23 (4,4,1,1,0,0,1,0)",
        "pattern": [
            0, 0, 0, 1, 0, 6, 7, 0, 0,
            0, 3, 0, 0, 8, 4, 0, 1, 0,
            2, 0, 0, 0, 7, 0, 0, 0, 0,
            1, 5, 0, 0, 0, 0, 0, 8, 4,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            3, 4, 0, 0, 0, 0, 0, 7, 6,
            0, 0, 0, 0, 4, 0, 0, 0, 2,
            0, 1, 0, 7, 3, 0, 0, 4, 0,
            0, 0, 9, 5, 0, 8, 0, 0, 0,
        ],
    },
    {
        "description": "Puzzle 24 (3,1,1,1,0,0,1,0)",
        "pattern": [
            0, 0, 0, 4, 5, 9, 1, 0, 0,
            0, 0, 1, 0, 0, 0, 6, 0, 8,
            0, 4, 0, 0, 0, 0, 0, 0, 0,
            7, 5, 0, 0, 0, 0, 4, 0, 0,
            0, 8, 0, 0, 1, 0, 0, 5, 0,
            0, 0, 3, 0, 0, 0, 0, 7, 6,
            0, 0, 0, 0, 0, 0, 0, 3, 0,
            9, 0, 6, 0, 0, 0, 5, 0, 0,
            0, 0, 5, 9, 2, 3, 0, 0, 0,
        ],
    },
    {
        "description": "Puzzle 25 (4,1,1,1,0,0,1,0)",
        "pattern": [
            0, 0, 0, 0, 0, 0, 5, 0, 0,
            0, 0, 0, 0, 9, 0, 0, 0, 8,
            5, 0, 1, 0, 0, 8, 4, 6, 0,
            0, 8, 0, 0, 0, 4, 0, 0, 0,
            0, 0, 4, 1, 0, 9, 7, 0, 0,
            0, 0, 0, 7, 0, 0, 0, 2, 0,
            0, 3, 7, 2, 0, 0, 9, 0, 5,
            2, 0, 0, 0, 1, 0, 0, 0, 0,
            0, 0, 5, 0, 0, 0, 0, 0, 0,
        ],
    },
];

