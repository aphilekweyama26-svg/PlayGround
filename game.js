(()=>{
const c=document.querySelector('#game'),x=c.getContext('2d'),W=1280,H=720,F=610;
const kit=[['PLANK','wood',138,24,5,'#c98249',2],['STONE','stone',72,52,4,'#858da3',4],['GLASS','glass',98,16,3,'#82d8e6',1],['SHORT','wood',72,22,4,'#d59658',2]];
let mode='intro',pick=-1,ghost=null,blocks=[],birds=[],bits=[],score=0,shots=4,clock=0,quiet=0,best=0,notice='',noteTime=0,buttons=[];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rand=(a,b)=>a+Math.random()*(b-a);
function label(s,a,b,size=14,color='#fff',align='left',weight=700){x.font=`${weight} ${size}px system-ui`;x.textAlign=align;x.textBaseline='middle';x.fillStyle=color;x.fillText(s,a,b)}
function box(a,b,w,h,r,fill,stroke='rgba(255,255,255,.2)',lw=1){x.beginPath();x.roundRect(a,b,w,h,r);x.fillStyle=fill;x.fill();if(stroke){x.strokeStyle=stroke;x.lineWidth=lw;x.stroke()}}
function btn(s,a,b,w,h,color,fn,sub=''){box(a,b+4,w,h,13,'rgba(0,0,0,.2)',null);box(a,b,w,h,13,color);label(s,a+w/2,b+h/2-(sub?6:0),15,'white','center',900);if(sub)label(sub,a+w/2,b+h/2+12,9,'#ddd','center');buttons.push({a,b,w,h,fn})}
function start(){kit.forEach((p,i)=>p[4]=[5,4,3,4][i]);blocks=[];birds=[];bits=[];score=0;shots=4;pick=-1;ghost=null;mode='build';notice='Pick a block, then place it around the pig!';noteTime=3}
function background(){let g=x.createLinearGradient(0,0,0,720);g.addColorStop(0,'#78c9e8');g.addColorStop(.64,'#c7e9e9');g.addColorStop(1,'#e5ddb0');x.fillStyle=g;x.fillRect(0,0,W,H);x.fillStyle='rgba(255,244,179,.75)';x.beginPath();x.arc(1070,140,53,0,7);x.fill();for(const [a,b,s] of [[210,145,1],[560,105,.72],[890,230,.65]]){x.fillStyle='rgba(255,255,255,.52)';x.beginPath();x.ellipse(a,b,45*s,16*s,0,0,7);x.ellipse(a+25*s,b-9*s,28*s,19*s,0,0,7);x.ellipse(a-22*s,b-6*s,24*s,15*s,0,0,7);x.fill()}x.fillStyle='#9bceaa';x.beginPath();x.moveTo(0,434);x.quadraticCurveTo(226,320,465,430);x.quadraticCurveTo(730,540,1000,398);x.quadraticCurveTo(1160,337,1280,405);x.lineTo(1280,640);x.lineTo(0,640);x.fill();x.fillStyle='#75b88b';x.beginPath();x.moveTo(0,508);x.quadraticCurveTo(250,418,494,505);x.quadraticCurveTo(829,596,1050,470);x.quadraticCurveTo(1170,421,1280,480);x.lineTo(1280,640);x.lineTo(0,640);x.fill();for(let i=0;i<17;i++){let a=35+i*79,b=520+Math.sin(a*.03)*28;x.fillStyle='#4d9877';x.fillRect(a,b,7,45);x.beginPath();x.arc(a+4,b,18,0,7);x.fill()}x.fillStyle='#e8c879';x.fillRect(0,F,W,H-F);x.fillStyle='#fff0b0';x.fillRect(0,F,W,8);box(671,F-12,367,20,8,'#b57c53','#f4d293',2)}
function bird(a,b,r=19){x.fillStyle='#ed5547';x.beginPath();x.arc(a,b,r,0,7);x.fill();x.fillStyle='#fff4dc';x.beginPath();x.ellipse(a+6,b+5,9,7,-.3,0,7);x.fill();x.fillStyle='white';x.beginPath();x.arc(a+6,b-5,6,0,7);x.arc(a+14,b-4,5,0,7);x.fill();x.fillStyle='#263448';x.beginPath();x.arc(a+8,b-5,2,0,7);x.arc(a+15,b-4,2,0,7);x.fill();x.fillStyle='#f6b83f';x.beginPath();x.moveTo(a+10,b+1);x.lineTo(a+26,b+5);x.lineTo(a+10,b+9);x.fill()}
function pig(a,b){x.fillStyle='#84c958';x.beginPath();x.ellipse(a,b,22,19,0,0,7);x.fill();x.fillStyle='#a7df75';x.beginPath();x.ellipse(a-10,b-16,7,10,-.5,0,7);x.ellipse(a+10,b-16,7,10,.5,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(a-7,b-3,5,0,7);x.arc(a+7,b-3,5,0,7);x.fill();x.fillStyle='#263448';x.beginPath();x.arc(a-6,b-2,2,0,7);x.arc(a+8,b-2,2,0,7);x.fill();x.fillStyle='#64a743';x.beginPath();x.ellipse(a,b+6,8,5,0,0,7);x.fill()}
function drawBlock(b){x.save();x.translate(b.x,b.y);x.rotate(b.angle||0);let fill=b.kind==='glass'?'rgba(112,224,237,.72)':b.kind==='stone'?'#858da3':b.color,stroke=b.kind==='glass'?'#e7ffff':b.kind==='stone'?'#b9c1d0':'#f0bd7d';box(-b.w/2,-b.h/2,b.w,b.h,Math.min(7,b.h/4),fill,stroke,3);if(b.kind==='wood'){x.strokeStyle='rgba(97,48,26,.36)';x.beginPath();x.moveTo(-b.w*.35,0);x.lineTo(b.w*.35,0);x.stroke()}if(b.kind==='glass'){x.fillStyle='rgba(255,255,255,.7)';x.fillRect(-b.w*.35,-b.h*.25,b.w*.22,3)}if(b.hp<b.max){x.strokeStyle='#403833';x.beginPath();x.moveTo(-b.w*.13,-b.h*.4);x.lineTo(-b.w*.02,0);x.lineTo(-b.w*.2,b.h*.35);x.stroke()}x.restore()}
function slingDraw(){x.lineCap='round';x.lineWidth=17;x.strokeStyle='#77452f';x.beginPath();x.moveTo(300,F-4);x.lineTo(302,523);x.lineTo(282,478);x.moveTo(302,523);x.lineTo(326,479);x.stroke();x.lineWidth=7;x.strokeStyle='#a86b40';x.beginPath();x.moveTo(300,F-4);x.lineTo(302,523);x.stroke();if(mode==='aim'&&ghost){x.lineWidth=4;x.strokeStyle='#704334';x.beginPath();x.moveTo(282,478);x.lineTo(ghost.x,ghost.y);x.lineTo(326,479);x.stroke();x.setLineDash([6,7]);x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=2;x.beginPath();let vx=(300-ghost.x)*.14,vy=(536-ghost.y)*.14;for(let i=0;i<24;i++){let t=i*.13,a=300+vx*t,b=536+vy*t+210*t*t;if(i)x.lineTo(a,b);else x.moveTo(a,b)}x.stroke();x.setLineDash([])}bird(mode==='aim'&&ghost?ghost.x:300,mode==='aim'&&ghost?ghost.y:536,20)}
function hud(){box(24,22,380,70,19,'rgba(16,30,50,.84)');label('BIRDS',45,47,19,'#ffcb62');label('& BRICKS',111,47,19);label('BUILD. BRACE. BONK.',46,72,11,'#bad0d4');box(1015,24,240,64,17,'rgba(16,30,50,.78)');label('SCORE',1038,45,11,'#b4c9d1');label(String(score).padStart(5,'0'),1038,68,22);label('♥  '+(mode==='build'?4:shots),1178,48,14,'#ffd56d','center',900);if(mode==='build'||mode==='aim'){box(414,24,482,58,16,'rgba(255,255,255,.76)');label(mode==='build'?'YOUR TURN · FORTIFY THE NEST':'READY, AIM…',655,44,13,'#264b5b','center',900);label(mode==='build'?'Stack blocks around your pig, then let your friend attack.':'Drag back and release to fling your bird!',655,64,11,'#55727a','center',700)}else if(mode==='attack'){box(435,24,410,58,16,'rgba(30,40,58,.75)');label('INCOMING! FRIEND IS ATTACKING',640,43,13,'white','center',900);label('Drag back to fire a bird and defend your fort!',640,64,11,'#cfdae0','center',700)}}
function panel(){
 if(mode==='build'){
  box(24,112,286,444,20,'rgba(16,30,50,.80)');label('BUILD YOUR FORT',46,141,16,'#ffe19a','left',900);label('Choose a block, then place it.',46,164,11,'#d0e0df');
  kit.forEach((p,i)=>{let yy=188+i*74,active=pick===i;box(39,yy,256,62,13,active?'#385b67':'rgba(255,255,255,.10)',active?'#ffd36d':'rgba(255,255,255,.13)',active?3:1);let k={kind:p[1],w:Math.min(p[2]*.52,74),h:Math.max(p[3]*.72,16),color:p[5],hp:1,max:1};drawBlock(Object.assign(k,{x:78,y:yy+31,angle:0}));label(p[0],126,yy+22,12,'white','left',900);label(`${p[4]} left · ${p[2]}×${p[3]}`,126,yy+43,10,'#c7d7d9');});
  label('Tip: build a wide, sturdy base.',46,497,10,'#c7d7d9');btn('LET FRIEND ATTACK',43,516,248,35,'#eb9950',beginAttack,'');
 }else if(mode==='attack'||mode==='aim'){
  box(24,112,258,94,18,'rgba(16,30,50,.74)');label(`FRIEND'S VOLLEYS  ${Math.max(0,4-enemiesSent)}/4`,44,139,12,'#ffe19a','left',900);label(`YOUR COUNTERS  ${shots}`,44,166,12,'#d0e0df');
 }else if(mode==='result'){
  box(430,218,420,254,24,'rgba(16,30,50,.9)');label(resultTitle,640,270,27,'#ffe19a','center',900);label(resultText,640,311,14,'white','center');label(`FORT SCORE  ${score}`,640,349,17,'#bfe4d2','center',900);btn('PLAY AGAIN',535,389,210,48,'#ec9850',start,'');
 }
}
function pigPos(){return {x:850,y:584}}
function drawWorld(){
 blocks.forEach(drawBlock);let p=pigPos();pig(p.x,p.y);
 birds.forEach(b=>bird(b.x,b.y,b.r||16));
 bits.forEach(q=>{x.globalAlpha=Math.max(0,q.life);x.fillStyle=q.color;x.fillRect(q.x,q.y,q.s,q.s);x.globalAlpha=1});
 slingDraw();
}
function intro(){
 x.fillStyle='rgba(12,24,43,.38)';x.fillRect(0,0,W,H);box(310,142,660,440,28,'rgba(17,34,53,.94)','#ffffff55',2);
 label('BIRDS',640,205,20,'#ffcc67','center',900);label('& BRICKS',640,237,20,'white','center',900);
 label('BUILD. BRACE. BONK.',640,296,29,'#ffe19a','center',900);
 label('Your friend is coming for the piggy!',640,347,17,'#e3f0e9','center');label('Build a fort from wood, stone and glass.',640,377,14,'#bcd0d3','center');
 label('Then drag back the slingshot to defend it.',640,402,14,'#bcd0d3','center');label('Click a block · place it on the platform · survive 4 volleys',640,450,12,'#ffe19a','center');
 btn('LET’S BUILD',520,492,240,54,'#e9944b',start,'');
}
let pointer={x:0,y:0,down:false},dragging=null,enemiesSent=0,enemyTimer=0,playerFlying=false,resultTitle='',resultText='',aiming=false;
function pos(e){let r=c.getBoundingClientRect();return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
function beginAttack(){if(mode!=='build')return;pick=-1;ghost=null;mode='attack';enemiesSent=0;enemyTimer=.7;clock=0;notice='Your friend is launching!';noteTime=2}
function validPlace(kind,px,py){let p=kit[kind],w=p[2],h=p[3];if(px-w/2<648||px+w/2>1058||py<110||py>F+36)return null;
 let bestY=F-h/2,bestD=Math.abs(py-bestY);for(const b of blocks){let horiz=Math.min(px+w/2,b.x+b.w/2)-Math.max(px-w/2,b.x-b.w/2);if(horiz>8){let sy=b.y-b.h/2-h/2,d=Math.abs(py-sy);if(d<bestD&&d<45){bestD=d;bestY=sy}}}
 let y=bestY;if(Math.abs(py-bestY)>45)return null;for(const b of blocks){if(Math.abs(px-b.x)<(w+b.w)/2-5&&Math.abs(y-b.y)<(h+b.h)/2-4)return null}
 return {x:px,y,w,h,kind:p[1],color:p[5],hp:p[6],max:p[6],angle:0,vx:0,vy:0,placed:true};}
function place(px,py){if(pick<0||kit[pick][4]<=0)return;let b=validPlace(pick,px,py);if(!b){notice='That spot needs a little more room';noteTime=1.5;return}blocks.push(b);kit[pick][4]--;score+=10;notice='Nice fit!';noteTime=.8;if(!kit[pick][4])pick=-1}
function damage(b,amount){b.hp-=amount;if(b.hp<=0){score+=25;for(let i=0;i<8;i++)bits.push({x:b.x+rand(-b.w/2,b.w/2),y:b.y+rand(-b.h/2,b.h/2),vx:rand(-2,2),vy:rand(-4,-1),life:1,s:.4+Math.random()*4,color:b.kind==='glass'?'#d8ffff':b.color});blocks.splice(blocks.indexOf(b),1)}}
function launchEnemy(){let target=blocks.length?blocks[Math.floor(Math.random()*blocks.length)]:pigPos(),dx=target.x-1160,dy=target.y-535;let d=Math.hypot(dx,dy)||1;birds.push({x:1160,y:535,vx:dx/d*7.2,vy:dy/d*7.2,r:16,enemy:true,life:5});enemiesSent++;}
function launchPlayer(point){if(shots<=0)return;let dx=300-point.x,dy=536-point.y,len=Math.hypot(dx,dy);if(len<12)return;let power=clamp(len,30,145)*.12;birds.push({x:300,y:536,vx:dx/len*power*1.35,vy:dy/len*power*1.35,r:18,enemy:false,life:4});shots--;playerFlying=true;mode='attack'}
function hitBird(b){for(const q of [...blocks]){if(Math.abs(b.x-q.x)<q.w/2+b.r*.55&&Math.abs(b.y-q.y)<q.h/2+b.r*.55){damage(q,b.enemy?1:1);q.vx+=(b.enemy?-1:1)*b.vx*.12;q.vy+=b.vy*.12;b.life=0;score+=b.enemy?0:15;break}}if(b.enemy){let p=pigPos();if(Math.hypot(b.x-p.x,b.y-p.y)<b.r+20){b.life=0;score=Math.max(0,score-30);notice='The pig took a bonk!';noteTime=1.5}}}
function physics(dt){
 let step=Math.min(dt,.035);for(const b of birds){b.vy+=.10*step*60;b.x+=b.vx*step*60;b.y+=b.vy*step*60;b.life-=step;if(b.x<0||b.x>1280||b.y>720)b.life=0;hitBird(b)}birds=birds.filter(b=>b.life>0);
 for(const b of blocks){b.vy=(b.vy||0)+500*step;b.x+=(b.vx||0)*step;b.y+=(b.vy||0)*step;}
 // Blocks remain supported while sitting on the floor or another piece.
 for(const b of blocks){if(b.y+b.h/2>=F){b.y=F-b.h/2;b.vy=0;b.vx*=.7;continue}let support=null;for(const q of blocks){if(q===b)continue;let overlap=Math.min(b.x+b.w/2,q.x+q.w/2)-Math.max(b.x-b.w/2,q.x-q.w/2);if(overlap>Math.min(b.w,q.w)*.25&&Math.abs((b.y+b.h/2)-(q.y-q.h/2))<Math.max(8,Math.abs(b.vy*step)+2)){support=q;break}}if(support){b.y=support.y-support.h/2-b.h/2;b.vy=0;b.vx*=.92}else if(Math.abs(b.vy)>180){b.vx*=.99}}
 for(const q of bits){q.vy+=220*step;q.x+=q.vx;q.y+=q.vy;q.life-=step*1.4}bits=bits.filter(q=>q.life>0);
 if(mode==='attack'&&enemiesSent<4){enemyTimer-=step;if(enemyTimer<=0){launchEnemy();enemyTimer=1.65}}
 if(mode==='attack'&&enemiesSent>=4&&birds.length===0){quiet+=step;if(quiet>2){mode='result';resultTitle=blocks.length?'FORT SURVIVED!':'FORT DOWN!';resultText=blocks.length?`You protected the pig through ${enemiesSent} volleys!`:'Your friend got the pig. Build a sturdier fort!';best=Math.max(best,score)}}else quiet=0;
}
function render(){buttons=[];x.clearRect(0,0,W,H);background();drawWorld();hud();panel();if(mode==='intro')intro();if(notice&&noteTime>0&&mode!=='intro'&&mode!=='result'){box(465,642,350,38,12,'rgba(18,34,52,.86)');label(notice,640,661,12,'white','center',700)}}
function frame(t){let dt=clock?(t-clock)/1000:0;clock=t;if(noteTime>0)noteTime-=dt;if(mode!=='intro'&&mode!=='build'&&mode!=='result')physics(dt);else if(mode==='attack')physics(dt);render();requestAnimationFrame(frame)}
c.addEventListener('pointerdown',e=>{e.preventDefault();pointer=pos(e);c.setPointerCapture(e.pointerId);for(let i=buttons.length-1;i>=0;i--){let b=buttons[i];if(pointer.x>=b.a&&pointer.x<=b.a+b.w&&pointer.y>=b.b&&pointer.y<=b.b+b.h){b.fn();return}}if(mode==='intro')return;
 if(mode==='build'){if(pointer.x<310&&pointer.y>=188&&pointer.y<484){pick=Math.floor((pointer.y-188)/74);if(kit[pick][4]<=0)pick=-1;return}if(pointer.x>=640&&pointer.y<F&&pick>=0){place(pointer.x,pointer.y);return}}
 if(mode==='attack'){let d=Math.hypot(pointer.x-300,pointer.y-536);if(d<58&&shots>0){aiming=true;ghost={x:pointer.x,y:pointer.y};mode='aim'}}});
c.addEventListener('pointermove',e=>{pointer=pos(e);if(aiming){ghost={x:clamp(pointer.x,155,300),y:clamp(pointer.y,425,610)}}});
c.addEventListener('pointerup',e=>{if(aiming){let p=pos(e);aiming=false;launchPlayer({x:clamp(p.x,155,300),y:clamp(p.y,425,610)});ghost=null;mode='attack'}});
c.addEventListener('contextmenu',e=>e.preventDefault());
requestAnimationFrame(frame);
})();
