// ===== Financial Data for SME Corp FY 2025 =====

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Department-level monthly revenue
const DEPT_REVENUE = {
  sales:      [180000,195000,210000,225000,215000,240000,250000,245000,260000,270000,280000,290000],
  marketing:  [ 25000, 28000, 30000, 32000, 31000, 35000, 36000, 34000, 37000, 38000, 40000, 42000],
  operations: [ 10000, 11000, 12000, 12500, 12000, 13000, 13500, 13000, 14000, 14500, 15000, 15500],
  hr:         [  2000,  2000,  2200,  2200,  2100,  2500,  2500,  2400,  2600,  2700,  2800,  3000],
  it:         [  8000,  9000, 10000, 10500, 10000, 11000, 11500, 11000, 12000, 12500, 13000, 13500],
};

// Department-level monthly expenses
const DEPT_EXPENSES = {
  sales:      [120000,125000,130000,135000,132000,140000,142000,140000,145000,148000,150000,155000],
  marketing:  [ 30000, 32000, 34000, 35000, 33000, 37000, 38000, 36000, 39000, 40000, 42000, 44000],
  operations: [ 40000, 41000, 42000, 43000, 42500, 44000, 44500, 44000, 45000, 46000, 47000, 48000],
  hr:         [ 18000, 18500, 19000, 19500, 19000, 20000, 20500, 20000, 21000, 21500, 22000, 22500],
  it:         [ 15000, 15500, 16000, 16500, 16000, 17000, 17500, 17000, 18000, 18500, 19000, 19500],
};

// Income Statement line items (company-wide)
const INCOME_STATEMENT = {
  'Revenue':            [225000,245000,264200,282200,270100,301500,313500,305400,325600,337700,350800,364000],
  'COGS':               [90000, 98000,105680,112880,108040,120600,125400,122160,130240,135080,140320,145600],
  'Gross Profit':       [135000,147000,158520,169320,162060,180900,188100,183240,195360,202620,210480,218400],
  'Operating Expenses': [133000,137000,141000,144500,142500,151000,153500,151000,157000,160500,164000,168000],
  'EBITDA':             [ 22000, 30000, 37520, 44820, 39560, 49900, 54600, 52240, 58360, 62120, 66480, 70400],
  'Depreciation':       [  5000,  5000,  5000,  5000,  5000,  5000,  5000,  5000,  5000,  5000,  5000,  5000],
  'Operating Income':   [ 17000, 25000, 32520, 39820, 34560, 44900, 49600, 47240, 53360, 57120, 61480, 65400],
  'Interest Expense':   [  3000,  3000,  3000,  3000,  3000,  3000,  3000,  3000,  3000,  3000,  3000,  3000],
  'Tax (25%)':          [  3500,  5500,  7380,  9205,  7890, 10475, 11650, 11060, 12590, 13530, 14620, 15600],
  'Net Income':         [ 10500, 16500, 22140, 27615, 23670, 31425, 34950, 33180, 37770, 40590, 43860, 46800],
};

// Balance Sheet (quarterly)
const BALANCE_SHEET = {
  'Cash & Equivalents':     [320000, 385000, 460000, 545000],
  'Accounts Receivable':    [180000, 195000, 210000, 230000],
  'Inventory':              [ 95000, 100000, 105000, 110000],
  'Total Current Assets':   [595000, 680000, 775000, 885000],
  'Property & Equipment':   [450000, 445000, 440000, 435000],
  'Intangible Assets':      [ 80000,  78000,  76000,  74000],
  'Total Assets':           [1125000,1203000,1291000,1394000],
  'Accounts Payable':       [120000, 130000, 140000, 150000],
  'Short-term Debt':        [ 80000,  70000,  60000,  50000],
  'Total Current Liabilities':[200000, 200000, 200000, 200000],
  'Long-term Debt':         [300000, 280000, 260000, 240000],
  'Total Liabilities':      [500000, 480000, 460000, 440000],
  'Total Equity':           [625000, 723000, 831000, 954000],
};

// Cash Flow (monthly)
const CASH_FLOW = {
  operating: [25000, 35000, 40000, 48000, 42000, 52000, 55000, 53000, 58000, 62000, 66000, 70000],
  investing: [-12000,-10000,-15000,-8000,-10000,-12000,-8000,-10000,-12000,-10000,-8000,-15000],
  financing: [-8000, -8000,-10000,-10000,-8000,-12000,-10000,-8000,-10000,-12000,-10000,-8000],
};

// Forecasting — simple linear extrapolation for next 6 months
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

// ===== HR Analytics Data =====

const HR_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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
const HR_TURNOVER_RATE = HR_MONTHS.map((_, i) => {
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

// Hiring forecast — uses linear regression on monthly hires
const HR_FORECAST_MONTHS = ['Jan 26','Feb 26','Mar 26','Apr 26','May 26','Jun 26'];

function generateHRHiringForecast() {
  return generateForecast(HR_RECRUITMENT.hired, 6);
}

function generateHRHeadcountForecast() {
  const totalByMonth = HR_MONTHS.map((_, i) => getTotalHeadcount(i));
  return generateForecast(totalByMonth, 6);
}
