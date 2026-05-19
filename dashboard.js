// ===== Dashboard Controller =====

const chartInstances = {};
const CHART_COLORS = {
  green:  '#27ae60',
  red:    '#eb5757',
  blue:   '#2d9cdb',
  purple: '#9b51e0',
  orange: '#f2994a',
  teal:   '#6fcf97',
  yellow: '#f2c94c',
  pink:   '#e84393',
};

// ===== Chart.js Defaults =====
Chart.defaults.color = '#9aa0b0';
Chart.defaults.borderColor = '#363d52';
Chart.defaults.font.family = "'Inter','Segoe UI',system-ui,sans-serif";
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyleWidth = 10;
Chart.defaults.plugins.legend.labels.padding = 14;
Chart.defaults.plugins.tooltip.backgroundColor = '#242938';
Chart.defaults.plugins.tooltip.borderColor = '#363d52';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.callbacks = {
  label: function(ctx) {
    var val = ctx.parsed.y != null ? ctx.parsed.y : ctx.parsed;
    if (typeof val === 'number') return ' ' + ctx.dataset.label + ': $' + val.toLocaleString();
    return ' ' + ctx.dataset.label + ': ' + val;
  }
};

// ===== Helpers =====
function fmt(n) { return '$' + Math.abs(n).toLocaleString(); }
function pct(n, d) { return ((n / d) * 100).toFixed(1) + '%'; }

function getFilteredRange() {
  var start = document.getElementById('date-start').value;
  var end = document.getElementById('date-end').value;
  var si = parseInt(start.split('-')[1], 10) - 1;
  var ei = parseInt(end.split('-')[1], 10) - 1;
  return [Math.max(0, si), Math.min(11, ei)];
}

function getSelectedDept() {
  return document.getElementById('dept-filter').value;
}

function sliceData(arr, si, ei) {
  return arr.slice(si, ei + 1);
}

function sumArr(arr) { return arr.reduce(function(a, b) { return a + b; }, 0); }

function getRevenue(dept, si, ei) {
  if (dept === 'all') return sliceData(INCOME_STATEMENT['Revenue'], si, ei);
  return sliceData(DEPT_REVENUE[dept], si, ei);
}

function getExpenses(dept, si, ei) {
  if (dept === 'all') return sliceData(INCOME_STATEMENT['Operating Expenses'], si, ei);
  return sliceData(DEPT_EXPENSES[dept], si, ei);
}

// ===== Animated Counter =====
function animateValue(el, start, end, duration) {
  var startTime = null;
  var prefix = end < 0 ? '-$' : '$';
  var absEnd = Math.abs(end);
  var absStart = Math.abs(start);
  function step(ts) {
    if (!startTime) startTime = ts;
    var progress = Math.min((ts - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = Math.round(absStart + (absEnd - absStart) * eased);
    el.textContent = prefix + current.toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ===== Destroy & Create Chart Helper =====
function makeChart(id, config) {
  if (chartInstances[id]) chartInstances[id].destroy();
  var ctx = document.getElementById(id);
  if (!ctx) return null;
  chartInstances[id] = new Chart(ctx, config);
  return chartInstances[id];
}

// ===== Sparkline Charts =====
function renderSparkline(canvasId, data, color) {
  makeChart(canvasId, {
    type: 'line',
    data: {
      labels: data.map(function(_, i) { return i; }),
      datasets: [{
        data: data,
        borderColor: color,
        borderWidth: 2,
        fill: true,
        backgroundColor: color.replace(')', ',.08)').replace('rgb', 'rgba'),
        pointRadius: 0,
        tension: .4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } },
      elements: { line: { borderWidth: 1.5 } },
    }
  });
}

// ===== Update KPIs =====
function updateKPIs(dept, si, ei) {
  var rev = getRevenue(dept, si, ei);
  var exp = getExpenses(dept, si, ei);
  var totalRev = sumArr(rev);
  var totalExp = sumArr(exp);
  var netProfit = totalRev - totalExp;
  var cf = sliceData(CASH_FLOW.operating, si, ei);
  var totalCF = sumArr(cf);

  var prevRev = sumArr(sliceData(PRIOR_YEAR.revenue, si, ei));
  var prevExp = sumArr(sliceData(PRIOR_YEAR.expenses, si, ei));
  var prevNI = sumArr(sliceData(PRIOR_YEAR.netIncome, si, ei));
  var prevCF = sumArr(sliceData(PRIOR_YEAR.cashFlow, si, ei));

  animateValue(document.getElementById('kpi-revenue'), 0, totalRev, 800);
  animateValue(document.getElementById('kpi-expenses'), 0, totalExp, 800);
  animateValue(document.getElementById('kpi-profit'), 0, netProfit, 800);
  animateValue(document.getElementById('kpi-cashflow'), 0, totalCF, 800);

  var revChange = ((totalRev - prevRev) / prevRev * 100).toFixed(1);
  var expChange = ((totalExp - prevExp) / prevExp * 100).toFixed(1);
  var profitChange = ((netProfit - prevNI) / prevNI * 100).toFixed(1);
  var cfChange = ((totalCF - prevCF) / prevCF * 100).toFixed(1);

  setChange('kpi-revenue-change', revChange);
  setChange('kpi-expenses-change', -Math.abs(expChange));
  setChange('kpi-profit-change', profitChange);
  setChange('kpi-cashflow-change', cfChange);

  // Target progress
  var revPct = Math.min(100, (totalRev / TARGETS.revenue * 100));
  var expPct = Math.min(100, (totalExp / TARGETS.expenses * 100));
  var profPct = Math.min(100, (netProfit / TARGETS.netProfit * 100));
  var cfPct = Math.min(100, (totalCF / TARGETS.cashFlow * 100));

  document.getElementById('target-revenue').style.width = revPct.toFixed(0) + '%';
  document.getElementById('target-expenses').style.width = expPct.toFixed(0) + '%';
  document.getElementById('target-profit').style.width = profPct.toFixed(0) + '%';
  document.getElementById('target-cashflow').style.width = cfPct.toFixed(0) + '%';

  document.getElementById('target-revenue-label').textContent = revPct.toFixed(0) + '% of target';
  document.getElementById('target-expenses-label').textContent = expPct.toFixed(0) + '% of budget';
  document.getElementById('target-profit-label').textContent = profPct.toFixed(0) + '% of target';
  document.getElementById('target-cashflow-label').textContent = cfPct.toFixed(0) + '% of target';

  // Sparklines
  var fullRev = dept === 'all' ? INCOME_STATEMENT['Revenue'] : DEPT_REVENUE[dept];
  var fullExp = dept === 'all' ? INCOME_STATEMENT['Operating Expenses'] : DEPT_EXPENSES[dept];
  var fullProfit = fullRev.map(function(r, i) { return r - fullExp[i]; });
  renderSparkline('spark-revenue', fullRev, CHART_COLORS.green);
  renderSparkline('spark-expenses', fullExp, CHART_COLORS.red);
  renderSparkline('spark-profit', fullProfit, CHART_COLORS.blue);
  renderSparkline('spark-cashflow', CASH_FLOW.operating, CHART_COLORS.purple);
}

function setChange(id, val) {
  var el = document.getElementById(id);
  var v = parseFloat(val);
  if (id.includes('expense')) {
    el.textContent = '\u25B2 ' + Math.abs(v) + '%';
    el.className = 'kpi-change negative';
  } else if (v >= 0) {
    el.textContent = '\u25B2 ' + v + '%';
    el.className = 'kpi-change positive';
  } else {
    el.textContent = '\u25BC ' + Math.abs(v) + '%';
    el.className = 'kpi-change negative';
  }
}

// ===== Financial Health Gauge =====
function renderHealthGauge() {
  var scores = HEALTH_SCORES;
  var avg = Math.round((scores.liquidity + scores.solvency + scores.profitability + scores.efficiency + scores.growth) / 5);

  document.getElementById('health-score-value').textContent = avg;
  document.getElementById('health-liq-val').textContent = scores.liquidity;
  document.getElementById('health-sol-val').textContent = scores.solvency;
  document.getElementById('health-prof-val').textContent = scores.profitability;
  document.getElementById('health-eff-val').textContent = scores.efficiency;
  document.getElementById('health-grw-val').textContent = scores.growth;

  document.getElementById('health-liquidity').style.width = scores.liquidity + '%';
  document.getElementById('health-solvency').style.width = scores.solvency + '%';
  document.getElementById('health-profitability').style.width = scores.profitability + '%';
  document.getElementById('health-efficiency').style.width = scores.efficiency + '%';
  document.getElementById('health-growth').style.width = scores.growth + '%';

  makeChart('chart-health-gauge', {
    type: 'doughnut',
    data: {
      labels: ['Liquidity','Solvency','Profitability','Efficiency','Growth'],
      datasets: [{
        data: [scores.liquidity, scores.solvency, scores.profitability, scores.efficiency, scores.growth],
        backgroundColor: [CHART_COLORS.green, CHART_COLORS.blue, CHART_COLORS.yellow, CHART_COLORS.orange, CHART_COLORS.purple],
        borderWidth: 0,
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(ctx) { return ' ' + ctx.label + ': ' + ctx.parsed + '/100'; }
          }
        }
      },
      rotation: -90,
      circumference: 360,
    }
  });
}

// ===== Overview Charts =====
function renderProfitabilityChart(dept, si, ei) {
  var labels = sliceData(MONTHS, si, ei);
  var rev = getRevenue(dept, si, ei);
  var exp = getExpenses(dept, si, ei);
  var profit = rev.map(function(r, i) { return r - exp[i]; });

  makeChart('chart-profitability', {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        { label: 'Revenue', data: rev, borderColor: CHART_COLORS.green, backgroundColor: 'rgba(39,174,96,.1)', fill: true, tension: .4, pointRadius: 3 },
        { label: 'Expenses', data: exp, borderColor: CHART_COLORS.red, backgroundColor: 'rgba(235,87,87,.1)', fill: true, tension: .4, pointRadius: 3 },
        { label: 'Net Profit', data: profit, borderColor: CHART_COLORS.blue, backgroundColor: 'rgba(45,156,219,.1)', fill: true, tension: .4, pointRadius: 3 },
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: { ticks: { callback: function(v) { return '$' + (v/1000) + 'k'; } } }
      }
    }
  });
}

function renderExpenseBreakdown(si, ei) {
  var depts = ['Sales','Marketing','Operations','HR','IT'];
  var keys = ['sales','marketing','operations','hr','it'];
  var values = keys.map(function(k) { return sumArr(sliceData(DEPT_EXPENSES[k], si, ei)); });
  var colors = [CHART_COLORS.blue, CHART_COLORS.orange, CHART_COLORS.green, CHART_COLORS.purple, CHART_COLORS.teal];
  var total = sumArr(values);

  makeChart('chart-expense-breakdown', {
    type: 'doughnut',
    data: {
      labels: depts,
      datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 8 }]
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: function(ctx) { return ' ' + ctx.label + ': $' + ctx.parsed.toLocaleString() + ' (' + pct(ctx.parsed, total) + ')'; }
          }
        }
      }
    }
  });
}

function renderRevVsExp(dept, si, ei) {
  var labels = sliceData(MONTHS, si, ei);
  var rev = getRevenue(dept, si, ei);
  var exp = getExpenses(dept, si, ei);

  makeChart('chart-rev-vs-exp', {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Revenue', data: rev, backgroundColor: CHART_COLORS.green, borderRadius: 4, barPercentage: .6 },
        { label: 'Expenses', data: exp, backgroundColor: CHART_COLORS.red, borderRadius: 4, barPercentage: .6 },
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { ticks: { callback: function(v) { return '$' + (v/1000) + 'k'; } } }
      }
    }
  });
}

function renderForecast(dept) {
  var rev = dept === 'all' ? INCOME_STATEMENT['Revenue'] : DEPT_REVENUE[dept];
  var result = generateForecast(rev, 6);
  var labels = MONTHS.concat(FORECAST_MONTHS);
  var actual = rev.concat(Array(6).fill(null));
  var forecastLine = Array(11).fill(null).concat([rev[11]]).concat(result.forecast);
  var upperBand = Array(11).fill(null).concat([rev[11]]).concat(result.upper);
  var lowerBand = Array(11).fill(null).concat([rev[11]]).concat(result.lower);

  makeChart('chart-forecast', {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        { label: 'Actual Revenue', data: actual, borderColor: CHART_COLORS.green, backgroundColor: 'rgba(39,174,96,.08)', fill: true, tension: .4, pointRadius: 3 },
        { label: 'Forecast', data: forecastLine, borderColor: CHART_COLORS.yellow, borderDash: [6, 4], backgroundColor: 'rgba(242,201,76,.08)', fill: false, tension: .4, pointStyle: 'triangle', pointRadius: 5 },
        { label: 'Upper Bound (95%)', data: upperBand, borderColor: 'rgba(242,201,76,.3)', backgroundColor: 'rgba(242,201,76,.06)', fill: '+1', borderWidth: 1, borderDash: [3, 3], pointRadius: 0 },
        { label: 'Lower Bound (95%)', data: lowerBand, borderColor: 'rgba(242,201,76,.3)', backgroundColor: 'transparent', fill: false, borderWidth: 1, borderDash: [3, 3], pointRadius: 0 },
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: { ticks: { callback: function(v) { return '$' + (v/1000) + 'k'; } } }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(ctx) {
              if (ctx.parsed.y == null) return '';
              return ' ' + ctx.dataset.label + ': $' + ctx.parsed.y.toLocaleString();
            }
          }
        }
      }
    }
  });
}

// ===== YoY Comparison =====
function renderYoY(dept, si, ei) {
  var labels = sliceData(MONTHS, si, ei);
  var currentRev = getRevenue(dept, si, ei);
  var priorRev = sliceData(PRIOR_YEAR.revenue, si, ei);

  makeChart('chart-yoy', {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'FY 2024', data: priorRev, backgroundColor: 'rgba(155,81,224,.5)', borderRadius: 4, barPercentage: .55 },
        { label: 'FY 2025', data: currentRev, backgroundColor: CHART_COLORS.green, borderRadius: 4, barPercentage: .55 },
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { ticks: { callback: function(v) { return '$' + (v/1000) + 'k'; } } }
      }
    }
  });
}

// ===== Income Statement Page =====
function renderIncomeKPIs(si, ei) {
  var rev = sliceData(INCOME_STATEMENT['Revenue'], si, ei);
  var gp = sliceData(INCOME_STATEMENT['Gross Profit'], si, ei);
  var oi = sliceData(INCOME_STATEMENT['Operating Income'], si, ei);
  var ni = sliceData(INCOME_STATEMENT['Net Income'], si, ei);
  var ebitda = sliceData(INCOME_STATEMENT['EBITDA'], si, ei);
  var totalRev = sumArr(rev);

  document.getElementById('income-gross-margin').textContent = ((sumArr(gp) / totalRev) * 100).toFixed(1) + '%';
  document.getElementById('income-op-margin').textContent = ((sumArr(oi) / totalRev) * 100).toFixed(1) + '%';
  document.getElementById('income-net-margin').textContent = ((sumArr(ni) / totalRev) * 100).toFixed(1) + '%';
  document.getElementById('income-ebitda').textContent = fmt(sumArr(ebitda));
}

function renderIncomeWaterfall(si, ei) {
  var labels = sliceData(MONTHS, si, ei);
  var revenue = sliceData(INCOME_STATEMENT['Revenue'], si, ei);
  var cogs = sliceData(INCOME_STATEMENT['COGS'], si, ei);
  var opex = sliceData(INCOME_STATEMENT['Operating Expenses'], si, ei);
  var netIncome = sliceData(INCOME_STATEMENT['Net Income'], si, ei);

  makeChart('chart-income-waterfall', {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Revenue', data: revenue, backgroundColor: CHART_COLORS.green, borderRadius: 4 },
        { label: 'COGS', data: cogs, backgroundColor: CHART_COLORS.orange, borderRadius: 4 },
        { label: 'OpEx', data: opex, backgroundColor: CHART_COLORS.red, borderRadius: 4 },
        { label: 'Net Income', data: netIncome, backgroundColor: CHART_COLORS.blue, borderRadius: 4 },
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { ticks: { callback: function(v) { return '$' + (v/1000) + 'k'; } } }
      }
    }
  });
}

function renderMargins(si, ei) {
  var labels = sliceData(MONTHS, si, ei);
  var rev = sliceData(INCOME_STATEMENT['Revenue'], si, ei);
  var gp = sliceData(INCOME_STATEMENT['Gross Profit'], si, ei);
  var oi = sliceData(INCOME_STATEMENT['Operating Income'], si, ei);
  var ni = sliceData(INCOME_STATEMENT['Net Income'], si, ei);

  var grossM = gp.map(function(v, i) { return ((v / rev[i]) * 100).toFixed(1); });
  var opM = oi.map(function(v, i) { return ((v / rev[i]) * 100).toFixed(1); });
  var netM = ni.map(function(v, i) { return ((v / rev[i]) * 100).toFixed(1); });

  makeChart('chart-margins', {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        { label: 'Gross Margin', data: grossM, borderColor: CHART_COLORS.green, backgroundColor: 'rgba(39,174,96,.08)', fill: true, tension: .4 },
        { label: 'Operating Margin', data: opM, borderColor: CHART_COLORS.blue, tension: .4 },
        { label: 'Net Margin', data: netM, borderColor: CHART_COLORS.purple, tension: .4 },
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { ticks: { callback: function(v) { return v + '%'; } }, min: 0, max: 70 }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(ctx) { return ' ' + ctx.dataset.label + ': ' + ctx.parsed.y + '%'; }
          }
        }
      }
    }
  });
}

function renderIncomeTable(si, ei) {
  var tbody = document.getElementById('income-tbody');
  tbody.innerHTML = '';
  var items = Object.keys(INCOME_STATEMENT);
  var totalsRow = ['Revenue','Gross Profit','Net Income'];
  items.forEach(function(item) {
    var vals = INCOME_STATEMENT[item];
    var tr = document.createElement('tr');
    if (totalsRow.indexOf(item) !== -1) tr.classList.add('total-row');
    var html = '<td>' + item + '</td>';
    for (var i = 0; i < 12; i++) {
      var inRange = i >= si && i <= ei;
      html += '<td style="' + (inRange ? '' : 'opacity:.3') + '">' + fmt(vals[i]) + '</td>';
    }
    html += '<td><strong>' + fmt(sumArr(sliceData(vals, si, ei))) + '</strong></td>';
    tr.innerHTML = html;
    tbody.appendChild(tr);
  });
}

// ===== Balance Sheet Page =====
function renderBalanceKPIs() {
  var q4 = 3;
  var currentRatio = (BALANCE_SHEET['Total Current Assets'][q4] / BALANCE_SHEET['Total Current Liabilities'][q4]).toFixed(2);
  var quickRatio = ((BALANCE_SHEET['Total Current Assets'][q4] - BALANCE_SHEET['Inventory'][q4]) / BALANCE_SHEET['Total Current Liabilities'][q4]).toFixed(2);
  var deRatio = (BALANCE_SHEET['Total Liabilities'][q4] / BALANCE_SHEET['Total Equity'][q4]).toFixed(2);

  document.getElementById('bs-current-ratio').textContent = currentRatio;
  document.getElementById('bs-quick-ratio').textContent = quickRatio;
  document.getElementById('bs-de-ratio').textContent = deRatio;
  document.getElementById('bs-total-assets').textContent = fmt(BALANCE_SHEET['Total Assets'][q4]);
}

function renderAssetsLiab() {
  makeChart('chart-assets-liab', {
    type: 'bar',
    data: {
      labels: QUARTERS,
      datasets: [
        { label: 'Total Assets', data: BALANCE_SHEET['Total Assets'], backgroundColor: CHART_COLORS.green, borderRadius: 4 },
        { label: 'Total Liabilities', data: BALANCE_SHEET['Total Liabilities'], backgroundColor: CHART_COLORS.red, borderRadius: 4 },
        { label: 'Total Equity', data: BALANCE_SHEET['Total Equity'], backgroundColor: CHART_COLORS.blue, borderRadius: 4 },
      ]
    },
    options: {
      responsive: true,
      scales: { y: { ticks: { callback: function(v) { return '$' + (v/1000) + 'k'; } } } }
    }
  });
}

function renderAssetComp() {
  var q4 = [
    BALANCE_SHEET['Cash & Equivalents'][3],
    BALANCE_SHEET['Accounts Receivable'][3],
    BALANCE_SHEET['Inventory'][3],
    BALANCE_SHEET['Property & Equipment'][3],
    BALANCE_SHEET['Intangible Assets'][3],
  ];
  makeChart('chart-asset-comp', {
    type: 'doughnut',
    data: {
      labels: ['Cash','A/R','Inventory','PP&E','Intangibles'],
      datasets: [{ data: q4, backgroundColor: [CHART_COLORS.green, CHART_COLORS.blue, CHART_COLORS.orange, CHART_COLORS.purple, CHART_COLORS.teal], borderWidth: 0 }]
    },
    options: {
      responsive: true, cutout: '60%',
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { callbacks: { label: function(ctx) { return ' ' + ctx.label + ': $' + ctx.parsed.toLocaleString(); } } }
      }
    }
  });
}

function renderDTE() {
  var dte = BALANCE_SHEET['Total Liabilities'].map(function(l, i) { return (l / BALANCE_SHEET['Total Equity'][i]).toFixed(2); });
  makeChart('chart-dte', {
    type: 'line',
    data: {
      labels: QUARTERS,
      datasets: [{
        label: 'D/E Ratio', data: dte,
        borderColor: CHART_COLORS.orange, backgroundColor: 'rgba(242,153,74,.12)',
        fill: true, tension: .4, pointRadius: 6,
        pointBackgroundColor: CHART_COLORS.orange,
      }]
    },
    options: {
      responsive: true,
      scales: { y: { min: 0, max: 1.2 } },
      plugins: { tooltip: { callbacks: { label: function(ctx) { return ' D/E Ratio: ' + ctx.parsed.y; } } } }
    }
  });
}

function renderWorkingCap() {
  var wc = BALANCE_SHEET['Total Current Assets'].map(function(a, i) { return a - BALANCE_SHEET['Total Current Liabilities'][i]; });
  makeChart('chart-working-cap', {
    type: 'bar',
    data: {
      labels: QUARTERS,
      datasets: [{ label: 'Working Capital', data: wc, backgroundColor: CHART_COLORS.teal, borderRadius: 6 }]
    },
    options: {
      responsive: true,
      scales: { y: { ticks: { callback: function(v) { return '$' + (v/1000) + 'k'; } } } }
    }
  });
}

function renderBalanceTable() {
  var tbody = document.getElementById('balance-tbody');
  tbody.innerHTML = '';
  var totalsRow = ['Total Current Assets','Total Assets','Total Current Liabilities','Total Liabilities','Total Equity'];
  Object.keys(BALANCE_SHEET).forEach(function(item) {
    var vals = BALANCE_SHEET[item];
    var tr = document.createElement('tr');
    if (totalsRow.indexOf(item) !== -1) tr.classList.add('total-row');
    var html = '<td>' + item + '</td>';
    vals.forEach(function(v) { html += '<td>' + fmt(v) + '</td>'; });
    tr.innerHTML = html;
    tbody.appendChild(tr);
  });
}

// ===== Cash Flow Page =====
function renderCashFlowKPIs(si, ei) {
  var op = sumArr(sliceData(CASH_FLOW.operating, si, ei));
  var inv = sumArr(sliceData(CASH_FLOW.investing, si, ei));
  var fin = sumArr(sliceData(CASH_FLOW.financing, si, ei));
  var fcf = op + inv;

  document.getElementById('cf-operating').textContent = fmt(op);
  document.getElementById('cf-investing').textContent = (inv < 0 ? '-' : '') + fmt(Math.abs(inv));
  document.getElementById('cf-financing').textContent = (fin < 0 ? '-' : '') + fmt(Math.abs(fin));
  document.getElementById('cf-fcf').textContent = fmt(fcf);
}

function renderCFBreakdown(si, ei) {
  var labels = sliceData(MONTHS, si, ei);
  makeChart('chart-cf-breakdown', {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Operating', data: sliceData(CASH_FLOW.operating, si, ei), backgroundColor: CHART_COLORS.green, borderRadius: 4 },
        { label: 'Investing', data: sliceData(CASH_FLOW.investing, si, ei), backgroundColor: CHART_COLORS.orange, borderRadius: 4 },
        { label: 'Financing', data: sliceData(CASH_FLOW.financing, si, ei), backgroundColor: CHART_COLORS.purple, borderRadius: 4 },
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { stacked: true },
        y: { stacked: true, ticks: { callback: function(v) { return '$' + (v/1000) + 'k'; } } }
      }
    }
  });
}

function renderCFComponents(si, ei) {
  var op = sumArr(sliceData(CASH_FLOW.operating, si, ei));
  var inv = Math.abs(sumArr(sliceData(CASH_FLOW.investing, si, ei)));
  var fin = Math.abs(sumArr(sliceData(CASH_FLOW.financing, si, ei)));

  makeChart('chart-cf-components', {
    type: 'doughnut',
    data: {
      labels: ['Operating','Investing','Financing'],
      datasets: [{ data: [op, inv, fin], backgroundColor: [CHART_COLORS.green, CHART_COLORS.orange, CHART_COLORS.purple], borderWidth: 0 }]
    },
    options: {
      responsive: true, cutout: '60%',
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { callbacks: { label: function(ctx) { return ' ' + ctx.label + ': $' + ctx.parsed.toLocaleString(); } } }
      }
    }
  });
}

function renderFCF(si, ei) {
  var labels = sliceData(MONTHS, si, ei);
  var opSlice = sliceData(CASH_FLOW.operating, si, ei);
  var invSlice = sliceData(CASH_FLOW.investing, si, ei);
  var fcf = opSlice.map(function(v, i) { return v + invSlice[i]; });
  makeChart('chart-fcf', {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Free Cash Flow', data: fcf,
        borderColor: CHART_COLORS.teal, backgroundColor: 'rgba(111,207,151,.12)',
        fill: true, tension: .4, pointRadius: 5,
        pointBackgroundColor: CHART_COLORS.teal,
      }]
    },
    options: {
      responsive: true,
      scales: { y: { ticks: { callback: function(v) { return '$' + (v/1000) + 'k'; } } } }
    }
  });
}

function renderCCC(si, ei) {
  var labels = sliceData(MONTHS, si, ei);
  var dso = labels.map(function(_, i) { return 35 + Math.round(Math.sin(i) * 5); });
  var dio = labels.map(function(_, i) { return 28 + Math.round(Math.cos(i) * 4); });
  var dpo = labels.map(function(_, i) { return 30 + Math.round(Math.sin(i + 1) * 3); });
  var ccc = labels.map(function(_, i) { return dso[i] + dio[i] - dpo[i]; });

  makeChart('chart-ccc', {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        { label: 'DSO (Days)', data: dso, borderColor: CHART_COLORS.blue, tension: .4 },
        { label: 'DIO (Days)', data: dio, borderColor: CHART_COLORS.orange, tension: .4 },
        { label: 'DPO (Days)', data: dpo, borderColor: CHART_COLORS.green, tension: .4 },
        { label: 'CCC (Days)', data: ccc, borderColor: CHART_COLORS.red, borderWidth: 3, tension: .4 },
      ]
    },
    options: {
      responsive: true,
      scales: { y: { min: 15, max: 50 } },
      plugins: {
        tooltip: { callbacks: { label: function(ctx) { return ' ' + ctx.dataset.label + ': ' + ctx.parsed.y + ' days'; } } }
      }
    }
  });
}

function renderCashFlowTable(si, ei) {
  var tbody = document.getElementById('cashflow-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  var rows = [
    { name: 'Operating Cash Flow', data: CASH_FLOW.operating, cls: '' },
    { name: 'Investing Cash Flow', data: CASH_FLOW.investing, cls: '' },
    { name: 'Financing Cash Flow', data: CASH_FLOW.financing, cls: '' },
    { name: 'Net Cash Flow', data: CASH_FLOW.operating.map(function(v, i) { return v + CASH_FLOW.investing[i] + CASH_FLOW.financing[i]; }), cls: 'total-row' },
    { name: 'Free Cash Flow', data: CASH_FLOW.operating.map(function(v, i) { return v + CASH_FLOW.investing[i]; }), cls: 'total-row' },
  ];
  rows.forEach(function(row) {
    var tr = document.createElement('tr');
    if (row.cls) tr.className = row.cls;
    var html = '<td>' + row.name + '</td>';
    for (var i = 0; i < 12; i++) {
      var inRange = i >= si && i <= ei;
      var val = row.data[i];
      var neg = val < 0 ? ' class="negative"' : '';
      html += '<td' + neg + ' style="' + (inRange ? '' : 'opacity:.3') + '">' + (val < 0 ? '-' : '') + fmt(Math.abs(val)) + '</td>';
    }
    var total = sumArr(sliceData(row.data, si, ei));
    html += '<td><strong>' + (total < 0 ? '-' : '') + fmt(Math.abs(total)) + '</strong></td>';
    tr.innerHTML = html;
    tbody.appendChild(tr);
  });
}

// ===== Navigation =====
document.querySelectorAll('.nav-item').forEach(function(item) {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
    item.classList.add('active');
    var page = item.dataset.page;
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    document.getElementById('page-' + page).classList.add('active');
    var titles = { overview: 'Financial Health Dashboard', income: 'Income Statement', balance: 'Balance Sheet', cashflow: 'Cash Flow Analysis' };
    document.getElementById('page-title').textContent = titles[page];
    renderAll();
  });
});

// ===== Apply Filter =====
document.getElementById('btn-apply').addEventListener('click', renderAll);

// ===== Render All =====
function renderAll() {
  var range = getFilteredRange();
  var si = range[0];
  var ei = range[1];
  var dept = getSelectedDept();

  // Overview
  updateKPIs(dept, si, ei);
  renderHealthGauge();
  renderExpenseBreakdown(si, ei);
  renderProfitabilityChart(dept, si, ei);
  renderRevVsExp(dept, si, ei);
  renderForecast(dept);
  renderYoY(dept, si, ei);

  // Income Statement
  renderIncomeKPIs(si, ei);
  renderIncomeWaterfall(si, ei);
  renderMargins(si, ei);
  renderIncomeTable(si, ei);

  // Balance Sheet
  renderBalanceKPIs();
  renderAssetsLiab();
  renderAssetComp();
  renderDTE();
  renderWorkingCap();
  renderBalanceTable();

  // Cash Flow
  renderCashFlowKPIs(si, ei);
  renderCFBreakdown(si, ei);
  renderCFComponents(si, ei);
  renderFCF(si, ei);
  renderCCC(si, ei);
  renderCashFlowTable(si, ei);
}

// ===== Initial Render =====
renderAll();
