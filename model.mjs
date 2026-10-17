export const sensors = [
 {key:'lie',label:'LIE',unit:'%',max:100,step:1,initial:0},
 {key:'co',label:'CO',unit:'ppm',max:1000,step:1,initial:0},
 {key:'h2s',label:'H₂S',unit:'ppm',max:100,step:1,initial:0},
 {key:'o2',label:'O₂',unit:'%',max:25,step:0.1,initial:20.9}
];
export const initialValues=()=>Object.fromEntries(sensors.map(s=>[s.key,s.initial]));
export const alarmLevel=v=>v.lie>=20?2:v.lie>=10?1:0;
export const validValues=v=>v&&sensors.every(s=>typeof v[s.key]==='number'&&Number.isFinite(v[s.key])&&v[s.key]>=0&&v[s.key]<=s.max);
