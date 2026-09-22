const {PGlite}=require('@electric-sql/pglite');const fs=require('fs');const R=require('path').join(__dirname, '..', '..', 'supabase') + '/';
const A='00000000-0000-0000-0000-00000000000a';
(async()=>{const db=new PGlite();
await db.exec(`create role anon; create role authenticated; create schema auth; create schema extensions; create table auth.users (id uuid primary key, last_sign_in_at timestamptz, banned_until timestamptz, encrypted_password text, updated_at timestamptz); create table auth.sessions(user_id uuid);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$; create publication supabase_realtime;`);
for(const f of ['schema.sql','2026-09-22-admin.sql','2026-09-22-games.sql','spiel-fragen.sql'])await db.exec(fs.readFileSync(R+f,'utf8'));
await db.exec(`insert into auth.users(id) values('${A}'); insert into profile(id,spitzname,klasse_id) select '${A}','Anna',id from klassen;`);
const rpc=async(fn,args=[])=>(await db.transaction(async tx=>{await tx.query(`select set_config('test.uid',$1,true)`,[A]);return (await tx.query(`select public.${fn}(${args.map((_,i)=>'$'+(i+1)).join(',')}) r`,args)).rows}))[0].r;
const kat=Object.fromEntries((await db.query('select * from karten')).rows.map(x=>[x.id,x]));
const loes=async id=>(await db.query('select richtig from spiel_fragen where id=$1',[id])).rows[0].richtig;
await rpc('spiel_konto');
for(const deckArt of ['starter','stark']){
 if(deckArt==='stark'){await db.exec(`insert into karten_sammlung(user_id,karte_id,anzahl) select '${A}',id,2 from karten on conflict (user_id,karte_id) do update set anzahl=2`);
   await rpc('deck_speichern',[['its-techniker','aew-zweier','wbl-roboter','its-token','aew-hex','aew-compiler','its-hash','wbl-sifa','aew-debugger','its-firewall']]);}
 for(let st=1;st<=5;st++){await db.query(`update spieler_konto set statistik=jsonb_set(statistik,'{karten}','{"stufe":4}')`);
  let s=0,z=0,hp=0;for(let n=0;n<20;n++){let v=await rpc('kampf_starten',[st]);let t=0;
   while(v.status==='laeuft'&&t<80){t++;if(v.phase==='frage')v=await rpc('kampf_antwort',[v.id,(await loes(v.frage))+(Math.random()<.3?1:0)]);
    for(;;){const f=[0,1,2].find(i=>!v.du.feld[i]);if(f===undefined||v.status!=='laeuft')break;const h=v.du.hand.map((id,i)=>[i,kat[id]]).filter(x=>x[1].kosten<=v.du.fokus).sort((a,b)=>b[1].kosten-a[1].kosten)[0];if(!h)break;v=await rpc('kampf_spielen',[v.id,h[0],f]);}
    if(v.status==='laeuft')v=await rpc('kampf_zug_beenden',[v.id]);}
   if(v.ergebnis==='sieg')s++;z+=t;hp+=v.du.hp;}
  console.log(deckArt,'Stufe',st,'Siege',s+'/20','Ø Züge',(z/20).toFixed(1),'Ø eigene HP',(hp/20).toFixed(1));}}
})();
