// ══════════════════════════════════════════════════════════════════════
//  DARKWORLD · STORY FILE — the writer's section
//  Season arcs, villains, the seven locks, finale scenes and the encounter
//  tiers live here, apart from the game code, so outlines can drop straight in.
//  Anything marked [PLACEHOLDER] is a stand-in waiting for the owner's words.
//  The game reads window.DW_STORY at start-up; keep the field names, change
//  the words. (Monster, boss, district and landmark lore still live in
//  index.html: see STORY-NOTES in story-outline-template.md for where.)
// ══════════════════════════════════════════════════════════════════════
window.DW_STORY = {

  // ── Seasons ────────────────────────────────────────────────────────
  // Four a year, one per quarter (spring Mar 20, summer Jun 21, autumn Sep 22,
  // winter Dec 21). Each runs: build-up (Act I omens → Act II the locks →
  // Act III the gathering) → the finale party (a Saturday afternoon, about a
  // week before the season ends, at a public landmark) → the aftermath.
  // calendar[n] picks the story for season n (Season 0 = autumn 2026). A quarter
  // with no entry reruns the last written story and says so, so there is never
  // dead time while new seasons are being written.
  calendar: [
    { num:0, story:'hollow-night' },
  ],

  seasons: {
    'hollow-night': {
      name:'The Hollow Night', short:'THE HOLLOW NIGHT', color:'#e8862e', sigil:'🎃',
      villain:'THE GHOST OF THE NORTH STAR', villainPortrait:'iron-officer.jpg', villainEmoji:'🗝',
      vanguard:'Vanguard of the Hollow Night',  // title for everyone who shows up to the finale
      villainLore:'The first warden of Eastern State kept every key on one iron ring. The prison closed in 1971. He never handed the ring back. Now he is the Ghost of the North Star.',
      // The finale party: a public, open, daytime place
      site:{ name:'Eastern State Penitentiary', short:'EASTERN STATE', lat:39.9679, lng:-75.1727,
             note:'Gather on the Fairmount Avenue sidewalk, in daylight. Never go inside or over the walls.' },
      // One line per act, shown on the season panel as the build-up moves on [PLACEHOLDER]
      acts:[
        { name:'ACT I · THE OMENS',     line:'[PLACEHOLDER] Something stirs at Eastern State. The first keepers rise.' },
        { name:'ACT II · THE LOCKS',    line:'[PLACEHOLDER] One by one the keepers take the city\'s landmarks.' },
        { name:'ACT III · THE GATHERING', line:'[PLACEHOLDER] Two weeks out. Every hunter in the city is called to Fairmount Avenue.' },
      ],
      // Seven locks open across the build-up, about every eleven days. Every open
      // lock waits until you break it, so someone joining late can catch up.
      // Keep the date keys (L1…L7): saves are keyed to them.
      nights:[
        { date:'L1', meet:'art-museum-east', name:'THE MOURNER AT THE GATE', place:'the gates of Laurel Hill Cemetery', lat:40.0035, lng:-75.1880, portrait:'wailing-ghost.jpg', emoji:'🕯', color:'#8fb0d8',
          lore:'She keeps the vigil for seventy thousand graves. Tonight she keeps it for him. Fight her from Ridge Avenue — the cemetery is closed after dark.' },
        { date:'L2', meet:'mutter-museum', name:'THE COLLECTOR', place:'the Mütter Museum, 22nd Street', lat:39.9532, lng:-75.1765, portrait:'ledger-wraith.jpg', emoji:'🫙', color:'#c8c0a8',
          lore:'He catalogued every specimen in the building. Now he wants the jars back — and one more for you.' },
        { date:'L3', meet:'washington-square', name:'THE UNBURIED', place:'Washington Square', lat:39.9471, lng:-75.1525, portrait:'colonial-shade.jpeg', emoji:'🪖', color:'#9aa8b8',
          lore:'Two thousand soldiers lie under the lawn of Washington Square. One of them stood up and asked for his orders.' },
        { date:'L4', meet:'poe-house', name:'THE RAVEN OF SPRING GARDEN', place:'the Poe House, 7th Street', lat:39.9619, lng:-75.1501, portrait:'voidshade.jpeg', emoji:'🐦‍⬛', color:'#7a6ab8',
          lore:'Poe wrote The Black Cat in this house. The thing on the roof says only one word, and you already know it.' },
        { date:'L5', meet:'independence-mall', name:'THE DROWNED GARRISON', place:"Penn's Landing, Spruce Street Harbor", lat:39.9447, lng:-75.1422, portrait:'drowned-sailor.jpg', emoji:'⚓', color:'#2fa8a0',
          lore:'The Delaware gave back every sailor it ever took. They came ashore in formation, and they are waiting for the tide.' },
        { date:'L6', meet:'christ-church-arch', name:'THE SEXTON', place:'Christ Church Burial Ground, Arch Street', lat:39.9522, lng:-75.1470, portrait:'gravewanderer.jpeg', emoji:'⚰', color:'#b89a60',
          lore:'He digs one grave a night beside Franklin. Tonight the hole is exactly your size. Fight him from the Arch Street fence.' },
        { date:'L7', meet:'art-museum-east', name:'THE TURNKEY', place:'the Art Museum steps', lat:39.9653, lng:-75.1797, portrait:'hollowknight.jpeg', emoji:'🗝', color:'#d0302a',
          lore:'He holds the last of the seven keys and has never lost a fight on these steps. Break him and the Ghost walks free.' },
      ],
      omen:[
        { img:'eastern-state-yard.jpg', top:true, label:'FAIRMOUNT · 1829', lines:['They built Eastern State to break men with silence.', 'Hooded when they walked. Alone when they slept.', 'The first warden kept every key on one iron ring.'] },
        { img:'eastern-state-gate.jpg', top:true, label:'EASTERN STATE · NOW', lines:['The prison closed in 1971.', 'The warden never left.', 'Now his seven keepers walk the city, one landmark at a time.'] },
        { img:'iron-officer.jpg', label:'THE GHOST OF THE NORTH STAR', lines:['Break his seven locks, one by one.', 'Then meet him at the gate on Fairmount Avenue —', 'with every hunter in Philadelphia behind you.'] },
      ],
      finaleSlides:[
        { img:'eastern-state-night.jpg', label:'THE FINALE', lines:['The Ghost of the North Star is out.', 'Every hunter in Philadelphia — to Fairmount Avenue.', 'Bring a friend. Bring the whole crew.'] },
      ],
      // The party after the fight [PLACEHOLDER]
      afterparty:'[PLACEHOLDER] The gate is quiet. Someone starts the music. Philadelphia held.',
    },
  },


  // ── MEETUP SPOTS · the safety allowlist ─────────────────────────────
  // Kids play Darkworld. Every group fight (party boss, raid, season finale)
  // happens ONLY at a spot on this list, and only during GROUP_HOURS. Nothing
  // is ever generated: a place is a meetup spot because a person put it here.
  // Criteria: public and busy, well lit, staffed or highly visible, open to
  // everyone, not private property, away from traffic lanes, water edges and
  // rail lines. Each spot says why it qualifies and what to watch. Set
  // ok:false to veto a spot; anything pointing at a vetoed spot falls back to
  // solo/practice. status:'proposed' = written by the build bot, waiting for
  // the owner's review.
  groupHours: { warm:[10, 19], cold:[10, 17] },  // Apr–Sep / Oct–Mar, Eastern, start–end hour
  meetupSpots: [
    { id:'dilworth-park', name:'Dilworth Park (City Hall west plaza)', lat:39.9525, lng:-75.1647, ok:true, status:'proposed',
      reason:'Open public plaza beside City Hall; heavy foot traffic all day; lit; staffed by Center City District; SEPTA hub.', notes:'Stay on the plaza, off 15th Street and the Market Street crossings.' },
    { id:'love-park', name:'LOVE Park (JFK Plaza)', lat:39.9542, lng:-75.1655, ok:true, status:'proposed',
      reason:'Busy, open, well-lit public park across from City Hall; visitor center on site.', notes:'Avoid the JFK Blvd and 16th St curbs.' },
    { id:'rittenhouse', name:'Rittenhouse Square', lat:39.9496, lng:-75.1719, ok:true, status:'proposed',
      reason:'Busiest neighborhood park in the city; families all day; lit paths; surrounded by shops.', notes:'Meet by the central plaza, not the edges along Walnut St.' },
    { id:'logan-circle', name:'Logan Circle / Sister Cities Park', lat:39.9575, lng:-75.1703, ok:true, status:'proposed',
      reason:'Sister Cities Park has a staffed café and kids\' play area; museums on every side; busy Parkway foot traffic.', notes:'Use Sister Cities Park, never the traffic circle itself (fast cars).' },
    { id:'art-museum-east', name:'Art Museum east entrance plaza (top of the Rocky steps)', lat:39.9656, lng:-75.1806, ok:true, status:'proposed',
      reason:'Iconic, crowded, open public plaza; museum security nearby during open hours.', notes:'Daytime only. Keep away from the Kelly Drive / Schuylkill side.' },
    { id:'mutter-museum', name:'Mütter Museum front, 22nd Street', lat:39.9532, lng:-75.1765, ok:true, status:'proposed',
      reason:'Staffed museum entrance on a busy Center City street.', notes:'Museum hours only. Sidewalk is narrow: small groups.' },
    { id:'washington-square', name:'Washington Square', lat:39.9471, lng:-75.1527, ok:true, status:'proposed',
      reason:'National Park Service park beside Independence Hall area; busy with visitors; lit paths.', notes:'Meet near the Tomb of the Unknown Soldier fountain, in daylight.' },
    { id:'poe-house', name:'Edgar Allan Poe National Historic Site (front)', lat:39.9619, lng:-75.1501, ok:true, status:'proposed',
      reason:'NPS-staffed site on busy Spring Garden Street.', notes:'Small site with limited hours; quieter block. Owner: consider vetoing for raids.' },
    { id:'independence-mall', name:'Independence Visitor Center lawn', lat:39.9516, lng:-75.1500, ok:true, status:'proposed',
      reason:'Staffed visitor center and park rangers; crowded with tourists; wide open lawn.', notes:'Stands in for Penn\'s Landing, which is a water edge.' },
    { id:'christ-church-arch', name:'Christ Church Burial Ground fence, 5th & Arch', lat:39.9522, lng:-75.1474, ok:true, status:'proposed',
      reason:'Busy Old City corner across from the Mint and Independence Mall; NPS area; lots of visitors.', notes:'Stay on the sidewalk, off Arch Street.' },
    { id:'franklin-square', name:'Franklin Square', lat:39.9556, lng:-75.1503, ok:true, status:'proposed',
      reason:'Family park with staffed carousel, mini golf and food stand; fenced play area; lit.', notes:'Park hours only. The bridge ramps on its north side are off-limits.' },
    { id:'eastern-state-fairmount', name:'Fairmount Avenue sidewalk across from Eastern State', lat:39.9682, lng:-75.1727, ok:true, status:'proposed',
      reason:'Busy neighborhood main street with shops and cafés across from a staffed historic site.', notes:'Daytime only. Never go inside or over the walls. Narrow sidewalk: keep the finale crowd spread along the shops.' },
    { id:'reading-terminal', name:'Reading Terminal Market area, 12th & Arch', lat:39.9533, lng:-75.1590, ok:true, status:'proposed',
      reason:'One of the busiest indoor public markets in the country; staffed, lit, open to everyone.', notes:'Meet outside the 12th St doors during market hours.' },
    { id:'parkway-library', name:'Parkway Central Library steps', lat:39.9595, lng:-75.1712, ok:true, status:'proposed',
      reason:'Staffed public library on the Parkway.', notes:'Library hours only.' },
    { id:'clark-park', name:'Clark Park, West Philly', lat:39.9483, lng:-75.2097, ok:true, status:'proposed',
      reason:'Busy neighborhood park with farmers market and families.', notes:'Daytime. Owner: confirm.' },
  ],

  // ── Blessings: little things around the city ─────────────────────
  // Walk past one (about 150 ft) and it gives a short buff: 15 minutes, then it
  // rests for 4 hours. Each is a stamp in the Blessings book; finish a set for a
  // small permanent bonus. Hand-picked only, like the meetup spots: public, busy,
  // daylight places. ok:false keeps one out of the game until you approve it.
  // buff: regen (heal over time) · might (+damage) · luck (+loot) · wisdom (+XP)
  //       keen (+crit) · ember (walking charges embers twice as fast) · ward (heavy blows hit softer)
  // flavor: [PLACEHOLDER] lines are yours to write. Coordinates are approximate: please check.
  blessingSets: {
    'center-city': { name:'Center City', perk:'+5% XP for good', bonus:{ wisdom:0.05 } },
    'old-city':    { name:'Old City',    perk:'+5% loot odds for good', bonus:{ luck:0.05 } },
    'parkway':     { name:'The Parkway & Fairmount', perk:'+3% damage for good', bonus:{ might:0.03 } },
    'kensington':  { name:'Kensington',  perk:'Embers charge 10% faster for good', bonus:{ ember:0.10 } },
  },
  blessings: [
    { id:'love-statue',   set:'center-city', name:'The LOVE statue',          lat:39.9542, lng:-75.1655, buff:'regen',  ok:true,  flavor:'[PLACEHOLDER] A heal-over-time blessing at LOVE Park.' },
    { id:'clothespin',    set:'center-city', name:'The Clothespin',           lat:39.9525, lng:-75.1657, buff:'keen',   ok:true,  flavor:'[PLACEHOLDER] Centre Square plaza, 15th & Market.' },
    { id:'william-penn',  set:'center-city', name:'William Penn atop City Hall', lat:39.9524, lng:-75.1636, buff:'ward', ok:true,  flavor:'[PLACEHOLDER] Look up from the City Hall courtyard.' },
    { id:'dilworth',      set:'center-city', name:'Dilworth Park fountains',  lat:39.9527, lng:-75.1648, buff:'regen',  ok:true,  flavor:'[PLACEHOLDER] The plaza fountains west of City Hall.' },
    { id:'reading-term',  set:'center-city', name:'Reading Terminal Market',  lat:39.9533, lng:-75.1590, buff:'luck',   ok:true,  flavor:'[PLACEHOLDER] 12th & Arch, during market hours.' },
    { id:'liberty-bell',  set:'old-city',    name:'The Liberty Bell',         lat:39.9496, lng:-75.1503, buff:'might',  ok:true,  flavor:'[PLACEHOLDER] Outside the Liberty Bell Center.' },
    { id:'elfreths',      set:'old-city',    name:"Elfreth's Alley",          lat:39.9526, lng:-75.1424, buff:'wisdom', ok:true,  flavor:'[PLACEHOLDER] The oldest street. Walk it in daylight.' },
    { id:'rocky',         set:'parkway',     name:'The Rocky statue',         lat:39.9649, lng:-75.1797, buff:'might',  ok:true,  flavor:'[PLACEHOLDER] Bottom of the Art Museum steps.' },
    { id:'joan-of-arc',   set:'parkway',     name:'Joan of Arc',              lat:39.9644, lng:-75.1783, buff:'ward',   ok:true,  flavor:'[PLACEHOLDER] The gold statue by the Art Museum. Stay on the sidewalk, off Kelly Drive.' },
    { id:'swann',         set:'parkway',     name:'Swann Fountain (from Sister Cities Park)', lat:39.9568, lng:-75.1689, buff:'regen', ok:true, flavor:'[PLACEHOLDER] Counted from Sister Cities Park, never the traffic circle.' },
    { id:'boathouse-row', set:'parkway',     name:'Boathouse Row',            lat:39.9690, lng:-75.1855, buff:'ember',  ok:true,  flavor:'[PLACEHOLDER] Daytime, on the path side. It is a river edge: owner, confirm or veto.' },
    { id:'eastern-state', set:'parkway',     name:'Eastern State (from Fairmount Ave)', lat:39.9682, lng:-75.1727, buff:'keen', ok:true, flavor:'[PLACEHOLDER] From the Fairmount Avenue sidewalk. Never inside or over the walls.' },
    { id:'mcpherson-lib', set:'kensington',  name:'McPherson Square Library', lat:39.9963, lng:-75.1209, buff:'wisdom', ok:false, flavor:'[PLACEHOLDER] OWNER REVIEW: the library itself is a good public place, but the square has had heavy drug activity. Off until you approve it (library hours only).' },
    { id:'el-somerset',   set:'kensington',  name:'The El at Somerset',       lat:39.9906, lng:-75.1302, buff:'ember',  ok:false, flavor:'[PLACEHOLDER] OWNER REVIEW: El stops on Kensington Ave are in the middle of the open-air drug market today. A buff here would pull kids there. Off until you decide.' },
    { id:'el-allegheny',  set:'kensington',  name:'The El at K&A',            lat:39.9966, lng:-75.1134, buff:'might',  ok:false, flavor:'[PLACEHOLDER] OWNER REVIEW: same as Somerset. Off until you decide.' },
  ],

  // ── Encounter tiers (WoW-style) ───────────────────────────────────
  // party: every named boss, a 5-hunter team · raid: the one raid boss, 25 ·
  // city: the season finale, everyone. Until online play is switched on, solo
  // hunters can only PRACTICE these fights with AI echoes (no loot).
  // Exactly one 25-hunter raid boss for now (swap the name here). Every other
  // named monster (bosses, sub-bosses, lock bosses, quest and delve bosses,
  // weekly raids) is a 5-hunter party fight; nobody beats a named monster alone.
  raidBoss: 'MALECHAR THE LICH-KING',
  tiers: {
    party: { icon:'👥', name:'PARTY BOSS', size:5,  min:3,  blurb:'A five-hunter fight. Gather a party at the landmark.' },
    raid:  { icon:'⚔',  name:'RAID BOSS',  size:25, min:10, blurb:'The one twenty-five-hunter raid. The city gathers at the landmark.' },
    city:  { icon:'🏙', name:'CITY FINALE', size:0,  min:1,  blurb:'Everyone. One health bar for the whole city.' },
  },

  // ── CARDS · items · chain perks ─────────────────────────────────────
  // How to fill in: change a `name:'[NAME PLACEHOLDER]'` to the real name and
  // write a `flavor:` line. `idea` is only a working title the game shows in
  // [brackets] until the real name is in. Numbers scale with level and rarity.
  // Card fields: t = attack | guard | skill | finisher | heal, cost = points,
  //   dmg/blk/heal/bleed/weak/mark/evade/draw/energy/str/thorns, el = chain element
  //   (fire frost storm holy shadow nature), infuse = leaves that element up for the
  //   party, eat = uses that element for a bonus, once = burns after one use.
  cards: {
    // Every class starts with its own plain BASIC set (10 cards). Plain names on purpose.
    basics: {
      'Fighter':     { hint:'shield and rage',      cards:['strike','strike','strike','strike','guard','guard','guard','guard','fi_bash','fi_rage'] },
      'Paladin':     { hint:'holy light and armor', cards:['strike','strike','strike','strike','guard','guard','guard','guard','pa_holy','pa_mend'] },
      'Ranger':      { hint:'marks and volleys',    cards:['strike','strike','strike','strike','guard','guard','guard','guard','ra_mark','ra_twin'] },
      'Magic-User':  { hint:'elements and energy',  cards:['strike','strike','strike','guard','guard','guard','guard','mu_fire','mu_frost','mu_focus'] },
      'Illusionist': { hint:'dodges and weakness',  cards:['strike','strike','strike','strike','guard','guard','guard','guard','il_dodge','il_weak'] },
      'Cleric':      { hint:'healing and wards',    cards:['strike','strike','strike','strike','guard','guard','guard','guard','cl_heal','cl_ward'] },
      'Thief':       { hint:'bleeds and finishers', cards:['strike','strike','strike','strike','guard','guard','guard','guard','th_bleed','th_finish'] },
      'Assassin':    { hint:'poison and marks',     cards:['strike','strike','strike','strike','guard','guard','guard','guard','as_poison','as_mark'] },
      'Monk':        { hint:'quick combos',         cards:['strike','strike','strike','strike','guard','guard','guard','guard','mo_quick','mo_breathe'] },
      'Druid':       { hint:'thorns and regrowth',  cards:['strike','strike','strike','strike','guard','guard','guard','guard','dr_thorn','dr_regrow'] },
    },
    basicDefs: {
      strike:    { name:'Strike',          t:'attack', cost:1, dmg:6 },
      guard:     { name:'Guard',           t:'guard',  cost:1, blk:5 },
      fi_bash:   { name:'Shield Bash',     t:'attack', cost:1, dmg:4, blk:4, stag:1 },
      fi_rage:   { name:'Rage',            t:'skill',  cost:1, str:2, once:true, el:'fire' },
      pa_holy:   { name:'Holy Strike',     t:'attack', cost:1, dmg:5, el:'holy', infuse:'holy' },
      pa_mend:   { name:'Mend',            t:'heal',   cost:1, heal:7, blk:3, el:'holy', eat:'holy' },
      ra_mark:   { name:'Mark',            t:'skill',  cost:1, mark:2, draw:1, el:'storm' },
      ra_twin:   { name:'Double Shot',     t:'attack', cost:1, dmg:3, hits:2, el:'storm', eat:'storm' },
      mu_fire:   { name:'Fire Bolt',       t:'attack', cost:1, dmg:7, el:'fire', infuse:'fire' },
      mu_frost:  { name:'Frost Bolt',      t:'attack', cost:1, dmg:4, weak:2, el:'frost', infuse:'frost' },
      mu_focus:  { name:'Gather',          t:'skill',  cost:0, nextE:1, draw:1 },
      il_dodge:  { name:'Dodge',           t:'skill',  cost:1, evade:1, draw:1, el:'shadow' },
      il_weak:   { name:'Weaken',          t:'skill',  cost:1, weak:2, el:'shadow', infuse:'shadow' },
      cl_heal:   { name:'Heal',            t:'heal',   cost:1, heal:8, el:'holy', eat:'holy' },
      cl_ward:   { name:'Holy Ward',       t:'guard',  cost:1, blk:6, el:'holy', infuse:'holy' },
      th_bleed:  { name:'Cut',             t:'attack', cost:1, dmg:3, bleed:4 },
      th_finish: { name:'Finish',          t:'finisher', cost:1, dmg:2, per:4 },
      as_poison: { name:'Poison Strike',   t:'attack', cost:1, dmg:2, bleed:5, el:'nature', infuse:'nature' },
      as_mark:   { name:'Mark',            t:'skill',  cost:1, mark:2, draw:1, el:'shadow' },
      mo_quick:  { name:'Quick Strike',    t:'attack', cost:0, dmg:3, combo:{ after:'skill', dmg:3 } },
      mo_breathe:{ name:'Breathe',         t:'skill',  cost:1, draw:2 },
      dr_thorn:  { name:'Thorn Guard',     t:'guard',  cost:1, blk:4, thorns:3, el:'nature', infuse:'nature' },
      dr_regrow: { name:'Regrow',          t:'heal',   cost:1, heal:6, blk:3, el:'nature', eat:'nature' },
    },
    // SPECIAL / NAMED cards, class by class. These come from rewards and the skill tree.
    named: {
      'Fighter': [
        { id:'cleave',   name:'[NAME PLACEHOLDER]', idea:'Cleave',      t:'attack',   cost:2, dmg:11, stag:1, flavor:'' },
        { id:'wall',     name:'[NAME PLACEHOLDER]', idea:'Iron Wall',   t:'guard',    cost:2, blk:12, keep:true, flavor:'' },
        { id:'retort',   name:'[NAME PLACEHOLDER]', idea:'Retort',      t:'guard',    cost:1, blk:4, thorns:4, flavor:'' },
        { id:'storm',    name:'[NAME PLACEHOLDER]', idea:'Bladestorm',  t:'finisher', cost:2, dmg:3, per:3, el:'storm', flavor:'' },
        { id:'cry',      name:'[NAME PLACEHOLDER]', idea:'Battle Cry',  t:'skill',    cost:1, str:2, once:true, el:'fire', eat:'fire', flavor:'' },
      ],
      'Thief': [
        { id:'backstab', name:'[NAME PLACEHOLDER]', idea:'Backstab',    t:'attack',   cost:0, dmg:4, vsMark:6, el:'shadow', flavor:'' },
        { id:'mark',     name:'[NAME PLACEHOLDER]', idea:'Mark Target', t:'skill',    cost:1, mark:2, draw:1, el:'shadow', infuse:'shadow', flavor:'' },
        { id:'lacerate', name:'[NAME PLACEHOLDER]', idea:'Lacerate',    t:'attack',   cost:1, dmg:3, bleed:4, flavor:'' },
        { id:'step',     name:'[NAME PLACEHOLDER]', idea:'Shadowstep',  t:'skill',    cost:1, evade:1, draw:1, el:'shadow', flavor:'' },
        { id:'smoke',    name:'[NAME PLACEHOLDER]', idea:'Smoke Bomb',  t:'guard',    cost:1, blk:6, weak:1, el:'shadow', eat:'shadow', flavor:'' },
        { id:'evisc',    name:'[NAME PLACEHOLDER]', idea:'Eviscerate',  t:'finisher', cost:1, dmg:2, per:4, flavor:'' },
      ],
      'Magic-User': [
        { id:'bolt',     name:'[NAME PLACEHOLDER]', idea:'Firebolt',    t:'attack',   cost:1, dmg:8, el:'fire', infuse:'fire', flavor:'' },
        { id:'ward',     name:'[NAME PLACEHOLDER]', idea:'Arcane Ward', t:'guard',    cost:1, blk:7, el:'frost', flavor:'' },
        { id:'channel',  name:'[NAME PLACEHOLDER]', idea:'Channel',     t:'skill',    cost:0, nextE:1, draw:1, flavor:'' },
        { id:'lance',    name:'[NAME PLACEHOLDER]', idea:'Frost Lance', t:'attack',   cost:1, dmg:5, weak:2, el:'frost', eat:'frost', flavor:'' },
        { id:'meteor',   name:'[NAME PLACEHOLDER]', idea:'Meteor',      t:'finisher', cost:3, dmg:24, stag:2, spellDisc:true, el:'fire', eat:'fire', flavor:'' },
        { id:'burn',     name:'[NAME PLACEHOLDER]', idea:'Immolate',    t:'attack',   cost:2, dmg:6, bleed:6, el:'fire', flavor:'' },
      ],
      'Paladin':     [ { id:'pa_n1', name:'[NAME PLACEHOLDER]', idea:'Judgment',   t:'finisher', cost:2, dmg:4, per:3, el:'holy', eat:'holy', flavor:'' },
                       { id:'pa_n2', name:'[NAME PLACEHOLDER]', idea:'Aegis',      t:'guard',    cost:2, blk:12, keep:true, el:'holy', flavor:'' } ],
      'Ranger':      [ { id:'ra_n1', name:'[NAME PLACEHOLDER]', idea:'Volley',     t:'attack',   cost:2, dmg:3, hits:4, el:'storm', flavor:'' },
                       { id:'ra_n2', name:'[NAME PLACEHOLDER]', idea:'Hunter\'s Eye', t:'skill', cost:0, mark:1, draw:1, el:'storm', infuse:'storm', flavor:'' } ],
      'Illusionist': [ { id:'il_n1', name:'[NAME PLACEHOLDER]', idea:'Mirror Image', t:'skill',  cost:1, evade:2, el:'shadow', eat:'shadow', flavor:'' },
                       { id:'il_n2', name:'[NAME PLACEHOLDER]', idea:'Mind Spike', t:'attack',   cost:1, dmg:6, weak:1, el:'shadow', flavor:'' } ],
      'Cleric':      [ { id:'cl_n1', name:'[NAME PLACEHOLDER]', idea:'Sanctuary',  t:'guard',    cost:2, blk:10, heal:5, el:'holy', eat:'holy', flavor:'' },
                       { id:'cl_n2', name:'[NAME PLACEHOLDER]', idea:'Smite',      t:'attack',   cost:1, dmg:8, el:'holy', flavor:'' } ],
      'Assassin':    [ { id:'as_n1', name:'[NAME PLACEHOLDER]', idea:'Envenom',    t:'skill',    cost:1, bleed:8, el:'nature', eat:'nature', flavor:'' },
                       { id:'as_n2', name:'[NAME PLACEHOLDER]', idea:'Execute',    t:'finisher', cost:2, dmg:6, vsMark:12, flavor:'' } ],
      'Monk':        [ { id:'mo_n1', name:'[NAME PLACEHOLDER]', idea:'Flurry',     t:'attack',   cost:1, dmg:2, hits:4, flavor:'' },
                       { id:'mo_n2', name:'[NAME PLACEHOLDER]', idea:'Still Mind', t:'skill',    cost:0, energy:1, draw:1, once:true, flavor:'' } ],
      'Druid':       [ { id:'dr_n1', name:'[NAME PLACEHOLDER]', idea:'Bramble Wall', t:'guard',  cost:2, blk:9, thorns:5, el:'nature', eat:'nature', flavor:'' },
                       { id:'dr_n2', name:'[NAME PLACEHOLDER]', idea:'Wild Swipe', t:'attack',   cost:1, dmg:5, bleed:3, el:'nature', flavor:'' } ],
    },
    // Chain perks: the passive layer that bends how chains score. Magic items carry them.
    perks: {
      ember:  { name:'Ember',      ic:'🔥', d:'Fire cards add +1 to the multiplier.' },
      frost:  { name:'Frost',      ic:'❄', d:'Frost cards add +1 to the multiplier.' },
      twin:   { name:'Twin',       ic:'♊', d:'The 2nd card each turn adds its damage twice.' },
      iron:   { name:'Iron',       ic:'🧱', d:'Guard cards add half their block to the chain.' },
      echo:   { name:'Echo',       ic:'🔁', d:'Matching elements add +1 instead of +0.5.' },
      flow:   { name:'Flow',       ic:'🌊', d:'Three different card types in a row add +2 instead of +1.' },
      long:   { name:'Long Chain', ic:'⛓', d:'+0.5 for every card past the 4th.' },
      spark:  { name:'Spark',      ic:'⚡', d:'Your first skill each turn costs 1 less point.' },
      battery:{ name:'Battery',    ic:'🔋', d:'1 unused point carries into your next turn.' },
      glass:  { name:'Glass',      ic:'🔮', d:'Doubles the final multiplier. Shatters for the fight if one hit takes a quarter of your HP.', breaks:true },
      last:   { name:'Last Stand', ic:'💀', d:'Triples the multiplier while you are under 25% HP. Cracks after 3 uses in a fight.', breaks:true },
    },
    // Magic items that work with the cards. Plain names for basic gear; special ones
    // keep a [NAME PLACEHOLDER] for you. rarity uses the card scale: common · uncommon · rare · legendary
    // (items have no Epic yet). perk = its chain perk; card = a card it upgrades; el = the element its gear card carries.
    items: [
      { id:'mi_ring',   name:'Iron Ring',           slot:'accessory', rarity:'common', perk:'iron',  card:'guard',    el:null,     stats:{ def:6 } },
      { id:'mi_coal',   name:'Ember Stone',         slot:'accessory', rarity:'common', perk:'ember', card:null,       el:'fire',   stats:{ atk:12 } },
      { id:'mi_shard',  name:'Frost Shard',         slot:'accessory', rarity:'common', perk:'frost', card:null,       el:'frost',  stats:{ atk:10, def:3 } },
      { id:'mi_cell',   name:'Spark Charm',         slot:'accessory', rarity:'uncommon', perk:'spark', card:null,       el:'storm',  stats:{ resMax:30 } },
      { id:'mi_twin',   name:'[NAME PLACEHOLDER]',  idea:'Twin Blades',   slot:'weapon',    rarity:'uncommon', perk:'twin',    el:'storm',  stats:{ atk:70, crit:4 } },
      { id:'mi_bell',   name:'[NAME PLACEHOLDER]',  idea:'Echo Bell',     slot:'accessory', rarity:'rare', perk:'echo',    el:'holy',   stats:{ atk:90, hp:80 } },
      { id:'mi_chain',  name:'[NAME PLACEHOLDER]',  idea:'Long Chain',    slot:'weapon',    rarity:'rare', perk:'long',    el:'shadow', stats:{ atk:240, crit:6 } },
      { id:'mi_glass',  name:'[NAME PLACEHOLDER]',  idea:'Glass Heart',   slot:'accessory', rarity:'rare', perk:'glass',   el:null,     stats:{ atk:150 } },
      { id:'mi_battery',name:'[NAME PLACEHOLDER]',  idea:'Spare Breath',  slot:'armor',     rarity:'rare', perk:'battery', el:null,     stats:{ def:90, hp:150 } },
      { id:'mi_last',   name:'[NAME PLACEHOLDER]',  idea:'Last Light',    slot:'accessory', rarity:'legendary', perk:'last',    el:'fire',   stats:{ atk:260, hp:200 } },
      { id:'mi_flow',   name:'[NAME PLACEHOLDER]',  idea:'Tide Wraps',    slot:'armor',     rarity:'legendary', perk:'flow',    el:'frost',  stats:{ def:140, hp:260, dodge:6 } },
    ],
  },
};
