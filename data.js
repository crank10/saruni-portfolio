// ===== HR Analytics Data — SME Corp FY 2025 =====

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Headcount by department (end-of-month)
const HR_HEADCOUNT = {
  sales:      [48, 49, 50, 52, 51, 53, 55, 54, 56, 57, 58, 60],
  marketing:  [22, 22, 23, 24, 24, 25, 25, 26, 26, 27, 28, 28],
  operations: [35, 35, 36, 36, 37, 38, 38, 39, 40, 40, 41, 42],
  hr:         [10, 10, 10, 11, 11, 11, 12, 12, 12, 12, 13, 13],
  it:         [18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 24],
};

function getTotalHeadcount(monthIdx) {
  return Object.values(HR_HEADCOUNT).reduce((s, arr) => s + arr[monthIdx], 0);
}

// Recruitment pipeline (monthly)
const HR_RECRUITMENT = {
  applications: [120, 135, 142, 165, 158, 172, 180, 175, 190, 198, 205, 215],
  screened:     [ 72,  81,  85, 102,  95, 107, 112, 108, 118, 123, 127, 134],
  interviewed:  [ 36,  42,  44,  52,  48,  55,  58,  54,  60,  63,  65,  68],
  offered:      [ 14,  16,  18,  22,  19,  23,  24,  22,  25,  26,  27,  29],
  hired:        [ 10,  12,  14,  18,  15,  19,  20,  18,  21,  22,  23,  25],
};

// Cost per hire ($)
const HR_COST_PER_HIRE = [4200, 4100, 3950, 3800, 3900, 3750, 3700, 3800, 3650, 3600, 3550, 3500];

// Time to hire (days)
const HR_TIME_TO_HIRE = [38, 36, 35, 33, 34, 32, 31, 32, 30, 29, 28, 27];

// Turnover — voluntary and involuntary separations per month
const HR_TURNOVER = {
  voluntary:   [3, 2, 4, 3, 5, 3, 4, 5, 3, 4, 3, 2],
  involuntary: [1, 1, 0, 1, 1, 2, 1, 0, 1, 1, 0, 1],
};

// Monthly turnover rate (%) = separations / avg headcount * 100
const HR_TURNOVER_RATE = MONTHS.map((_, i) => {
  const total = getTotalHeadcount(i);
  const sep = HR_TURNOVER.voluntary[i] + HR_TURNOVER.involuntary[i];
  return parseFloat(((sep / total) * 100).toFixed(1));
});

// Employee satisfaction scores by department (1-5 scale, quarterly survey)
const HR_SATISFACTION = {
  sales:      [3.8, 3.9, 4.0, 4.1],
  marketing:  [4.0, 4.1, 4.2, 4.3],
  operations: [3.5, 3.6, 3.7, 3.8],
  hr:         [4.2, 4.3, 4.3, 4.4],
  it:         [3.9, 4.0, 4.1, 4.2],
};

// Employee engagement index (monthly, 0-100)
const HR_ENGAGEMENT = [68, 70, 71, 73, 72, 74, 76, 75, 77, 78, 79, 81];

// Performance ratings distribution (company-wide, annual review)
const HR_PERFORMANCE = {
  labels: ['Needs Improvement', 'Meets Expectations', 'Exceeds Expectations', 'Outstanding'],
  counts: [12, 58, 45, 18],
};

// Performance by department (avg score 1-5)
const HR_PERF_BY_DEPT = {
  sales:      3.6,
  marketing:  3.8,
  operations: 3.4,
  hr:         4.0,
  it:         3.9,
};

// Open positions by department
const HR_OPEN_POSITIONS = {
  sales:      5,
  marketing:  3,
  operations: 4,
  hr:         1,
  it:         3,
};

// Turnover by department (annual %)
const HR_DEPT_TURNOVER = {
  sales:      14.2,
  marketing:  10.5,
  operations: 12.8,
  hr:         6.3,
  it:         9.1,
};

// Training & development budget by department ($)
const HR_TRAINING_BUDGET = {
  sales:      [12000, 12500, 13000, 14000],
  marketing:  [ 8000,  8500,  9000,  9500],
  operations: [10000, 10500, 11000, 11500],
  hr:         [ 5000,  5500,  5800,  6000],
  it:         [15000, 15500, 16000, 17000],
};

// Absenteeism rate by month (%)
const HR_ABSENTEEISM = [3.2, 3.5, 2.8, 3.0, 3.1, 2.9, 3.4, 3.6, 2.7, 2.5, 2.8, 3.0];

// Diversity — gender split (%)
const HR_DIVERSITY = {
  labels: ['Male', 'Female', 'Non-binary'],
  values: [58, 38, 4],
};

// Age distribution
const HR_AGE_DIST = {
  labels: ['18-25', '26-35', '36-45', '46-55', '55+'],
  counts: [22, 58, 45, 28, 14],
};

// Forecasting — simple linear extrapolation
function generateForecast(data, months) {
  const n = data.length;
  const xMean = (n - 1) / 2;
  const yMean = data.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (data[i] - yMean);
    den += (i - xMean) ** 2;
  }
  const slope = num / den;
  const intercept = yMean - slope * xMean;
  const forecast = [];
  for (let i = 0; i < months; i++) {
    forecast.push(Math.round(intercept + slope * (n + i)));
  }
  return forecast;
}

const FORECAST_MONTHS = ['Jan 26','Feb 26','Mar 26','Apr 26','May 26','Jun 26'];

function generateHRHiringForecast() {
  return generateForecast(HR_RECRUITMENT.hired, 6);
}

function generateHRHeadcountForecast() {
  const totalByMonth = MONTHS.map((_, i) => getTotalHeadcount(i));
  return generateForecast(totalByMonth, 6);
}

function generateTurnoverForecast() {
  return generateForecast(HR_TURNOVER_RATE, 6);
}
