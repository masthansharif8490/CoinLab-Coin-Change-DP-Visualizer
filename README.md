# CoinLab - Coin Change Dynamic Programming Visualizer

Subject: Design and Analysis of Algorithms (DAA) - Implementation project
Topic: Coin Change (minimum number of coins) using dynamic programming
Author: Shaik Masthan Sharif (5EN15)

## 1. Project Overview

**CoinLab** is an educational web app. The user enters a set of coin values and a target amount. The app computes the minimum number of coins needed and shows the DP table being filled one cell at a time, with a log that explains every comparison.

Django serves the page. The algorithm and animation run in the browser with HTML, CSS and JavaScript. No database is needed.

## 2. Problem Statement

Given coin values `c1, c2, ..., cn` (unlimited supply of each) and an amount `A`, find the fewest coins whose values add up to exactly `A`, or report that it is impossible.

## 3. Why dynamic programming (and not greedy)

Greedy (always take the biggest coin) fails for some coin sets. With coins `{1, 3, 4}` and amount `6`:

- Greedy: 4 + 1 + 1 = **3 coins**
- DP: 3 + 3 = **2 coins**

The button **Try the greedy trap** loads this example.

## 4. Algorithm

Let `dp[a]` be the minimum coins needed for amount `a`.

```
dp[0] = 0
dp[a] = min( dp[a - c] + 1 )   for every coin c <= a where dp[a - c] is reachable
```

If no coin works, `dp[a]` stays infinite (unreachable). After the table is filled, the algorithm **backtracks** from `A` using the stored "last coin" of each cell to list the coins used.

| Measure | Value |
|---|---|
| Time complexity | O(A x n) |
| Space complexity | O(A) |

where `A` is the amount and `n` is the number of distinct coins.

## 5. Features

- Custom coins (commas, spaces or semicolons; up to 8 coins) and amount (0 to 60)
- Start, Step, Pause, Reset, Solve instantly, and a speed slider
- Colour-coded table: amount being computed, cell being read, improved value, filled, answer path
- Activity log explaining each comparison in plain words
- Statistics: cells filled, comparisons, improvements, steps applied
- Answer shown as coin tokens
- Input validation with clear error messages
- Python reference implementation and tests (`coinlab/dp.py`, `coinlab/tests.py`)

## 6. Technologies

| Technology | Purpose |
|---|---|
| HTML | Page structure |
| CSS | Layout, table colours, responsive design |
| JavaScript | DP algorithm, step recording, animation, statistics |
| Python / Django | Serves the website, reference algorithm and tests |

## 7. Project Structure

```
CoinLab_Django/
├── manage.py
├── requirements.txt
├── README.md
├── .gitignore
├── coinlab_project/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
└── coinlab/
    ├── views.py
    ├── urls.py
    ├── dp.py              (Python reference DP)
    ├── tests.py
    ├── templates/coinlab/index.html
    └── static/coinlab/
        ├── css/style.css
        └── js/visualizer.js
```

## 8. How to Run

Requires Python 3.10 or newer.

**Windows (CMD)**
```
cd CoinLab_Django
python -m venv .venv
.venv\Scripts\activate.bat
python -m pip install -r requirements.txt
python manage.py runserver
```

**Windows (PowerShell):** activate with `.\.venv\Scripts\Activate.ps1`

**Linux / macOS**
```
cd CoinLab_Django
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python manage.py runserver
```

Open http://127.0.0.1:8000/ in your browser. Run the tests with `python manage.py test`.

## 9. How to Use

1. Enter coins, for example `1, 3, 4`, and an amount, for example `6`.
2. Click **Use these inputs**.
3. Click **Step** to see one action at a time, or **Start** for automatic playback.
4. Read the activity log to see why each cell changes.
5. At the end, the green cells show the answer path and the coin tokens show the coins used.

## 10. Sample Run (coins 1, 2, 5 and amount 11)

| Amount | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| dp | 0 | 1 | 1 | 2 | 2 | 1 | 2 | 2 | 3 | 3 | 2 | 3 |

Answer: 3 coins (5 + 5 + 1).

## 11. Limitations and Future Improvements

- Amount is limited to 60 so the table stays readable
- Only the minimum-coins version is shown
- Possible additions: count the number of ways to make the amount, compare with the greedy method side by side, and 2D table (coins x amounts) view

## 12. Conclusion

CoinLab shows how a problem with overlapping subproblems is solved by storing smaller answers in a table. Watching each cell get filled makes the recurrence, the optimal substructure and the backtracking easy to follow.
