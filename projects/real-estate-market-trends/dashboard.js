// ===== Real Estate Market Trends Dashboard — Main JS =====

// Utility: generate forecast using linear regression
function generateForecast(data, periods=6) {
  const n = data.length;
  let sumX=0,sumY=0,sumXY=0,sumX2=0;
  for(let i=0;i<n;i++){sumX+=i;sumY+=data[i];sumXY+=i*data[i];sumX2+=i*i;}
  const slope=(n*sumXY-sumX*sumY)/(n*sumX2-sumX*sumX);
  const intercept=(sumY-slope*sumX)/n;
  const forecast=[];
  for(let i=0;i<periods;i++){forecast.push(Math.round((slope*(n+i)+intercept)*10)/10);}
  return forecast;
}

// Chart.js defaults
Chart.defaults.color='#9aa0b0';
Chart.defaults.borderColor='#363d52';
Chart.defaults.font.family="'Inter','Segoe UI',system-ui,sans-serif";

// Color palette
const COLORS={
  blue:'#2d9cdb',
  green:'#27ae60',
  red:'#eb5757',
  purple:'#9b51e0',
  orange:'#f2994a',
  teal:'#6fcf97',
  gold:'#f2c94c',
  pink:'#e84393',
};
const REGION_COLORS={
  Downtown:COLORS.blue,
  Suburbs:COLORS.green,
  Midtown:COLORS.orange,
  Waterfront:COLORS.purple,
  Industrial:COLORS.teal,
};

// State
let charts={};
let currentPage='overview';
let filterRegion='all';
let filterDateStart=0;
let filterDateEnd=11;

// ===== NAVIGATION =====
document.querySelectorAll('.nav-item').forEach(item=>{
  item.addEventListener('click',e=>{
    e.preventDefault();
    const page=item.dataset.page;
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    item.classList.add('active');
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById('page-'+page).classList.add('active');
    currentPage=page;
    updatePageTitle(page);
  });
});

function updatePageTitle(page){
  const titles={
    overview:'Real Estate Market Overview',
    pricing:'Property Pricing Analysis',
    demand:'Market Demand & Supply',
    hotspots:'Market Hotspots & Geography',
  };
  document.getElementById('page-title').textContent=titles[page]||'Real Estate Dashboard';
}

// ===== FILTERS =====
document.getElementById('btn-apply').addEventListener('click',()=>{
  filterRegion=document.getElementById('region-filter').value;
  const startVal=document.getElementById('date-start').value;
  const endVal=document.getElementById('date-end').value;
  if(startVal){filterDateStart=parseInt(startVal.split('-')[1])-1;}
  if(endVal){filterDateEnd=parseInt(endVal.split('-')[1])-1;}
  updateAllCharts();
});

// ===== HELPER: filter data by date range =====
function filterByDate(arr){return arr.slice(filterDateStart,filterDateEnd+1);}
function getFilteredMonths(){return MONTHS.slice(filterDateStart,filterDateEnd+1);}
function getRegions(){
  if(filterRegion==='all') return REGIONS;
  return [filterRegion];
}

// ===== KPI UPDATE =====
function updateKPIs(){
  const regions=getRegions();
  // Average property price
  let totalPrice=0,count=0;
  regions.forEach(r=>{
    const filtered=filterByDate(propertyPrices[r]);
    filtered.forEach(v=>{totalPrice+=v;count++;});
  });
  const avgPrice=Math.round(totalPrice/count);
  document.getElementById('kpi-avg-price').textContent='$'+avgPrice.toLocaleString()+'K';
  const allPrices=regions.map(r=>propertyPrices[r]);
  const lastMonthAvg=regions.reduce((s,r)=>s+propertyPrices[r][filterDateEnd],0)/regions.length;
  const firstMonthAvg=regions.reduce((s,r)=>s+propertyPrices[r][filterDateStart],0)/regions.length;
  const priceChange=((lastMonthAvg-firstMonthAvg)/firstMonthAvg*100).toFixed(1);
  const priceEl=document.getElementById('kpi-price-change');
  priceEl.textContent=(priceChange>=0?'▲':'▼')+' '+Math.abs(priceChange)+'% period';
  priceEl.className='kpi-change '+(priceChange>=0?'positive':'negative');

  // Average rental yield
  let totalYield=0,yCount=0;
  regions.forEach(r=>{
    filterByDate(rentalYields[r]).forEach(v=>{totalYield+=v;yCount++;});
  });
  const avgYield=(totalYield/yCount).toFixed(1);
  document.getElementById('kpi-rental-yield').textContent=avgYield+'%';

  // Demand index (latest)
  const latestDemand=filterByDate(demandIndex).slice(-1)[0];
  document.getElementById('kpi-demand').textContent=latestDemand+'/100';
  const demandChange=latestDemand-filterByDate(demandIndex)[0];
  const demandEl=document.getElementById('kpi-demand-change');
  demandEl.textContent=(demandChange>=0?'▲':'▼')+' '+Math.abs(demandChange)+' pts';
  demandEl.className='kpi-change '+(demandChange>=0?'positive':'negative');

  // Total listings
  const totalListings=filterByDate(listingsVsSold.newListings).reduce((s,v)=>s+v,0);
  document.getElementById('kpi-listings').textContent=totalListings.toLocaleString();
}

// ===== CHART CREATION =====
function createOrUpdate(id,config){
  if(charts[id]){charts[id].destroy();}
  const ctx=document.getElementById(id);
  if(!ctx) return;
  charts[id]=new Chart(ctx.getContext('2d'),config);
}

// ===== OVERVIEW PAGE CHARTS =====
function renderOverviewCharts(){
  const months=getFilteredMonths();
  const regions=getRegions();

  // 1. Property Price Trends
  createOrUpdate('chart-price-trends',{
    type:'line',
    data:{
      labels:months,
      datasets:regions.map(r=>({
        label:r,
        data:filterByDate(propertyPrices[r]),
        borderColor:REGION_COLORS[r],
        backgroundColor:REGION_COLORS[r]+'20',
        tension:0.3,
        fill:false,
        pointRadius:3,
      }))
    },
    options:{
      responsive:true,
      plugins:{legend:{position:'top',labels:{boxWidth:12,padding:15}}},
      scales:{
        y:{title:{display:true,text:'Price ($K)'},grid:{color:'#363d5244'}},
        x:{grid:{display:false}}
      }
    }
  });

  // 2. Rental Yield Comparison
  const avgYields=regions.map(r=>{
    const vals=filterByDate(rentalYields[r]);
    return (vals.reduce((s,v)=>s+v,0)/vals.length).toFixed(2);
  });
  createOrUpdate('chart-rental-yield',{
    type:'bar',
    data:{
      labels:regions,
      datasets:[{
        label:'Avg Rental Yield (%)',
        data:avgYields,
        backgroundColor:regions.map(r=>REGION_COLORS[r]+'cc'),
        borderColor:regions.map(r=>REGION_COLORS[r]),
        borderWidth:1,
        borderRadius:6,
      }]
    },
    options:{
      responsive:true,
      plugins:{legend:{display:false}},
      scales:{
        y:{title:{display:true,text:'Yield (%)'},beginAtZero:true,grid:{color:'#363d5244'}},
        x:{grid:{display:false}}
      }
    }
  });

  // 3. Transaction Volume
  createOrUpdate('chart-transaction-volume',{
    type:'bar',
    data:{
      labels:months,
      datasets:[{
        label:'Transaction Volume ($M)',
        data:filterByDate(transactionVolume),
        backgroundColor:COLORS.blue+'88',
        borderColor:COLORS.blue,
        borderWidth:1,
        borderRadius:4,
      }]
    },
    options:{
      responsive:true,
      plugins:{legend:{display:false}},
      scales:{
        y:{title:{display:true,text:'Volume ($M)'},grid:{color:'#363d5244'}},
        x:{grid:{display:false}}
      }
    }
  });

  // 4. Property Type Distribution
  createOrUpdate('chart-property-types',{
    type:'doughnut',
    data:{
      labels:propertyTypes.labels,
      datasets:[{
        data:propertyTypes.values,
        backgroundColor:[COLORS.blue,COLORS.green,COLORS.orange,COLORS.purple,COLORS.gold],
        borderWidth:0,
      }]
    },
    options:{
      responsive:true,
      plugins:{legend:{position:'right',labels:{boxWidth:12,padding:10}}}
    }
  });
}

// ===== PRICING PAGE CHARTS =====
function renderPricingCharts(){
  const months=getFilteredMonths();
  const regions=getRegions();

  // Price per Sqft
  createOrUpdate('chart-price-sqft',{
    type:'line',
    data:{
      labels:months,
      datasets:regions.map(r=>({
        label:r,
        data:filterByDate(pricePerSqft[r]),
        borderColor:REGION_COLORS[r],
        tension:0.3,
        fill:false,
        pointRadius:2,
      }))
    },
    options:{
      responsive:true,
      plugins:{legend:{position:'top',labels:{boxWidth:12}}},
      scales:{
        y:{title:{display:true,text:'$/sq ft'},grid:{color:'#363d5244'}},
        x:{grid:{display:false}}
      }
    }
  });

  // Days on Market
  createOrUpdate('chart-days-market',{
    type:'bar',
    data:{
      labels:months,
      datasets:regions.map(r=>({
        label:r,
        data:filterByDate(daysOnMarket[r]),
        backgroundColor:REGION_COLORS[r]+'88',
        borderColor:REGION_COLORS[r],
        borderWidth:1,
        borderRadius:3,
      }))
    },
    options:{
      responsive:true,
      plugins:{legend:{position:'top',labels:{boxWidth:12}}},
      scales:{
        y:{title:{display:true,text:'Days'},grid:{color:'#363d5244'}},
        x:{grid:{display:false}}
      }
    }
  });

  // Price Forecast (using Downtown + Midtown average)
  const historicalPrices=filterByDate(propertyPrices.Downtown).map((v,i)=>
    Math.round((v+filterByDate(propertyPrices.Midtown)[i])/2)
  );
  const forecastData=generateForecast(historicalPrices,6);
  const forecastMonths=['Jan','Feb','Mar','Apr','May','Jun'].map(m=>m+" '26");
  createOrUpdate('chart-price-forecast',{
    type:'line',
    data:{
      labels:[...months,...forecastMonths],
      datasets:[
        {
          label:'Historical Avg Price ($K)',
          data:[...historicalPrices,...Array(6).fill(null)],
          borderColor:COLORS.blue,
          backgroundColor:COLORS.blue+'20',
          tension:0.3,
          fill:true,
          pointRadius:3,
        },
        {
          label:'Forecast',
          data:[...Array(months.length-1).fill(null),historicalPrices[historicalPrices.length-1],...forecastData],
          borderColor:COLORS.gold,
          borderDash:[6,4],
          tension:0.3,
          fill:false,
          pointRadius:3,
        }
      ]
    },
    options:{
      responsive:true,
      plugins:{legend:{position:'top',labels:{boxWidth:12}}},
      scales:{
        y:{title:{display:true,text:'Avg Price ($K)'},grid:{color:'#363d5244'}},
        x:{grid:{display:false}}
      }
    }
  });

  // Mortgage Rate Trend
  createOrUpdate('chart-mortgage-rate',{
    type:'line',
    data:{
      labels:months,
      datasets:[{
        label:'30-Year Fixed Rate (%)',
        data:filterByDate(mortgageRates),
        borderColor:COLORS.red,
        backgroundColor:COLORS.red+'15',
        tension:0.3,
        fill:true,
        pointRadius:3,
      }]
    },
    options:{
      responsive:true,
      plugins:{legend:{display:false}},
      scales:{
        y:{title:{display:true,text:'Rate (%)'},grid:{color:'#363d5244'}},
        x:{grid:{display:false}}
      }
    }
  });
}

// ===== DEMAND PAGE CHARTS =====
function renderDemandCharts(){
  const months=getFilteredMonths();

  // Demand vs Supply
  createOrUpdate('chart-demand-supply',{
    type:'line',
    data:{
      labels:months,
      datasets:[
        {
          label:'Demand Index',
          data:filterByDate(demandIndex),
          borderColor:COLORS.blue,
          backgroundColor:COLORS.blue+'20',
          tension:0.4,
          fill:true,
          pointRadius:3,
        },
        {
          label:'Supply Index',
          data:filterByDate(supplyIndex),
          borderColor:COLORS.orange,
          backgroundColor:COLORS.orange+'20',
          tension:0.4,
          fill:true,
          pointRadius:3,
        }
      ]
    },
    options:{
      responsive:true,
      plugins:{legend:{position:'top',labels:{boxWidth:12}}},
      scales:{
        y:{title:{display:true,text:'Index (0-100)'},min:0,max:100,grid:{color:'#363d5244'}},
        x:{grid:{display:false}}
      }
    }
  });

  // Economic Indicators
  createOrUpdate('chart-economic',{
    type:'line',
    data:{
      labels:months,
      datasets:[
        {label:'GDP Growth (%)',data:filterByDate(economicIndicators.gdpGrowth),borderColor:COLORS.green,tension:0.3,pointRadius:2},
        {label:'Interest Rate (%)',data:filterByDate(economicIndicators.interestRate),borderColor:COLORS.red,tension:0.3,pointRadius:2},
        {label:'Inflation (%)',data:filterByDate(economicIndicators.inflation),borderColor:COLORS.orange,tension:0.3,pointRadius:2},
        {label:'Unemployment (%)',data:filterByDate(economicIndicators.unemployment),borderColor:COLORS.purple,tension:0.3,pointRadius:2},
      ]
    },
    options:{
      responsive:true,
      plugins:{legend:{position:'top',labels:{boxWidth:12,padding:10}}},
      scales:{
        y:{title:{display:true,text:'Percentage (%)'},grid:{color:'#363d5244'}},
        x:{grid:{display:false}}
      }
    }
  });

  // Listings vs Sold
  createOrUpdate('chart-listings-sold',{
    type:'bar',
    data:{
      labels:months,
      datasets:[
        {
          label:'New Listings',
          data:filterByDate(listingsVsSold.newListings),
          backgroundColor:COLORS.blue+'88',
          borderColor:COLORS.blue,
          borderWidth:1,
          borderRadius:3,
        },
        {
          label:'Properties Sold',
          data:filterByDate(listingsVsSold.sold),
          backgroundColor:COLORS.green+'88',
          borderColor:COLORS.green,
          borderWidth:1,
          borderRadius:3,
        }
      ]
    },
    options:{
      responsive:true,
      plugins:{legend:{position:'top',labels:{boxWidth:12}}},
      scales:{
        y:{title:{display:true,text:'Units'},grid:{color:'#363d5244'}},
        x:{grid:{display:false}}
      }
    }
  });

  // Absorption Rate (Sold/Listings * 100)
  const absorptionRate=filterByDate(listingsVsSold.sold).map((sold,i)=>
    Math.round(sold/filterByDate(listingsVsSold.newListings)[i]*100)
  );
  createOrUpdate('chart-absorption',{
    type:'line',
    data:{
      labels:months,
      datasets:[{
        label:'Absorption Rate (%)',
        data:absorptionRate,
        borderColor:COLORS.teal,
        backgroundColor:COLORS.teal+'20',
        tension:0.4,
        fill:true,
        pointRadius:4,
      }]
    },
    options:{
      responsive:true,
      plugins:{legend:{display:false}},
      scales:{
        y:{title:{display:true,text:'Rate (%)'},min:80,max:100,grid:{color:'#363d5244'}},
        x:{grid:{display:false}}
      }
    }
  });
}

// ===== HOTSPOTS PAGE =====
function renderHotspotsCharts(){
  // Market Hotspots — horizontal bar
  createOrUpdate('chart-hotspots',{
    type:'bar',
    data:{
      labels:marketHotspots.map(h=>h.area),
      datasets:[{
        label:'YoY Price Growth (%)',
        data:marketHotspots.map(h=>h.growth),
        backgroundColor:marketHotspots.map(h=>{
          if(h.growth>15) return COLORS.red+'cc';
          if(h.growth>10) return COLORS.orange+'cc';
          return COLORS.green+'cc';
        }),
        borderRadius:4,
      }]
    },
    options:{
      indexAxis:'y',
      responsive:true,
      plugins:{legend:{display:false}},
      scales:{
        x:{title:{display:true,text:'Growth (%)'},grid:{color:'#363d5244'}},
        y:{grid:{display:false}}
      }
    }
  });

  // Render Heatmap
  renderHeatmap();

  // Rental Yield by Region — radar
  const regions=getRegions().length>1?REGIONS:getRegions();
  const latestYields=regions.map(r=>rentalYields[r][filterDateEnd]);
  createOrUpdate('chart-yield-radar',{
    type:'radar',
    data:{
      labels:regions,
      datasets:[{
        label:'Rental Yield (%)',
        data:latestYields,
        borderColor:COLORS.blue,
        backgroundColor:COLORS.blue+'30',
        pointBackgroundColor:COLORS.blue,
      }]
    },
    options:{
      responsive:true,
      plugins:{legend:{display:false}},
      scales:{
        r:{
          beginAtZero:true,
          grid:{color:'#363d5244'},
          pointLabels:{color:'#9aa0b0'},
          ticks:{color:'#9aa0b0',backdropColor:'transparent'}
        }
      }
    }
  });
}

function renderHeatmap(){
  const container=document.getElementById('heatmap-container');
  if(!container) return;
  container.innerHTML='';
  heatmapData.forEach(cell=>{
    const div=document.createElement('div');
    div.className='heatmap-cell';
    const r=Math.round(235*cell.intensity);
    const g=Math.round(87*(1-cell.intensity)+174*cell.intensity*0.3);
    const b=Math.round(87*(1-cell.intensity));
    div.style.background=`rgba(${r},${g},${b},0.8)`;
    div.innerHTML=`<span class="area-name">${cell.name}</span><span class="area-price">$${cell.price}K</span>`;
    container.appendChild(div);
  });
}

// ===== RENDER TABLE =====
function renderTable(){
  const tbody=document.getElementById('market-table-body');
  if(!tbody) return;
  const regions=getRegions();
  const months=getFilteredMonths();
  let html='';
  regions.forEach(region=>{
    const prices=filterByDate(propertyPrices[region]);
    const yields=filterByDate(rentalYields[region]);
    const days=filterByDate(daysOnMarket[region]);
    const sqft=filterByDate(pricePerSqft[region]);
    const avgPrice=Math.round(prices.reduce((s,v)=>s+v,0)/prices.length);
    const avgYield=(yields.reduce((s,v)=>s+v,0)/yields.length).toFixed(1);
    const avgDays=Math.round(days.reduce((s,v)=>s+v,0)/days.length);
    const avgSqft=Math.round(sqft.reduce((s,v)=>s+v,0)/sqft.length);
    const priceGrowth=((prices[prices.length-1]-prices[0])/prices[0]*100).toFixed(1);
    html+=`<tr>
      <td><strong>${region}</strong></td>
      <td>$${avgPrice}K</td>
      <td>${avgYield}%</td>
      <td>$${avgSqft}/sqft</td>
      <td>${avgDays} days</td>
      <td class="${priceGrowth>=0?'positive':'negative'}">${priceGrowth>=0?'+':''}${priceGrowth}%</td>
    </tr>`;
  });
  tbody.innerHTML=html;
}

// ===== UPDATE ALL =====
function updateAllCharts(){
  updateKPIs();
  renderOverviewCharts();
  renderPricingCharts();
  renderDemandCharts();
  renderHotspotsCharts();
  renderTable();
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded',()=>{
  updateAllCharts();
});
