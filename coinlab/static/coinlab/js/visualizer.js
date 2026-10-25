/* CoinLab - Coin Change (minimum coins) dynamic programming visualizer.
 *
 * buildSteps() runs the real DP once and records every action as a "step".
 * The UI then replays those steps, so Step / Start / Pause / Reset all work
 * on the same recorded sequence.
 *
 * Recurrence: dp[0] = 0; dp[a] = min(dp[a - c] + 1) for coins c <= a.
 */
(function (root) {
  "use strict";

  var MAX_COINS = 8;
  var MAX_AMOUNT = 60;
  var INF = Infinity;

  function parseCoins(text) {
    var parts = String(text).split(/[\s,;]+/).filter(Boolean);
    if (!parts.length) throw new Error("Enter at least one coin value.");
    var seen = {}, coins = [];
    parts.forEach(function (p) {
      if (!/^\d+$/.test(p) || Number(p) < 1) {
        throw new Error('"' + p + '" is not a positive whole number.');
      }
      var n = Number(p);
      if (!seen[n]) { seen[n] = true; coins.push(n); }
    });
    if (coins.length > MAX_COINS) throw new Error("Use at most " + MAX_COINS + " different coins.");
    coins.sort(function (a, b) { return a - b; });
    return coins;
  }

  function parseAmount(text) {
    if (!/^\d+$/.test(String(text).trim())) throw new Error("Amount must be a whole number from 0 to " + MAX_AMOUNT + ".");
    var n = Number(text);
    if (n > MAX_AMOUNT) throw new Error("Amount must be at most " + MAX_AMOUNT + " so the table stays readable.");
    return n;
  }

  /* Run the DP and record steps. Step types:
     start   - begin computing dp[a]
     skip    - coin is larger than a
     compare - read dp[a - c], compare candidate with current dp[a]
     fill    - dp[a] is final
     path    - one coin of the answer path
     done    - algorithm finished */
  function buildSteps(coins, amount) {
    var dp = [], last = [], steps = [];
    var i;
    for (i = 0; i <= amount; i++) { dp.push(INF); last.push(null); }
    dp[0] = 0;
    steps.push({ type: "fill", a: 0, value: 0, coin: null,
      msg: "Base case: dp[0] = 0 because zero coins make amount 0." });

    for (var a = 1; a <= amount; a++) {
      steps.push({ type: "start", a: a, msg: "Compute dp[" + a + "]: try every coin." });
      for (var k = 0; k < coins.length; k++) {
        var c = coins[k];
        if (c > a) {
          steps.push({ type: "skip", a: a, c: c, msg: "Coin " + c + " is larger than " + a + ", skip it." });
          continue;
        }
        var prev = dp[a - c];
        var cand = prev === INF ? INF : prev + 1;
        var improved = cand < dp[a];
        var text;
        if (prev === INF) {
          text = "Coin " + c + ": dp[" + (a - c) + "] is unreachable, so this coin cannot help.";
        } else if (improved) {
          text = "Coin " + c + ": dp[" + (a - c) + "] + 1 = " + cand + (dp[a] === INF ? " (first way found), update dp[" + a + "]." : " is better than " + dp[a] + ", update dp[" + a + "].");
        } else {
          text = "Coin " + c + ": dp[" + (a - c) + "] + 1 = " + cand + " is not better than " + dp[a] + ", keep it.";
        }
        if (improved) { dp[a] = cand; last[a] = c; }
        steps.push({ type: "compare", a: a, c: c, from: a - c, cand: cand === INF ? null : cand,
          improved: improved, value: dp[a] === INF ? null : dp[a], coin: last[a], msg: text, good: improved });
      }
      steps.push({ type: "fill", a: a, value: dp[a] === INF ? null : dp[a], coin: last[a],
        msg: dp[a] === INF ? "dp[" + a + "] stays unreachable with these coins."
                           : "dp[" + a + "] = " + dp[a] + " (last coin " + last[a] + ").",
        good: dp[a] !== INF, bad: dp[a] === INF });
    }

    var used = [];
    if (dp[amount] !== INF) {
      var x = amount;
      while (x > 0) {
        used.push(last[x]);
        steps.push({ type: "path", a: x, c: last[x], msg: "Backtrack: at " + x + " use coin " + last[x] + ", move to " + (x - last[x]) + "." });
        x -= last[x];
      }
      used.sort(function (p, q) { return q - p; });
    }
    steps.push({ type: "done", min: dp[amount] === INF ? -1 : dp[amount], used: used,
      msg: dp[amount] === INF ? "Amount " + amount + " cannot be made with these coins."
                              : "Minimum coins for " + amount + " is " + dp[amount] + ": " + (used.length ? used.join(" + ") : "none") + "." });
    return steps;
  }

  var api = { parseCoins: parseCoins, parseAmount: parseAmount, buildSteps: buildSteps };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  root.CoinLab = api;

  if (typeof document === "undefined") return;

  /* ---------- UI ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var state = { coins: [], amount: 0, steps: [], pos: 0, timer: null, cells: [], stats: null };

  function showError(msg) {
    var el = $("error");
    el.textContent = msg || "";
    el.hidden = !msg;
  }

  function buildTable() {
    var t = $("table");
    t.innerHTML = "";
    state.cells = [];
    for (var a = 0; a <= state.amount; a++) {
      var cell = document.createElement("div");
      cell.className = "cell";
      cell.innerHTML = '<div class="idx">' + a + '</div><div class="val">-</div><div class="coin">&nbsp;</div>';
      t.appendChild(cell);
      state.cells.push(cell);
    }
  }

  function setCell(a, value, coin, unreachable) {
    var cell = state.cells[a];
    cell.querySelector(".val").textContent = unreachable ? "\u221e" : (value === null || value === undefined ? "-" : value);
    cell.querySelector(".coin").innerHTML = coin ? "coin " + coin : "&nbsp;";
  }

  function clearMarks(names) {
    state.cells.forEach(function (c) { names.forEach(function (n) { c.classList.remove(n); }); });
  }

  function log(msg, cls) {
    var li = document.createElement("li");
    li.textContent = msg;
    if (cls) li.className = cls;
    var ol = $("log");
    ol.appendChild(li);
    ol.scrollTop = ol.scrollHeight;
  }

  function renderStats() {
    $("st-cells").textContent = state.stats.cells;
    $("st-comp").textContent = state.stats.comp;
    $("st-imp").textContent = state.stats.imp;
    $("st-steps").textContent = state.pos;
  }

  function resetView() {
    stop();
    state.pos = 0;
    state.stats = { cells: 0, comp: 0, imp: 0 };
    buildTable();
    $("log").innerHTML = "";
    $("coins-used").innerHTML = "";
    $("result").textContent = "Press Start or Step to begin.";
    renderStats();
  }

  function applyStep(s) {
    clearMarks(["cur", "look", "imp"]);
    var cell = s.a !== undefined ? state.cells[s.a] : null;

    if (s.type === "start") {
      cell.classList.add("cur");
    } else if (s.type === "skip") {
      cell.classList.add("cur");
    } else if (s.type === "compare") {
      state.stats.comp++;
      cell.classList.add("cur");
      state.cells[s.from].classList.add("look");
      if (s.improved) {
        state.stats.imp++;
        setCell(s.a, s.value, s.coin);
        cell.classList.add("imp");
      }
    } else if (s.type === "fill") {
      state.stats.cells++;
      setCell(s.a, s.value, s.coin, s.value === null);
      cell.classList.add("done");
    } else if (s.type === "path") {
      clearMarks(["cur"]);
      cell.classList.add("path");
      cell.classList.remove("done");
    } else if (s.type === "done") {
      var r = $("result");
      if (s.min < 0) {
        r.textContent = s.msg;
      } else {
        r.textContent = s.msg;
        var box = $("coins-used");
        box.innerHTML = "";
        s.used.forEach(function (c) {
          var t = document.createElement("span");
          t.className = "token";
          t.textContent = c;
          box.appendChild(t);
        });
      }
      state.cells[0].classList.add("path");
    }
    log(s.msg, s.good ? "good" : (s.bad ? "bad" : ""));
    state.pos++;
    renderStats();
  }

  function stepOnce() {
    if (state.pos >= state.steps.length) { stop(); return false; }
    applyStep(state.steps[state.pos]);
    if (state.pos >= state.steps.length) stop();
    return true;
  }

  function delay() { return 1100 - Number($("speed").value) * 100; }

  function start() {
    if (state.timer) return;
    if (state.pos >= state.steps.length) return;
    var tick = function () {
      if (!stepOnce()) return;
      if (state.pos < state.steps.length) state.timer = setTimeout(tick, delay());
      else state.timer = null;
    };
    state.timer = setTimeout(tick, 0);
  }

  function stop() {
    if (state.timer) { clearTimeout(state.timer); state.timer = null; }
  }

  function instant() {
    stop();
    while (state.pos < state.steps.length) applyStep(state.steps[state.pos]);
  }

  function load() {
    try {
      var coins = parseCoins($("coins").value);
      var amount = parseAmount($("amount").value);
      showError("");
      state.coins = coins;
      state.amount = amount;
      state.steps = buildSteps(coins, amount);
      resetView();
      $("coins").value = coins.join(", ");
    } catch (e) {
      showError(e.message);
    }
  }

  $("btn-load").addEventListener("click", load);
  $("btn-example").addEventListener("click", function () {
    $("coins").value = "1, 3, 4";
    $("amount").value = 6;
    load();
    log("Greedy takes 4+1+1 (3 coins). DP finds 3+3 (2 coins).");
  });
  $("btn-start").addEventListener("click", start);
  $("btn-step").addEventListener("click", function () { stop(); stepOnce(); });
  $("btn-pause").addEventListener("click", stop);
  $("btn-reset").addEventListener("click", resetView);
  $("btn-instant").addEventListener("click", instant);
  ["coins", "amount"].forEach(function (id) {
    $(id).addEventListener("keydown", function (e) { if (e.key === "Enter") load(); });
  });

  load();
})(typeof window !== "undefined" ? window : globalThis);
