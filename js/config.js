/* Lernwerk – Einstellungen. Der anon-Key ist öffentlich und dafür gedacht, im Browser zu stehen.
   Den service_role-Key NIE hier eintragen. */
window.LW_CONFIG = {
  supabaseUrl: 'https://knczncqqzyuzszcvdhnc.supabase.co',            // z. B. https://abcdefgh.supabase.co
  supabaseKey: 'sb_publishable__DAc1M87K7V6vrvDpyAP7Q_ILTas8BG',           // publishable-/anon-Key aus Project Settings → API
  loginDomain: 'lernwerk.example',
  betreiber: 'Christian P., Schüler der FIAE-Klasse',
  betreiberKurz: 'Christian',
  kontakt: 'persönlich in der Klasse oder über IServ',
  // Lernstände, die älter sind als dieser Zeitpunkt, gelten als Test-Daten und werden verworfen (Browser und Server)
  resetAb: 1790066787632, // 22.09.2026 nach der Testphase
  datenschutzStand: 'September 2026',
};
