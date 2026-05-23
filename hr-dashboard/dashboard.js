// ===== HR Dashboard Controller =====

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

// ===== Helpers =====
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

// ===== Destroy & Create Chart Helper =====
function makeChart(id, config) {
  if (chartInstances[id]) chartInstances[id].destroy();
  const ctx = document.getElementById(id);
  if (!ctx) return null;
  chartInstances[id] = new Chart(ctx, config);
  return chartInstances[id];
}

// ===== Update KPIs =====
function updateKPIs(si, ei) {
  const headcount = getTotalHeadcount(ei);
  document.getElementById('kpi-headcount').textContent = headcount;

  const turnoverSlice = sliceData(HR_TURNOVER_RATE, si, ei);
  const avgTurnover = (sumArr(turnoverSlice) / turnoverSlice.length).toFixed(1);
  document.getElementById('kpi-turnover').textContent = avgTurnover + '%';

  const depts = ['sales','marketing','operations','hr','it'];
  const avgSat = (depts.reduce((s, d) => s + HR_SATISFACTION[d][3], 0) / depts.length).toFixed(1);
  document.getElementById('kpi-satisfaction').textContent = avgSat;

  const openPos = sumArr(Object.values(HR_OPEN_POSITIONS));
  document.getElementById('kpi-openpos').textContent = openPos;
}

// ===== OVERVIEW PAGE CHARTS =====

function renderPipeline(si, ei) {
  const labels = sliceData(MONTHS, si, ei);
  const datasets = [
    { label: 'Applications', data: sliceData(HR_RECRUITMENT.applications, si, ei), backgroundColor: CHART_COLORS.blue, borderRadius: 4 },
    { label: 'Screened', data: sliceData(HR_RECRUITMENT.screened, si, ei), backgroundColor: CHART_COLORS.green, borderRadius: 4 },
    { label: 'Interviewed', data: sliceData(HR_RECRUITMENT.interviewed, si, ei), backgroundColor: CHART_COLORS.orange, borderRadius: 4 },
    { label: 'Offered', data: sliceData(HR_RECRUITMENT.offered, si, ei), backgroundColor: CHART_COLORS.purple, borderRadius: 4 },
    { label: 'Hired', data: sliceData(HR_RECRUITMENT.hired, si, ei), backgroundColor: CHART_COLORS.teal, borderRadius: 4 },
  ];

  makeChart('chart-pipeline', {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}` } } }
    }
  });
}

function renderTurnover(si, ei) {
  const labels = sliceData(MONTHS, si, ei);
  const vol = sliceData(HR_TURNOVER.voluntary, si, ei);
  const invol = sliceData(HR_TURNOVER.involuntary, si, ei);
  const rate = sliceData(HR_TURNOVER_RATE, si, ei);

  makeChart('chart-turnover', {
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

function renderSatisfaction() {
  const depts = ['Sales','Marketing','Operations','HR','IT'];
  const keys = ['sales','marketing','operations','hr','it'];
  const q4Scores = keys.map(k => HR_SATISFACTION[k][3]);
  const q3Scores = keys.map(k => HR_SATISFACTION[k][2]);

  makeChart('chart-satisfaction', {
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
      plugins: { tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.r}` } } }
    }
  });
}

function renderPerformance() {
  makeChart('chart-performance', {
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

function renderHeadcount(si, ei) {
  const labels = sliceData(MONTHS, si, ei);
  const depts = ['Sales','Marketing','Operations','HR','IT'];
  const keys = ['sales','marketing','operations','hr','it'];
  const colors = [CHART_COLORS.blue, CHART_COLORS.orange, CHART_COLORS.green, CHART_COLORS.purple, CHART_COLORS.teal];

  makeChart('chart-headcount', {
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
      plugins: { tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} employees` } } }
    }
  });
}

function renderEngagement(si, ei) {
  const labels = sliceData(MONTHS, si, ei);
  const data = sliceData(HR_ENGAGEMENT, si, ei);

  makeChart('chart-engagement', {
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

// ===== RECRUITMENT PAGE CHARTS =====

function renderFunnel(si, ei) {
  const stages = ['Applications', 'Screened', 'Interviewed', 'Offered', 'Hired'];
  const keys = ['applications', 'screened', 'interviewed', 'offered', 'hired'];
  const totals = keys.map(k => sumArr(sliceData(HR_RECRUITMENT[k], si, ei)));
  const convRates = totals.map((v, i) => i === 0 ? 100 : parseFloat(((v / totals[0]) * 100).toFixed(1)));

  makeChart('chart-funnel', {
    type: 'bar',
    data: {
      labels: stages,
      datasets: [
        { label: 'Count', data: totals, backgroundColor: [CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.orange, CHART_COLORS.purple, CHART_COLORS.teal], borderRadius: 6 },
      ]
    },
    options: {
      responsive: true,
      indexAxis: 'y',
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed.x} (${convRates[ctx.dataIndex]}% of applications)`
          }
        },
        legend: { display: false },
      }
    }
  });
}

function renderOpenPositions() {
  const depts = ['Sales','Marketing','Operations','HR','IT'];
  const keys = ['sales','marketing','operations','hr','it'];
  const values = keys.map(k => HR_OPEN_POSITIONS[k]);
  const colors = [CHART_COLORS.blue, CHART_COLORS.orange, CHART_COLORS.green, CHART_COLORS.purple, CHART_COLORS.teal];

  makeChart('chart-open-positions', {
    type: 'doughnut',
    data: {
      labels: depts,
      datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 8 }]
    },
    options: {
      responsive: true,
      cutout: '55%',
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} positions` } }
      }
    }
  });
}

function renderCostPerHire(si, ei) {
  const labels = sliceData(MONTHS, si, ei);
  const data = sliceData(HR_COST_PER_HIRE, si, ei);

  makeChart('chart-cost', {
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

function renderTimeToHire(si, ei) {
  const labels = sliceData(MONTHS, si, ei);
  const data = sliceData(HR_TIME_TO_HIRE, si, ei);

  makeChart('chart-time', {
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

function renderRecruitmentTable(si, ei) {
  const tbody = document.getElementById('recruitment-tbody');
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

// ===== WORKFORCE PAGE CHARTS =====

function renderDiversity() {
  makeChart('chart-diversity', {
    type: 'doughnut',
    data: {
      labels: HR_DIVERSITY.labels,
      datasets: [{
        data: HR_DIVERSITY.values,
        backgroundColor: [CHART_COLORS.blue, CHART_COLORS.pink, CHART_COLORS.purple],
        borderWidth: 0,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` } }
      }
    }
  });
}

function renderAgeDistribution() {
  makeChart('chart-age', {
    type: 'bar',
    data: {
      labels: HR_AGE_DIST.labels,
      datasets: [{
        label: 'Employees',
        data: HR_AGE_DIST.counts,
        backgroundColor: [CHART_COLORS.teal, CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.orange, CHART_COLORS.purple],
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed.y} employees` } }
      }
    }
  });
}

function renderDeptTurnover() {
  const depts = ['Sales','Marketing','Operations','HR','IT'];
  const keys = ['sales','marketing','operations','hr','it'];
  const values = keys.map(k => HR_DEPT_TURNOVER[k]);
  const colors = values.map(v => v > 12 ? CHART_COLORS.red : v > 9 ? CHART_COLORS.orange : CHART_COLORS.green);

  makeChart('chart-dept-turnover', {
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

function renderAbsenteeism(si, ei) {
  const labels = sliceData(MONTHS, si, ei);
  const data = sliceData(HR_ABSENTEEISM, si, ei);

  makeChart('chart-absenteeism', {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Absenteeism Rate',
        data,
        borderColor: CHART_COLORS.red,
        backgroundColor: 'rgba(235,87,87,.1)',
        fill: true,
        tension: .4,
        pointRadius: 5,
      }]
    },
    options: {
      responsive: true,
      scales: { y: { ticks: { callback: v => v + '%' }, min: 0, max: 5 } },
      plugins: { tooltip: { callbacks: { label: ctx => ` Absenteeism: ${ctx.parsed.y}%` } } }
    }
  });
}

function renderTraining() {
  const quarters = ['Q1','Q2','Q3','Q4'];
  const depts = ['Sales','Marketing','Operations','HR','IT'];
  const keys = ['sales','marketing','operations','hr','it'];
  const colors = [CHART_COLORS.blue, CHART_COLORS.orange, CHART_COLORS.green, CHART_COLORS.purple, CHART_COLORS.teal];

  makeChart('chart-training', {
    type: 'bar',
    data: {
      labels: quarters,
      datasets: keys.map((k, i) => ({
        label: depts[i],
        data: HR_TRAINING_BUDGET[k],
        backgroundColor: colors[i],
        borderRadius: 4,
      }))
    },
    options: {
      responsive: true,
      scales: { y: { ticks: { callback: v => '$' + (v / 1000) + 'k' } } },
      plugins: { tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}` } } }
    }
  });
}

function renderDeptComposition() {
  const depts = ['Sales','Marketing','Operations','HR','IT'];
  const values = depts.map((_, i) => {
    const keys = ['sales','marketing','operations','hr','it'];
    return HR_HEADCOUNT[keys[i]][11];
  });
  const colors = [CHART_COLORS.blue, CHART_COLORS.orange, CHART_COLORS.green, CHART_COLORS.purple, CHART_COLORS.teal];

  makeChart('chart-dept-composition', {
    type: 'pie',
    data: {
      labels: depts,
      datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 8 }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} (${pct(ctx.parsed, sumArr(values))})` } }
      }
    }
  });
}

// ===== PERFORMANCE PAGE CHARTS =====

function renderPerfDist() {
  makeChart('chart-perf-dist', {
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

function renderPerfByDept() {
  const depts = ['Sales','Marketing','Operations','HR','IT'];
  const keys = ['sales','marketing','operations','hr','it'];
  const values = keys.map(k => HR_PERF_BY_DEPT[k]);
  const colors = values.map(v => v >= 4.0 ? CHART_COLORS.green : v >= 3.7 ? CHART_COLORS.blue : CHART_COLORS.orange);

  makeChart('chart-perf-dept', {
    type: 'bar',
    data: {
      labels: depts,
      datasets: [{
        label: 'Avg Performance Score',
        data: values,
        backgroundColor: colors,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      scales: { y: { min: 0, max: 5, ticks: { stepSize: 1 } } },
      plugins: {
        tooltip: { callbacks: { label: ctx => ` Avg Score: ${ctx.parsed.y}/5` } },
        legend: { display: false },
      }
    }
  });
}

function renderSatisfactionTrend() {
  const quarters = ['Q1','Q2','Q3','Q4'];
  const depts = ['Sales','Marketing','Operations','HR','IT'];
  const keys = ['sales','marketing','operations','hr','it'];
  const colors = [CHART_COLORS.blue, CHART_COLORS.orange, CHART_COLORS.green, CHART_COLORS.purple, CHART_COLORS.teal];

  makeChart('chart-satisfaction-trend', {
    type: 'line',
    data: {
      labels: quarters,
      datasets: keys.map((k, i) => ({
        label: depts[i],
        data: HR_SATISFACTION[k],
        borderColor: colors[i],
        tension: .4,
        pointRadius: 5,
      }))
    },
    options: {
      responsive: true,
      scales: { y: { min: 3, max: 5, ticks: { stepSize: 0.5 } } },
      plugins: { tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}/5` } } }
    }
  });
}

function renderEngagement2(si, ei) {
  const labels = sliceData(MONTHS, si, ei);
  const data = sliceData(HR_ENGAGEMENT, si, ei);

  makeChart('chart-engagement2', {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Engagement Index',
        data,
        backgroundColor: data.map(v => v >= 75 ? CHART_COLORS.green : v >= 70 ? CHART_COLORS.blue : CHART_COLORS.orange),
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      scales: { y: { min: 50, max: 100 } },
      plugins: {
        tooltip: { callbacks: { label: ctx => ` Engagement: ${ctx.parsed.y}/100` } },
        legend: { display: false },
      }
    }
  });
}

// ===== PREDICTIVE ANALYTICS PAGE CHARTS =====

function renderHiringForecast() {
  const hiringForecast = generateHRHiringForecast();
  const labels = [...MONTHS, ...FORECAST_MONTHS];
  const actualHires = [...HR_RECRUITMENT.hired, ...Array(6).fill(null)];
  const forecastHires = [...Array(11).fill(null), HR_RECRUITMENT.hired[11], ...hiringForecast];

  makeChart('chart-forecast', {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Actual Hires', data: actualHires, borderColor: CHART_COLORS.green, backgroundColor: 'rgba(39,174,96,.08)', fill: true, tension: .4 },
        { label: 'Forecast Hires', data: forecastHires, borderColor: CHART_COLORS.yellow, borderDash: [6, 4], backgroundColor: 'rgba(242,201,76,.08)', fill: true, tension: .4, pointStyle: 'triangle' },
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: { y: { title: { display: true, text: 'Monthly Hires', color: '#9aa0b0' } } },
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

function renderHeadcountProjection() {
  const headcountForecast = generateHRHeadcountForecast();
  const totalByMonth = MONTHS.map((_, i) => getTotalHeadcount(i));
  const labels = [...MONTHS, ...FORECAST_MONTHS];
  const actualHC = [...totalByMonth, ...Array(6).fill(null)];
  const forecastHC = [...Array(11).fill(null), totalByMonth[11], ...headcountForecast];

  makeChart('chart-headcount-proj', {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Actual Headcount', data: actualHC, borderColor: CHART_COLORS.blue, backgroundColor: 'rgba(45,156,219,.08)', fill: true, tension: .4 },
        { label: 'Forecast Headcount', data: forecastHC, borderColor: CHART_COLORS.orange, borderDash: [6, 4], backgroundColor: 'rgba(242,153,74,.08)', fill: true, tension: .4, pointStyle: 'triangle' },
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
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

function renderTurnoverForecast() {
  const forecast = generateTurnoverForecast();
  const labels = [...MONTHS, ...FORECAST_MONTHS];
  const actual = [...HR_TURNOVER_RATE, ...Array(6).fill(null)];
  const forecastLine = [...Array(11).fill(null), HR_TURNOVER_RATE[11], ...forecast.map(v => Math.max(0, v / 10))];

  makeChart('chart-turnover-forecast', {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Actual Turnover %', data: actual, borderColor: CHART_COLORS.red, backgroundColor: 'rgba(235,87,87,.08)', fill: true, tension: .4 },
        { label: 'Forecast Turnover %', data: forecastLine, borderColor: CHART_COLORS.orange, borderDash: [6, 4], backgroundColor: 'rgba(242,153,74,.08)', fill: true, tension: .4, pointStyle: 'triangle' },
      ]
    },
    options: {
      responsive: true,
      scales: { y: { ticks: { callback: v => v + '%' }, min: 0, max: 5 } },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => {
              if (ctx.parsed.y == null) return '';
              return ` ${ctx.dataset.label}: ${ctx.parsed.y}%`;
            }
          }
        }
      }
    }
  });
}

function renderCostForecast() {
  const forecast = generateForecast(HR_COST_PER_HIRE, 6);
  const labels = [...MONTHS, ...FORECAST_MONTHS];
  const actual = [...HR_COST_PER_HIRE, ...Array(6).fill(null)];
  const forecastLine = [...Array(11).fill(null), HR_COST_PER_HIRE[11], ...forecast];

  makeChart('chart-cost-forecast', {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Actual Cost per Hire', data: actual, borderColor: CHART_COLORS.orange, backgroundColor: 'rgba(242,153,74,.08)', fill: true, tension: .4 },
        { label: 'Forecast Cost', data: forecastLine, borderColor: CHART_COLORS.yellow, borderDash: [6, 4], backgroundColor: 'rgba(242,201,76,.08)', fill: true, tension: .4, pointStyle: 'triangle' },
      ]
    },
    options: {
      responsive: true,
      scales: { y: { ticks: { callback: v => '$' + v.toLocaleString() } } },
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

// ===== Navigation =====
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    const page = item.dataset.page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    const titles = {
      overview: 'HR Analytics Dashboard',
      recruitment: 'Recruitment Analytics',
      workforce: 'Workforce Analytics',
      performance: 'Performance & Engagement',
      predictive: 'Predictive Analytics',
    };
    document.getElementById('page-title').textContent = titles[page];
    renderAll();
  });
});

// ===== Apply Filter =====
document.getElementById('btn-apply').addEventListener('click', renderAll);

// ===== Render All =====
function renderAll() {
  const [si, ei] = getFilteredRange();

  // Overview
  updateKPIs(si, ei);
  renderPipeline(si, ei);
  renderTurnover(si, ei);
  renderSatisfaction();
  renderPerformance();
  renderHeadcount(si, ei);
  renderEngagement(si, ei);

  // Recruitment
  renderFunnel(si, ei);
  renderOpenPositions();
  renderCostPerHire(si, ei);
  renderTimeToHire(si, ei);
  renderRecruitmentTable(si, ei);

  // Workforce
  renderDiversity();
  renderAgeDistribution();
  renderDeptTurnover();
  renderAbsenteeism(si, ei);
  renderTraining();
  renderDeptComposition();

  // Performance
  renderPerfDist();
  renderPerfByDept();
  renderSatisfactionTrend();
  renderEngagement2(si, ei);

  // Predictive
  renderHiringForecast();
  renderHeadcountProjection();
  renderTurnoverForecast();
  renderCostForecast();
}

// ===== Initial Render =====
renderAll();
