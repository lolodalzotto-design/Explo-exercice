import {firebaseConfig} from './firebase-config.js';
import {sensors,initialValues,alarmLevel,validValues} from './model.mjs';
const $=id=>document.getElementById(id);
let values=initialValues(),trainer=false,local=false,active=false,connected=false,lastSeen=0,offset=0,sessionRef,api,uid,heartbeat,timer;
let audio,soundEnabled=false,level=0,ended=false;
const params=new URLSearchParams(location.hash.slice(1));
const session=params.get('session');
if(session)document.body.dataset.mode='student';
function status(t){$('status').textContent=t;document.body.dataset.receiving=t==='Réception active · simulation'?'true':'false';}
function fail(e){$('error').hidden=false;$('error').textContent='Action impossible : '+(e.message||String(e));}
function render(){
 level=alarmLevel(values);document.body.dataset.level=String(level);
 $('alarm').textContent=level===2?'ALARME LIE · NIVEAU 2 — dès 20 %':level===1?'ALARME LIE · NIVEAU 1 — dès 10 %':'Aucune alarme LIE';
 for(const s of sensors){$('value-'+s.key).textContent=values[s.key].toLocaleString('fr-FR',{maximumFractionDigits:s.step<1?1:0});const input=$('input-'+s.key);if(input)input.value=values[s.key];}
}
function show(){
 document.body.dataset.mode=trainer?'trainer':'student';
 if(!trainer)enableStudentAudio();
 $('sound').title='Activer ou couper le son';
 $('home').hidden=true;$('exercise').hidden=false;$('controls').hidden=!trainer;$('pairing').hidden=!trainer;
 $('role').textContent=local?'Démonstration locale':trainer?'Télécommande formateur':'Détecteur stagiaire';
 for(const s of sensors){const card=document.createElement('div');card.className='meter';card.dataset.sensor=s.key;
 const label=document.createElement('label');label.textContent=s.label;label.htmlFor='input-'+s.key;
 const output=document.createElement('output');output.id='value-'+s.key;output.className='value';output.setAttribute('aria-label',s.label);
 const unit=document.createElement('span');unit.className='unit';unit.textContent=s.unit;card.append(label,output,unit);
 if(trainer){const input=document.createElement('input');Object.assign(input,{type:'range',id:'input-'+s.key,min:'0',max:String(s.max),step:String(s.step),value:String(values[s.key])});input.setAttribute('aria-label',s.label+' en '+s.unit);input.oninput=()=>{values[s.key]=Number(input.value);render();schedule();};card.append(input);} $('meters').append(card);}
 $('stop').hidden=local;render();
}
function usable(){return active&&!ended&&(local||(connected&&(trainer||Date.now()+offset-lastSeen<15000)));}
function enableStudentAudio(){
 if(document.body.dataset.mode!=='student')return;
 try{
 audio??=new (window.AudioContext||window.webkitAudioContext)();soundEnabled=true;
 const sync=()=>{document.body.dataset.audio=audio.state==='running'?'ready':'pending';};
 audio.onstatechange=sync;sync();
 audio.resume().then(sync).catch(sync);
 }catch{document.body.dataset.audio='unavailable';}
}
for(const event of ['pointerdown','keydown'])document.addEventListener(event,()=>{if(document.body.dataset.mode==='student')enableStudentAudio();},{capture:true});
function beep(){if(!soundEnabled||!audio||!level||!usable())return;const osc=audio.createOscillator(),gain=audio.createGain();osc.frequency.value=level===2?1100:800;gain.gain.setValueAtTime(.12,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.16);osc.connect(gain).connect(audio.destination);osc.start();osc.stop(audio.currentTime+.17);}
setInterval(beep,450);
$('sound').onclick=async()=>{if(document.body.dataset.mode==='student'){enableStudentAudio();return;}try{audio??=new (window.AudioContext||window.webkitAudioContext)();await audio.resume();soundEnabled=!soundEnabled;$('sound').textContent=soundEnabled?'Couper le son':'Activer le son';$('sound').setAttribute('aria-label',$('sound').textContent);$('sound').setAttribute('aria-pressed',String(soundEnabled));}catch(e){fail(e);}};
async function publish(){if(!trainer||local||!active||ended||!connected)return;try{await api.update(sessionRef,{values,updatedAt:api.serverTimestamp(),active:true});}catch(e){fail(e);}}
function schedule(){clearTimeout(timer);timer=setTimeout(publish,100);}
$('reset').onclick=()=>{values=initialValues();render();schedule();};
$('stop').onclick=async()=>{try{clearTimeout(timer);await api.update(sessionRef,{active:false,updatedAt:api.serverTimestamp()});ended=true;active=false;clearInterval(heartbeat);status('Session terminée. Recharge la page pour en créer une autre.');document.querySelectorAll('input, #reset, #stop').forEach(el=>el.disabled=true);}catch(e){fail(e);}};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('join').href);$('copyStatus').textContent='Lien copié.';}catch{$('copyStatus').textContent='Copie manuellement l’adresse du lien stagiaire.';}};
async function initialize(){
 if(!firebaseConfig){$('create').disabled=true;status('Connexion indisponible');fail(new Error('La liaison distante n’est pas configurée.'));return;}
 const base='https://www.gstatic.com/firebasejs/13.0.0/';
 const [appMod,authMod,dbMod]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-database.js')]);
 api=dbMod;const app=appMod.initializeApp(firebaseConfig);const auth=authMod.getAuth(app);await authMod.signInAnonymously(auth);uid=auth.currentUser.uid;const db=api.getDatabase(app);
 api.onValue(api.ref(db,'.info/serverTimeOffset'),snap=>{offset=snap.val()||0;});
 api.onValue(api.ref(db,'.info/connected'),snap=>{connected=snap.val()===true;if(!local)status(connected?'Connexion Firebase établie':'Connexion interrompue — valeurs non actualisées');},fail);
 if(session){if(!/^[a-f0-9]{32}$/.test(session))throw Error('Lien de session invalide.');sessionRef=api.ref(db,'sessions/'+session);trainer=false;show();
 api.onValue(sessionRef,snap=>{const data=snap.val();if(!data){active=false;status('Session introuvable ou supprimée');return;}if(!validValues(data.values)){active=false;fail(new Error('Valeurs de session invalides.'));return;}values=data.values;active=data.active===true;ended=!active;lastSeen=data.updatedAt||0;render();},fail);
 setInterval(()=>{if(local)return;status(!active?'Session inactive ou terminée':!connected?'Connexion interrompue — valeurs figées':Date.now()+offset-lastSeen>=15000?'Signal formateur perdu — valeurs figées':'Réception active · simulation');},1000);
 }else{status('Prêt à démarrer');$('create').disabled=false;}
 $('create').onclick=async()=>{if(local)return;try{$('create').disabled=true;const bytes=crypto.getRandomValues(new Uint8Array(16));const id=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');sessionRef=api.ref(db,'sessions/'+id);await api.set(sessionRef,{owner:uid,active:true,values,updatedAt:api.serverTimestamp()});trainer=active=true;show();const url=new URL(location.href);url.search='?v=3';url.hash=new URLSearchParams({session:id}).toString();$('join').href=url.href;
 if(window.QRCode)new window.QRCode($('qr'),{text:url.href,width:200,height:200});else $('copyStatus').textContent='QR code indisponible : utilise le lien.';
 heartbeat=setInterval(publish,5000);status('Exercice en cours');
 }catch(e){$('create').disabled=false;fail(e);}};
}
$('create').disabled=true;initialize().catch(e=>{status('Connexion indisponible. Réessaie en rechargeant la page.');fail(e);});
