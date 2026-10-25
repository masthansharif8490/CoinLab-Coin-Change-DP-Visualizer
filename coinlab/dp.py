"""Reference implementation of the Coin Change DP (minimum coins).

The browser visualizer (static/coinlab/js/visualizer.js) follows exactly the
same recurrence. This Python version is used by tests.py to verify it.

Recurrence:
    dp[0] = 0
    dp[a] = min(dp[a - c] + 1) over every coin c <= a with dp[a - c] reachable

Time  : O(amount * number_of_coins)
Space : O(amount)
"""

INF = float("inf")


def min_coins(coins, amount):
    """Return (minimum coin count or -1, list of coins used)."""
    dp = [INF] * (amount + 1)
    last = [None] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
                last[a] = c
    if dp[amount] == INF:
        return -1, []
    used, a = [], amount
    while a > 0:
        used.append(last[a])
        a -= last[a]
    return dp[amount], sorted(used, reverse=True)
