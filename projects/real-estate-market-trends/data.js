// ===== Real Estate Market Trends — Sample Data =====

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const YEAR = 2025;

// Regions
const REGIONS = ['Downtown','Suburbs','Midtown','Waterfront','Industrial'];

// Monthly median property prices ($K) by region
const propertyPrices = {
  Downtown:   [520,528,535,542,550,558,565,572,580,588,595,605],
  Suburbs:    [320,322,325,330,335,338,342,348,352,358,362,368],
  Midtown:    [410,415,420,428,435,440,445,452,458,465,472,480],
  Waterfront: [680,690,700,712,720,735,745,758,770,785,798,815],
  Industrial: [180,182,185,188,190,193,196,200,203,207,210,215],
};

// Rental yield (%) by region per month
const rentalYields = {
  Downtown:   [4.2,4.1,4.2,4.3,4.2,4.1,4.0,4.1,4.2,4.3,4.2,4.1],
  Suburbs:    [5.8,5.7,5.6,5.7,5.8,5.9,5.8,5.7,5.6,5.7,5.8,5.9],
  Midtown:    [4.8,4.7,4.8,4.9,4.8,4.7,4.6,4.7,4.8,4.9,4.8,4.7],
  Waterfront: [3.5,3.4,3.5,3.6,3.5,3.4,3.3,3.4,3.5,3.6,3.5,3.4],
  Industrial: [7.2,7.3,7.1,7.0,7.2,7.3,7.4,7.2,7.1,7.0,7.2,7.3],
};

// Market demand index (0-100)
const demandIndex = [62,65,68,72,75,78,80,82,79,76,73,70];

// Market supply index (0-100)
const supplyIndex = [55,54,53,52,51,50,49,48,49,50,51,52];

// Economic indicators
const economicIndicators = {
  gdpGrowth:    [2.1,2.2,2.3,2.4,2.5,2.6,2.5,2.4,2.3,2.4,2.5,2.6],
  interestRate: [5.25,5.25,5.00,5.00,4.75,4.75,4.50,4.50,4.50,4.25,4.25,4.00],
  inflation:    [3.2,3.1,3.0,2.9,2.8,2.7,2.7,2.6,2.5,2.5,2.4,2.3],
  unemployment: [3.8,3.7,3.7,3.6,3.5,3.5,3.4,3.4,3.3,3.3,3.2,3.2],
};

// Average days on market by region
const daysOnMarket = {
  Downtown:   [28,26,24,22,20,19,18,19,21,23,25,27],
  Suburbs:    [35,33,31,29,27,25,24,25,27,29,31,33],
  Midtown:    [32,30,28,26,24,22,21,22,24,26,28,30],
  Waterfront: [22,20,18,16,15,14,13,14,16,18,20,22],
  Industrial: [45,43,42,40,38,37,36,37,39,41,43,45],
};

// Property type distribution (units sold)
const propertyTypes = {
  labels: ['Single Family','Condo/Apartment','Townhouse','Commercial','Land'],
  values: [3200,2800,1500,900,600],
};

// Transaction volume by month ($M)
const transactionVolume = [185,192,210,225,240,255,262,258,245,235,220,205];

// Price per square foot by region ($)
const pricePerSqft = {
  Downtown:   [385,390,395,400,405,410,415,420,425,430,435,440],
  Suburbs:    [195,197,200,202,205,208,210,213,216,218,221,224],
  Midtown:    [310,313,316,320,323,327,330,334,337,341,345,348],
  Waterfront: [520,528,535,542,550,558,565,572,580,588,595,605],
  Industrial: [125,127,128,130,132,134,135,137,139,141,143,145],
};

// Market hotspots — areas with highest YoY price growth
const marketHotspots = [
  {area:'Waterfront East', growth:18.5, avgPrice:825},
  {area:'Downtown Core', growth:15.2, avgPrice:610},
  {area:'Midtown Plaza', growth:12.8, avgPrice:485},
  {area:'Suburban Heights', growth:11.4, avgPrice:375},
  {area:'Tech District', growth:10.9, avgPrice:520},
  {area:'University Area', growth:9.7, avgPrice:340},
  {area:'Harbor View', growth:8.5, avgPrice:690},
  {area:'Green Valley', growth:7.8, avgPrice:295},
];

// Heatmap data — areas with price intensity
const heatmapData = [
  {name:'Downtown Core', price:610, intensity:0.85},
  {name:'Waterfront E', price:825, intensity:1.0},
  {name:'Midtown Plaza', price:485, intensity:0.65},
  {name:'Tech District', price:520, intensity:0.72},
  {name:'University', price:340, intensity:0.45},
  {name:'Suburban Hts', price:375, intensity:0.50},
  {name:'Harbor View', price:690, intensity:0.90},
  {name:'Green Valley', price:295, intensity:0.38},
  {name:'Industrial N', price:215, intensity:0.25},
  {name:'Lakeshore', price:580, intensity:0.78},
  {name:'Uptown', price:450, intensity:0.60},
  {name:'Eastside', price:310, intensity:0.42},
  {name:'Westend', price:420, intensity:0.55},
  {name:'South Bay', price:550, intensity:0.75},
  {name:'Northgate', price:265, intensity:0.32},
];

// Monthly new listings vs sold
const listingsVsSold = {
  newListings: [420,445,480,520,560,580,575,560,530,500,470,440],
  sold:        [380,400,435,470,510,540,550,535,500,470,440,410],
};

// Mortgage rate trend (monthly average %)
const mortgageRates = [6.8,6.7,6.5,6.4,6.2,6.0,5.9,5.8,5.7,5.6,5.5,5.4];
