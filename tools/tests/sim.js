// Balance von Lernwerk Legends: KI gegen KI direkt in der Engine (_k2_simulation)
// Aufruf: node sim.js [Partien je Paarung, Standard 100]
const {PGlite} = require('@electric-sql/pglite');
const fs = require('fs');
const R = require('path').join(__dirname, '..', '..', 'supabase') + '/';
const N = +process.argv[2] || 100;
(async () => {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth; create schema extensions;
    create table auth.users (id uuid primary key, last_sign_in_at timestamptz, banned_until timestamptz, encrypted_password text, updated_at timestamptz); create table auth.sessions(user_id uuid);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$; create publication supabase_realtime;`);
  for (const f of ['schema.sql', '2026-09-22-admin.sql', '2026-09-22-games.sql', '2026-09-23-ki.sql', '2026-09-23-karten-v2.sql', '2026-09-24-bombe-anzeige.sql', 'spiel-fragen.sql']) await db.exec(fs.readFileSync(R + f, 'utf8'));
  const starter = (await db.query('select _k2_starter() d')).rows[0].d;
  const boss = async n => (await db.query('select array(select jsonb_array_elements_text(_k2_boss($1)->\'deck\')) d', [n])).rows[0].d;
  const lauf = async (titel, da, db_, qa, qb, ha = 25, hb = 25) => {
    let s = [0, 0, 0], r = 0, fehler = 0;
    for (let i = 0; i < N; i++){
      // abwechselnd beginnen, damit der Vorteil des Anfangens herausfällt
      const tausch = i % 2 === 1;
      try {
        const x = (await db.query('select _k2_simulation($1, $2, $3, $4, $5, $6) r', tausch ? [db_, da, qb, qa, hb, ha] : [da, db_, qa, qb, ha, hb])).rows[0].r;
        const sieger = x.sieger === -1 ? 2 : tausch ? 1 - x.sieger : x.sieger;
        s[sieger]++; r += x.runden;
      } catch (e){ fehler++; if (fehler === 1) console.log('  FEHLER:', e.message, e.where || ''); }
    }
    console.log(`${titel.padEnd(52)} A ${String(Math.round(s[0] / N * 100)).padStart(3)} %  B ${String(Math.round(s[1] / N * 100)).padStart(3)} %  remis ${s[2]}  Ø ${(r / N).toFixed(1)} Züge${fehler ? '  Fehler: ' + fehler : ''}`);
  };
  console.log(`Je ${N} Partien, abwechselnd beginnend\n`);
  await lauf('Starter gegen Starter, beide 70 % richtig', starter, starter, .7, .7);
  await lauf('Wissensvorteil: Starter 90 % gegen Starter 30 %', starter, starter, .9, .3);
  await lauf('Wissensvorteil: Starter 80 % gegen Starter 50 %', starter, starter, .8, .5);
  for (let n = 1; n <= 6; n++){ const b = (await db.query('select _k2_boss($1) b', [n])).rows[0].b; await lauf(`Starter 75 % gegen Boss ${n} (${b.name}, ${b.hp} LP, ${b.quote})`, starter, b.deck, .75, b.quote, 25, b.hp); }
  await lauf('Boss 6-Deck 90 % gegen Boss 6-Deck 40 %', await boss(6), await boss(6), .9, .4);
})().catch(e => { console.error('ABBRUCH:', e.message, e.where || ''); process.exit(1); });
