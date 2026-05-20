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
  label: ctx => {
    const val = ctx.parsed.y ?? ctx.parsed;
    if (typeof val === 'number') return ` ${ctx.dataset.label}: $${val.toLocaleString()}`;
    return ` ${ctx.dataset.label}: ${val}`;
  }
};

// ===== Helpers =====
function fmt(n) { return '$' + Math.abs(n).toLocaleString(); }
function pct(n, d) { return ((n / d) * 100).toFixed(1) + '%'; }

function getFilteredRange() {
  const start = document.getElementById('date-start').value;
  const end = document.getElementById('date-end').value;
  const si = parseInt(start.split('-')[1], 10) - 1;
  const ei = parseInt(end.split('-')[1], 10) - 1;
  return [Math.max(0, si), Math.min(11, ei)];
}

function getSelectedDept() {
  return document.getElementById('dept-filter').value;
}

function sliceData(arr, si, ei) {
  return arr.slice(si, ei + 1);
}

function sumArr(arr) { return arr.reduce((a, b) => a + b, 0); }

function getRevenue(dept, si, ei) {
  if (dept === 'all') {
    return sliceData(INCOME_STATEMENT['Revenue'], si, ei);
  }
  return sliceData(DEPT_REVENUE[dept], si, ei);
}

function getExpenses(dept, si, ei) {
  if (dept === 'all') {
    return sliceData(INCOME_STATEMENT['Operating Expenses'], si, ei);
  }
  return sliceData(DEPT_EXPENSES[dept], si, ei);
}

// ===== Destroy & Create Chart Helper =====
function makeChart(id, config) {
  if (chartInstances[id]) chartInstances[id].destroy();
  const ctx = document.getElementById(id);
  if (!ctx) return null;
  chartInstances[id] = new Chart(ctx, config);
  return chartInstances[id];
}

// ===== Update KPIs =====
function updateKPIs(dept, si, ei) {
  const rev = getRevenue(dept, si, ei);
  const exp = getExpenses(dept, si, ei);
  const totalRev = sumArr(rev);
  const totalExp = sumArr(exp);
  const netProfit = totalRev - totalExp;
  const cf = sliceData(CASH_FLOW.operating, si, ei);
  const totalCF = sumArr(cf);

  document.getElementById('kpi-revenue').textContent = fmt(totalRev);
  document.getElementById('kpi-expenses').textContent = fmt(totalExp);
  document.getElementById('kpi-profit').textContent = fmt(netProfit);
  document.getElementById('kpi-cashflow').textContent = fmt(totalCF);

  const revChange = 12.4, expChange = 8.1;
  const profitChange = ((totalRev - totalExp) / totalExp * 100).toFixed(1);
  const cfChange = 18.3;

  setChange('kpi-revenue-change', revChange);
  setChange('kpi-expenses-change', -expChange);
  setChange('kpi-profit-change', profitChange);
  setChange('kpi-cashflow-change', cfChange);
}

function setChange(id, val) {
  const el = document.getElementById(id);
  const v = parseFloat(val);
  if (id.includes('expense')) {
    el.textContent = `▲ ${Math.abs(v)}% vs LY`;
    el.className = 'kpi-change negative';
  } else if (v >= 0) {
    el.textContent = `▲ ${v}% vs LY`;
    el.className = 'kpi-change positive';
  } else {
    el.textContent = `▼ ${Math.abs(v)}% vs LY`;
    el.className = 'kpi-change negative';
  }
}

// ===== Overview Charts =====
function renderProfitabilityChart(dept, si, ei) {
  const labels = sliceData(MONTHS, si, ei);
  const rev = getRevenue(dept, si, ei);
  const exp = getExpenses(dept, si, ei);
  const profit = rev.map((r, i) => r - exp[i]);

  makeChart('chart-profitability', {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Revenue', data: rev, borderColor: CHART_COLORS.green, backgroundColor: 'rgba(39,174,96,.1)', fill: true, tension: .4 },
        { label: 'Expenses', data: exp, borderColor: CHART_COLORS.red, backgroundColor: 'rgba(235,87,87,.1)', fill: true, tension: .4 },
        { label: 'Net Profit', data: profit, borderColor: CHART_COLORS.blue, backgroundColor: 'rgba(45,156,219,.1)', fill: true, tension: .4 },
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: { ticks: { callback: v => '$' + (v/1000) + 'k' } }
      }
    }
  });
}

function renderExpenseBreakdown(si, ei) {
  const depts = ['Sales','Marketing','Operations','HR','IT'];
  const keys = ['sales','marketing','operations','hr','it'];
  const values = keys.map(k => sumArr(sliceData(DEPT_EXPENSES[k], si, ei)));
  const colors = [CHART_COLORS.blue, CHART_COLORS.orange, CHART_COLORS.green, CHART_COLORS.purple, CHART_COLORS.teal];

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
            label: ctx => ` ${ctx.label}: $${ctx.parsed.toLocaleString()} (${pct(ctx.parsed, sumArr(values))})`
          }
        }
      }
    }
  });
}

function renderRevVsExp(dept, si, ei) {
  const labels = sliceData(MONTHS, si, ei);
  const rev = getRevenue(dept, si, ei);
  const exp = getExpenses(dept, si, ei);

  makeChart('chart-rev-vs-exp', {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Revenue', data: rev, backgroundColor: CHART_COLORS.green, borderRadius: 4, barPercentage: .6 },
        { label: 'Expenses', data: exp, backgroundColor: CHART_COLORS.red, borderRadius: 4, barPercentage: .6 },
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { ticks: { callback: v => '$' + (v/1000) + 'k' } }
      }
    }
  });
}

function renderForecast(dept, si, ei) {
  const rev = dept === 'all' ? INCOME_STATEMENT['Revenue'] : DEPT_REVENUE[dept];
  const forecastData = generateForecast(rev, 6);
  const labels = [...MONTHS, ...FORECAST_MONTHS];
  const actual = [...rev, ...Array(6).fill(null)];
  const forecast = [...Array(11).fill(null), rev[11], ...forecastData];

  makeChart('chart-forecast', {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Actual Revenue', data: actual, borderColor: CHART_COLORS.green, backgroundColor: 'rgba(39,174,96,.08)', fill: true, tension: .4 },
        { label: 'Forecast', data: forecast, borderColor: CHART_COLORS.yellow, borderDash: [6, 4], backgroundColor: 'rgba(242,201,76,.08)', fill: true, tension: .4, pointStyle: 'triangle' },
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { ticks: { callback: v => '$' + (v/1000) + 'k' } }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => {
              if (ctx.parsed.y == null) return '';
              return ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}`;
            }
          }
        }
      }
    }
  });
}

// ===== Income Statement Page =====
function renderIncomeWaterfall(si, ei) {
  const labels = sliceData(MONTHS, si, ei);
  const revenue = sliceData(INCOME_STATEMENT['Revenue'], si, ei);
  const cogs = sliceData(INCOME_STATEMENT['COGS'], si, ei);
  const opex = sliceData(INCOME_STATEMENT['Operating Expenses'], si, ei);
  const netIncome = sliceData(INCOME_STATEMENT['Net Income'], si, ei);

  makeChart('chart-income-waterfall', {
    type: 'bar',
    data: {
      labels,
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
        y: { ticks: { callback: v => '$' + (v/1000) + 'k' } }
      }
    }
  });
}

function renderMargins(si, ei) {
  const labels = sliceData(MONTHS, si, ei);
  const rev = sliceData(INCOME_STATEMENT['Revenue'], si, ei);
  const gp = sliceData(INCOME_STATEMENT['Gross Profit'], si, ei);
  const oi = sliceData(INCOME_STATEMENT['Operating Income'], si, ei);
  const ni = sliceData(INCOME_STATEMENT['Net Income'], si, ei);

  const grossM = gp.map((v, i) => ((v / rev[i]) * 100).toFixed(1));
  const opM = oi.map((v, i) => ((v / rev[i]) * 100).toFixed(1));
  const netM = ni.map((v, i) => ((v / rev[i]) * 100).toFixed(1));

  makeChart('chart-margins', {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Gross Margin', data: grossM, borderColor: CHART_COLORS.green, tension: .4 },
        { label: 'Operating Margin', data: opM, borderColor: CHART_COLORS.blue, tension: .4 },
        { label: 'Net Margin', data: netM, borderColor: CHART_COLORS.purple, tension: .4 },
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { ticks: { callback: v => v + '%' }, min: 0, max: 70 }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%`
          }
        }
      }
    }
  });
}

function renderIncomeTable(si, ei) {
  const tbody = document.getElementById('income-tbody');
  tbody.innerHTML = '';
  const items = Object.keys(INCOME_STATEMENT);
  const totalsRow = ['Revenue','Gross Profit','Net Income'];
  items.forEach(item => {
    const vals = INCOME_STATEMENT[item];
    const tr = document.createElement('tr');
    if (totalsRow.includes(item)) tr.classList.add('total-row');
    let html = `<td>${item}</td>`;
    for (let i = 0; i < 12; i++) {
      const inRange = i >= si && i <= ei;
      html += `<td style="${inRange ? '' : 'opacity:.3'}">${fmt(vals[i])}</td>`;
    }
    html += `<td><strong>${fmt(sumArr(sliceData(vals, si, ei)))}</strong></td>`;
    tr.innerHTML = html;
    tbody.appendChild(tr);
  });
}

// ===== Balance Sheet Page =====
function renderAssetsLiab() {
  const quarters = ['Q1','Q2','Q3','Q4'];
  makeChart('chart-assets-liab', {
    type: 'bar',
    data: {
      labels: quarters,
      datasets: [
        { label: 'Total Assets', data: BALANCE_SHEET['Total Assets'], backgroundColor: CHART_COLORS.green, borderRadius: 4 },
        { label: 'Total Liabilities', data: BALANCE_SHEET['Total Liabilities'], backgroundColor: CHART_COLORS.red, borderRadius: 4 },
        { label: 'Total Equity', data: BALANCE_SHEET['Total Equity'], backgroundColor: CHART_COLORS.blue, borderRadius: 4 },
      ]
    },
    options: {
      responsive: true,
      scales: { y: { ticks: { callback: v => '$' + (v/1000) + 'k' } } }
    }
  });
}

function renderAssetComp() {
  const q4 = [
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
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: $${ctx.parsed.toLocaleString()}` } }
      }
    }
  });
}

function renderDTE() {
  const quarters = ['Q1','Q2','Q3','Q4'];
  const dte = BALANCE_SHEET['Total Liabilities'].map((l, i) => (l / BALANCE_SHEET['Total Equity'][i]).toFixed(2));
  makeChart('chart-dte', {
    type: 'line',
    data: {
      labels: quarters,
      datasets: [{ label: 'D/E Ratio', data: dte, borderColor: CHART_COLORS.orange, backgroundColor: 'rgba(242,153,74,.12)', fill: true, tension: .4, pointRadius: 6 }]
    },
    options: {
      responsive: true,
      scales: { y: { min: 0, max: 1.2 } },
      plugins: { tooltip: { callbacks: { label: ctx => ` D/E Ratio: ${ctx.parsed.y}` } } }
    }
  });
}

function renderWorkingCap() {
  const quarters = ['Q1','Q2','Q3','Q4'];
  const wc = BALANCE_SHEET['Total Current Assets'].map((a, i) => a - BALANCE_SHEET['Total Current Liabilities'][i]);
  makeChart('chart-working-cap', {
    type: 'bar',
    data: {
      labels: quarters,
      datasets: [{ label: 'Working Capital', data: wc, backgroundColor: CHART_COLORS.teal, borderRadius: 6 }]
    },
    options: {
      responsive: true,
      scales: { y: { ticks: { callback: v => '$' + (v/1000) + 'k' } } }
    }
  });
}

function renderBalanceTable() {
  const tbody = document.getElementById('balance-tbody');
  tbody.innerHTML = '';
  const totalsRow = ['Total Current Assets','Total Assets','Total Current Liabilities','Total Liabilities','Total Equity'];
  Object.keys(BALANCE_SHEET).forEach(item => {
    const vals = BALANCE_SHEET[item];
    const tr = document.createElement('tr');
    if (totalsRow.includes(item)) tr.classList.add('total-row');
    let html = `<td>${item}</td>`;
    vals.forEach(v => { html += `<td>${fmt(v)}</td>`; });
    tr.innerHTML = html;
    tbody.appendChild(tr);
  });
}

// ===== Cash Flow Page =====
function renderCFBreakdown(si, ei) {
  const labels = sliceData(MONTHS, si, ei);
  makeChart('chart-cf-breakdown', {
    type: 'bar',
    data: {
      labels,
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
        y: { stacked: true, ticks: { callback: v => '$' + (v/1000) + 'k' } }
      }
    }
  });
}

function renderCFComponents(si, ei) {
  const op = sumArr(sliceData(CASH_FLOW.operating, si, ei));
  const inv = Math.abs(sumArr(sliceData(CASH_FLOW.investing, si, ei)));
  const fin = Math.abs(sumArr(sliceData(CASH_FLOW.financing, si, ei)));

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
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: $${ctx.parsed.toLocaleString()}` } }
      }
    }
  });
}

function renderFCF(si, ei) {
  const labels = sliceData(MONTHS, si, ei);
  const fcf = sliceData(CASH_FLOW.operating, si, ei).map((v, i) => v + sliceData(CASH_FLOW.investing, si, ei)[i]);
  makeChart('chart-fcf', {
    type: 'line',
    data: {
      labels,
      datasets: [{ label: 'Free Cash Flow', data: fcf, borderColor: CHART_COLORS.teal, backgroundColor: 'rgba(111,207,151,.12)', fill: true, tension: .4, pointRadius: 5 }]
    },
    options: {
      responsive: true,
      scales: { y: { ticks: { callback: v => '$' + (v/1000) + 'k' } } }
    }
  });
}

function renderCCC(si, ei) {
  const labels = sliceData(MONTHS, si, ei);
  const dso = labels.map((_, i) => 35 + Math.round(Math.sin(i) * 5));
  const dio = labels.map((_, i) => 28 + Math.round(Math.cos(i) * 4));
  const dpo = labels.map((_, i) => 30 + Math.round(Math.sin(i + 1) * 3));
  const ccc = labels.map((_, i) => dso[i] + dio[i] - dpo[i]);

  makeChart('chart-ccc', {
    type: 'line',
    data: {
      labels,
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
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} days` } }
      }
    }
  });
}

// ===== HR Analytics Page =====
function updateHRKPIs(si, ei) {
  const headcount = getTotalHeadcount(ei);
  document.getElementById('kpi-hr-headcount').textContent = headcount;

  const rates = sliceData(HR_TURNOVER_RATE, si, ei);
  const avgTurnover = (sumArr(rates) / rates.length).toFixed(1);
  document.getElementById('kpi-hr-turnover').textContent = avgTurnover + '%';

  const satValues = Object.values(HR_SATISFACTION).map(s => s[3]);
  const avgSat = (sumArr(satValues) / satValues.length).toFixed(1);
  document.getElementById('kpi-hr-satisfaction').textContent = avgSat;

  const openPos = sumArr(Object.values(HR_OPEN_POSITIONS));
  document.getElementById('kpi-hr-openpos').textContent = openPos;

  setChange('kpi-hr-headcount-change', 25.4);
  document.getElementById('kpi-hr-turnover-change').textContent = '▼ 1.2% vs LY';
  document.getElementById('kpi-hr-turnover-change').className = 'kpi-change positive';
  setChange('kpi-hr-satisfaction-change', 0.3);
  document.getElementById('kpi-hr-openpos-change').textContent = '▲ 4 vs LY';
  document.getElementById('kpi-hr-openpos-change').className = 'kpi-change negative';
}

function renderHRPipeline(si, ei) {
  const labels = sliceData(HR_MONTHS, si, ei);
  makeChart('chart-hr-pipeline', {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Applications', data: sliceData(HR_RECRUITMENT.applications, si, ei), backgroundColor: CHART_COLORS.blue, borderRadius: 4 },
        { label: 'Screened', data: sliceData(HR_RECRUITMENT.screened, si, ei), backgroundColor: CHART_COLORS.teal, borderRadius: 4 },
        { label: 'Interviewed', data: sliceData(HR_RECRUITMENT.interviewed, si, ei), backgroundColor: CHART_COLORS.orange, borderRadius: 4 },
        { label: 'Offered', data: sliceData(HR_RECRUITMENT.offered, si, ei), backgroundColor: CHART_COLORS.purple, borderRadius: 4 },
        { label: 'Hired', data: sliceData(HR_RECRUITMENT.hired, si, ei), backgroundColor: CHART_COLORS.green, borderRadius: 4 },
      ]
    },
    options: {
      responsive: true,
      plugins: { tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}` } } }
    }
  });
}

function renderHRTurnover(si, ei) {
  const labels = sliceData(HR_MONTHS, si, ei);
  const vol = sliceData(HR_TURNOVER.voluntary, si, ei);
  const invol = sliceData(HR_TURNOVER.involuntary, si, ei);
  const rate = sliceData(HR_TURNOVER_RATE, si, ei);

  makeChart('chart-hr-turnover', {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Voluntary', data: vol, backgroundColor: CHART_COLORS.orange, borderRadius: 4, stack: 'stack0' },
        { label: 'Involuntary', data: invol, backgroundColor: CHART_COLORS.red, borderRadius: 4, stack: 'stack0' },
        { label: 'Turnover Rate %', data: rate, type: 'line', borderColor: CHART_COLORS.yellow, backgroundColor: 'rgba(242,201,76,.1)', fill: true, tension: .4, yAxisID: 'y1' },
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { stacked: true, title: { display: true, text: 'Separations', color: '#9aa0b0' } },
        y1: { position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Rate %', color: '#9aa0b0' }, min: 0, max: 5 },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => {
              if (ctx.dataset.label === 'Turnover Rate %') return ` ${ctx.dataset.label}: ${ctx.parsed.y}%`;
              return ` ${ctx.dataset.label}: ${ctx.parsed.y}`;
            }
          }
        }
      }
    }
  });
}

function renderHRSatisfaction() {
  const depts = ['Sales','Marketing','Operations','HR','IT'];
  const keys = ['sales','marketing','operations','hr','it'];
  const q4Scores = keys.map(k => HR_SATISFACTION[k][3]);
  const q3Scores = keys.map(k => HR_SATISFACTION[k][2]);

  makeChart('chart-hr-satisfaction', {
    type: 'radar',
    data: {
      labels: depts,
      datasets: [
        { label: 'Q4 Score', data: q4Scores, borderColor: CHART_COLORS.green, backgroundColor: 'rgba(39,174,96,.15)', pointRadius: 5 },
        { label: 'Q3 Score', data: q3Scores, borderColor: CHART_COLORS.blue, backgroundColor: 'rgba(45,156,219,.1)', pointRadius: 5 },
      ]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          min: 2.5, max: 5,
          ticks: { stepSize: 0.5, color: '#9aa0b0', backdropColor: 'transparent' },
          grid: { color: '#363d52' },
          angleLines: { color: '#363d52' },
          pointLabels: { color: '#e8eaed', font: { size: 11 } },
        }
      },
      plugins: {
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.r}` } }
      }
    }
  });
}

function renderHRPerformance() {
  makeChart('chart-hr-performance', {
    type: 'doughnut',
    data: {
      labels: HR_PERFORMANCE.labels,
      datasets: [{
        data: HR_PERFORMANCE.counts,
        backgroundColor: [CHART_COLORS.red, CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.yellow],
        borderWidth: 0,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: ctx => {
              const total = sumArr(HR_PERFORMANCE.counts);
              return ` ${ctx.label}: ${ctx.parsed} (${pct(ctx.parsed, total)})`;
            }
          }
        }
      }
    }
  });
}

function renderHRHeadcount(si, ei) {
  const labels = sliceData(HR_MONTHS, si, ei);
  const depts = ['Sales','Marketing','Operations','HR','IT'];
  const keys = ['sales','marketing','operations','hr','it'];
  const colors = [CHART_COLORS.blue, CHART_COLORS.orange, CHART_COLORS.green, CHART_COLORS.purple, CHART_COLORS.teal];

  makeChart('chart-hr-headcount', {
    type: 'line',
    data: {
      labels,
      datasets: keys.map((k, i) => ({
        label: depts[i],
        data: sliceData(HR_HEADCOUNT[k], si, ei),
        borderColor: colors[i],
        tension: .4,
        pointRadius: 3,
      }))
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} employees` } }
      }
    }
  });
}

function renderHREngagement(si, ei) {
  const labels = sliceData(HR_MONTHS, si, ei);
  const data = sliceData(HR_ENGAGEMENT, si, ei);

  makeChart('chart-hr-engagement', {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Engagement Index',
        data,
        borderColor: CHART_COLORS.purple,
        backgroundColor: 'rgba(155,81,224,.12)',
        fill: true,
        tension: .4,
        pointRadius: 5,
      }]
    },
    options: {
      responsive: true,
      scales: { y: { min: 50, max: 100, title: { display: true, text: 'Score (0-100)', color: '#9aa0b0' } } },
      plugins: { tooltip: { callbacks: { label: ctx => ` Engagement: ${ctx.parsed.y}/100` } } }
    }
  });
}

function renderHRForecast() {
  const hiringForecast = generateHRHiringForecast();
  const headcountForecast = generateHRHeadcountForecast();
  const totalByMonth = HR_MONTHS.map((_, i) => getTotalHeadcount(i));

  const labels = [...HR_MONTHS, ...HR_FORECAST_MONTHS];
  const actualHires = [...HR_RECRUITMENT.hired, ...Array(6).fill(null)];
  const forecastHires = [...Array(11).fill(null), HR_RECRUITMENT.hired[11], ...hiringForecast];
  const actualHC = [...totalByMonth, ...Array(6).fill(null)];
  const forecastHC = [...Array(11).fill(null), totalByMonth[11], ...headcountForecast];

  makeChart('chart-hr-forecast', {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Actual Hires', data: actualHires, borderColor: CHART_COLORS.green, backgroundColor: 'rgba(39,174,96,.08)', fill: true, tension: .4 },
        { label: 'Forecast Hires', data: forecastHires, borderColor: CHART_COLORS.yellow, borderDash: [6, 4], backgroundColor: 'rgba(242,201,76,.08)', fill: true, tension: .4, pointStyle: 'triangle' },
        { label: 'Actual Headcount', data: actualHC, borderColor: CHART_COLORS.blue, tension: .4, yAxisID: 'y1' },
        { label: 'Forecast Headcount', data: forecastHC, borderColor: CHART_COLORS.orange, borderDash: [6, 4], tension: .4, pointStyle: 'triangle', yAxisID: 'y1' },
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: { title: { display: true, text: 'Monthly Hires', color: '#9aa0b0' } },
        y1: { position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Headcount', color: '#9aa0b0' } },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => {
              if (ctx.parsed.y == null) return '';
              return ` ${ctx.dataset.label}: ${ctx.parsed.y}`;
            }
          }
        }
      }
    }
  });
}

function renderHRDeptTurnover() {
  const depts = ['Sales','Marketing','Operations','HR','IT'];
  const keys = ['sales','marketing','operations','hr','it'];
  const values = keys.map(k => HR_DEPT_TURNOVER[k]);
  const colors = values.map(v => v > 12 ? CHART_COLORS.red : v > 9 ? CHART_COLORS.orange : CHART_COLORS.green);

  makeChart('chart-hr-dept-turnover', {
    type: 'bar',
    data: {
      labels: depts,
      datasets: [{
        label: 'Annual Turnover %',
        data: values,
        backgroundColor: colors,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      indexAxis: 'y',
      scales: { x: { ticks: { callback: v => v + '%' }, max: 20 } },
      plugins: {
        tooltip: { callbacks: { label: ctx => ` Turnover: ${ctx.parsed.x}%` } },
        legend: { display: false },
      }
    }
  });
}

function renderHRCostPerHire(si, ei) {
  const labels = sliceData(HR_MONTHS, si, ei);
  const data = sliceData(HR_COST_PER_HIRE, si, ei);

  makeChart('chart-hr-cost', {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Cost per Hire',
        data,
        borderColor: CHART_COLORS.orange,
        backgroundColor: 'rgba(242,153,74,.12)',
        fill: true,
        tension: .4,
        pointRadius: 5,
      }]
    },
    options: {
      responsive: true,
      scales: { y: { ticks: { callback: v => '$' + v.toLocaleString() } } },
      plugins: { tooltip: { callbacks: { label: ctx => ` Cost per Hire: $${ctx.parsed.y.toLocaleString()}` } } }
    }
  });
}

function renderHRTimeToHire(si, ei) {
  const labels = sliceData(HR_MONTHS, si, ei);
  const data = sliceData(HR_TIME_TO_HIRE, si, ei);

  makeChart('chart-hr-time', {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Time to Hire (Days)',
        data,
        backgroundColor: CHART_COLORS.teal,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      scales: { y: { title: { display: true, text: 'Days', color: '#9aa0b0' } } },
      plugins: {
        tooltip: { callbacks: { label: ctx => ` Time to Hire: ${ctx.parsed.y} days` } },
        legend: { display: false },
      }
    }
  });
}

function renderHRTable(si, ei) {
  const tbody = document.getElementById('hr-tbody');
  tbody.innerHTML = '';
  const metrics = {
    'Applications': HR_RECRUITMENT.applications,
    'Screened': HR_RECRUITMENT.screened,
    'Interviewed': HR_RECRUITMENT.interviewed,
    'Offered': HR_RECRUITMENT.offered,
    'Hired': HR_RECRUITMENT.hired,
    'Cost per Hire': HR_COST_PER_HIRE,
    'Time to Hire (Days)': HR_TIME_TO_HIRE,
    'Voluntary Separations': HR_TURNOVER.voluntary,
    'Involuntary Separations': HR_TURNOVER.involuntary,
    'Turnover Rate %': HR_TURNOVER_RATE,
  };

  const isCurrency = ['Cost per Hire'];
  const isPercent = ['Turnover Rate %'];
  const isAvg = ['Cost per Hire', 'Time to Hire (Days)', 'Turnover Rate %'];

  Object.entries(metrics).forEach(([label, data]) => {
    const tr = document.createElement('tr');
    if (label === 'Hired' || label === 'Turnover Rate %') tr.classList.add('total-row');
    let html = `<td>${label}</td>`;
    for (let i = 0; i < 12; i++) {
      const inRange = i >= si && i <= ei;
      let val = data[i];
      if (isCurrency.includes(label)) val = '$' + val.toLocaleString();
      else if (isPercent.includes(label)) val = val + '%';
      html += `<td style="${inRange ? '' : 'opacity:.3'}">${val}</td>`;
    }
    const rangeData = sliceData(data, si, ei);
    let total;
    if (isAvg.includes(label)) {
      total = (sumArr(rangeData) / rangeData.length).toFixed(1);
      if (isCurrency.includes(label)) total = '$' + parseFloat(total).toLocaleString();
      else if (isPercent.includes(label)) total = total + '%';
    } else {
      total = sumArr(rangeData);
    }
    html += `<td><strong>${total}</strong></td>`;
    tr.innerHTML = html;
    tbody.appendChild(tr);
  });
}

// ===== Navigation =====
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    const page = item.dataset.page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    const titles = { overview: 'Financial Health Dashboard', income: 'Income Statement', balance: 'Balance Sheet', cashflow: 'Cash Flow Analysis', hr: 'HR Analytics Dashboard' };
    document.getElementById('page-title').textContent = titles[page];
    renderAll();
  });
});

// ===== Apply Filter =====
document.getElementById('btn-apply').addEventListener('click', renderAll);

// ===== Render All =====
function renderAll() {
  const [si, ei] = getFilteredRange();
  const dept = getSelectedDept();

  // Overview
  updateKPIs(dept, si, ei);
  renderProfitabilityChart(dept, si, ei);
  renderExpenseBreakdown(si, ei);
  renderRevVsExp(dept, si, ei);
  renderForecast(dept, si, ei);

  // Income Statement
  renderIncomeWaterfall(si, ei);
  renderMargins(si, ei);
  renderIncomeTable(si, ei);

  // Balance Sheet
  renderAssetsLiab();
  renderAssetComp();
  renderDTE();
  renderWorkingCap();
  renderBalanceTable();

  // Cash Flow
  renderCFBreakdown(si, ei);
  renderCFComponents(si, ei);
  renderFCF(si, ei);
  renderCCC(si, ei);

  // HR Analytics
  updateHRKPIs(si, ei);
  renderHRPipeline(si, ei);
  renderHRTurnover(si, ei);
  renderHRSatisfaction();
  renderHRPerformance();
  renderHRHeadcount(si, ei);
  renderHREngagement(si, ei);
  renderHRForecast();
  renderHRDeptTurnover();
  renderHRCostPerHire(si, ei);
  renderHRTimeToHire(si, ei);
  renderHRTable(si, ei);
}

// ===== Initial Render =====
renderAll();
