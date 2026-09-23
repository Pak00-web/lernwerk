// Wie stark ist eine einzelne Karte? Boss-Deck gegen Starter, jeweils ohne eine Karte (durch Stechuhr-Golem ersetzt)
// Aufruf: node sim-karte.js <Boss-Nr> [Partien]
const {PGlite} = require('@electric-sql/pglite');
const fs = require('fs');
const R = require('path').join(__dirname, '..', '..', 'supabase') + '/';
const B = +process.argv[2] || 5, N = +process.argv[3] || 40;
(async () => {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth; create schema extensions;
    create table auth.users (id uuid primary key, last_sign_in_at timestamptz, banned_until timestamptz, encrypted_password text, updated_at timestamptz); create table auth.sessions(user_id uuid);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$; create publication supabase_realtime;`);
  for (const f of ['schema.sql', '2026-09-22-admin.sql', '2026-09-22-games.sql', '2026-09-23-ki.sql', '2026-09-23-karten-v2.sql', '2026-09-24-bombe-anzeige.sql', 'spiel-fragen.sql']) await db.exec(fs.readFileSync(R + f, 'utf8'));
  const starter = (await db.query('select _k2_starter() d')).rows[0].d;
  const boss = (await db.query('select _k2_boss($1) b', [B])).rows[0].b;
  const quote = async deck => { let s = 0;
    for (let i = 0; i < N; i++){ const t = i % 2; const x = (await db.query('select _k2_simulation($1, $2, .7, .7) r', t ? [starter, deck] : [deck, starter])).rows[0].r; if (x.sieger === t) s++; }
    return Math.round(s / N * 100); };
  console.log(`Boss ${B} (${boss.name}) gegen Starter, beide 70 %, 25 LP: Boss gewinnt ${await quote(boss.deck)} %`);
  for (const k of [...new Set(boss.deck)]){
    const d = boss.deck.map(x => x === k ? 'wbl-stechuhr' : x);
    console.log(`  ohne ${k.padEnd(24)} ${await quote(d)} %`);
  }
})();
