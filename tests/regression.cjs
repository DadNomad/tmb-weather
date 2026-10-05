const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/initializeApp\(\);\s*$/, '');
const elements = new Map();
const storage = new Map();
const element = () => ({value:'2026-10-07',textContent:'',style:{},addEventListener(){},setAttribute(){},classList:{add(){},remove(){},toggle(){}},querySelector(){return null;}});
const context = vm.createContext({
  console, Intl, Date, Number, JSON, Math, String, Array, RegExp, Promise,
  navigator:{}, window:{isSecureContext:true,addEventListener(){}},
  document:{getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);},querySelectorAll(){return [];},addEventListener(){}},
  localStorage:{getItem(k){return storage.get(k)||null;},setItem(k,v){storage.set(k,v);}},
  setInterval(){},setTimeout(){},
});
vm.runInContext(script, context);
const run = code => vm.runInContext(code, context);

async function main(){
  assert.equal(run("units='metric';temperatureText(32)"),'0°C');
  assert.equal(run('temperatureText(68)'),'20°C');
  assert.equal(run('temperatureRange(32,50)'),'0–10°C');
  assert.equal(run('speedText(10)'),'16 km/h');
  assert.equal(run('precipitationText(1)'),'25.4 mm');
  assert.equal(run('elevationText(1000)'),'305 m');
  assert.equal(run("locationText('Pass · ~3,000–6,000 ft')"),'Pass · ~914–1,829 m');
  const hazard="deriveHazard({location:'Col test',date:'2026-10-07'},{gust:40,wind:20,amt:0.2,prob:80,maxT:90,minT:30,code:0,visibility:9999,cape:0})";
  const metricHazard=run(hazard);
  run("units='imperial'");
  const imperialHazard=run(hazard);
  assert.equal(metricHazard.level,imperialHazard.level);
  assert(metricHazard.text.includes('64 km/h'));
  assert(metricHazard.text.includes('5.1 mm'));
  assert(metricHazard.text.includes('32°C'));
  assert(imperialHazard.text.includes('40 mph'));
  assert.equal(run('temperatureText(68)'),'68°F');
  assert.equal(run('precipitationText(1)'),'1.00″');
  assert.equal(run("locationText('Pass · ~3,000–6,000 ft')"),'Pass · ~3,000–6,000 ft');
  assert.equal(run("aggregateCurrentForecast({hourly:{time:['2026-10-07T09:00'],temperature_2m:[60],wind_speed_10m:[5],wind_gusts_10m:[10],precipitation_probability:[20],precipitation:[0],weather_code:[95]}}).code"),95);
  run("setTripDates('2028-02-27')");
  assert.equal(run("ROUTES.find(r=>r.day.startsWith('D3 ')).date"),'2028-02-29');
  run("setTripDates('2026-12-27')");
  assert.equal(run('ROUTES.at(-1).date'),'2027-01-05');
  assert.equal(run("validDate('2026-02-30')"),false);
  run("localStorage.setItem(CACHE_KEY,JSON.stringify({startDate:'2020-01-01',rows:[{}]}))");
  assert.equal(run('applyCached()'),false);

  let options=[];
  context.navigator.geolocation={getCurrentPosition(success,error,opts){options.push(opts);success({coords:{latitude:1,longitude:2,accuracy:200},timestamp:Date.now()});}};
  await run('getGeoPosition()');
  assert.equal(options[0].enableHighAccuracy,false);
  assert.equal(options[0].maximumAge,120000);

  // A timeout retries a recent browser position without requiring GPS.
  options=[];
  context.navigator.geolocation.getCurrentPosition=(success,error,opts)=>{options.push(opts);error({code:3});};
  assert.equal(await run('refreshCurrentLocation(true)'),false);
  assert.equal(options.length,2);
  assert(options.every(o=>o.enableHighAccuracy===false));
  assert.equal(options[1].maximumAge,600000);
  assert(elements.get('currentHazard').textContent.includes('did not return a location'));
  assert.equal(elements.get('enableLocationBtn').disabled,false);

  // Permission denial is not retried, and no alert is needed (none is stubbed).
  options=[];
  context.navigator.geolocation.getCurrentPosition=(success,error,opts)=>{options.push(opts);error({code:1});};
  await run('refreshCurrentLocation(true)');
  assert.equal(options.length,1);
  assert(elements.get('currentHazard').textContent.includes('blocked'));

  // Automatic refresh cannot prompt for permission, even without Permissions API.
  options=[];
  assert.equal(await run('refreshCurrentLocation(false)'),false);
  assert.equal(options.length,0);
  context.navigator.permissions={query:async()=>({state:'prompt'})};
  await run('refreshCurrentLocation(false)');
  assert.equal(options.length,0);

  // Concurrent callers share the same location request.
  let fail;
  context.navigator.geolocation.getCurrentPosition=(success,error)=>{fail=error;};
  const first=run('refreshCurrentLocation(true)');
  const second=run('refreshCurrentLocation(true)');
  assert.equal(first,second);
  fail({code:1});
  await first;
  console.log('PASS: unit conversions, hazard consistency, dates, cache isolation, weather codes, browser-location options, fallback, denial, permission prompts and request deduplication.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
