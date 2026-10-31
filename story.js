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
      'Fighter':     { hint:'shield, rage and steel', cards:['strike','strike','strike','strike','guard','guard','guard','fi_bash','fi_rage','fi_sunder'] },
      'Paladin':     { hint:'light, armor and zeal', cards:['strike','strike','strike','strike','guard','guard','guard','pa_holy','pa_mend','pa_stand'] },
      'Ranger':      { hint:'hound, bow and traps', cards:['strike','strike','strike','guard','guard','guard','ra_mark','ra_twin','ra_bite','ra_snare'] },
      'Magic-User':  { hint:'fire, frost and arcane', cards:['strike','strike','strike','guard','guard','guard','guard','mu_fire','mu_frost','mu_focus'] },
      'Illusionist': { hint:'mirrors, mind and nightmares', cards:['strike','strike','strike','guard','guard','guard','guard','il_dodge','il_weak','il_phantom'] },
      'Cleric':      { hint:'healing, wards and storm', cards:['strike','strike','strike','strike','guard','guard','guard','cl_heal','cl_ward','cl_bolt'] },
      'Thief':       { hint:'shadows, blades and tricks', cards:['strike','strike','strike','guard','guard','guard','th_bleed','th_finish','th_hide','th_trick'] },
      'Assassin':    { hint:'poison, ambush and marks', cards:['strike','strike','strike','guard','guard','guard','guard','as_poison','as_mark','as_ambush'] },
      'Monk':        { hint:'stone, mist and wind', cards:['strike','strike','strike','guard','guard','guard','mo_quick','mo_breathe','mo_palm','mo_stance'] },
      'Druid':       { hint:'bear, grove and moon', cards:['strike','strike','strike','strike','guard','guard','guard','dr_thorn','dr_regrow','dr_moon'] },
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
      fi_sunder: { name:'Sunder', t:'attack', cost:1, dmg:4, stag:2 },
      pa_stand:  { name:'Stand Firm', t:'guard', cost:1, blk:5, taunt:1 },
      ra_bite:   { name:'Hound Bite', t:'attack', cost:1, dmg:3, bleed:2, el:'nature' },
      ra_snare:  { name:'Snare', t:'skill', cost:1, weak:1, thorns:3, el:'nature', infuse:'nature' },
      il_phantom:{ name:'Phantom Bolt', t:'attack', cost:1, dmg:5, el:'shadow', eat:'shadow' },
      cl_bolt:   { name:'Thunder Strike', t:'attack', cost:1, dmg:6, el:'storm' },
      th_hide:   { name:'Hide', t:'skill', cost:1, evade:1, el:'shadow', infuse:'shadow' },
      th_trick:  { name:'Dirty Trick', t:'skill', cost:1, weak:1, draw:1 },
      as_ambush: { name:'Ambush Strike', t:'attack', cost:0, dmg:6, innate:true, once:true },
      mo_palm:   { name:'Healing Palm', t:'heal', cost:1, heal:6, party:true },
      mo_stance: { name:'Rooted Stance', t:'guard', cost:1, blk:5, taunt:1 },
      dr_moon:   { name:'Moon Bolt', t:'attack', cost:1, dmg:5, el:'storm', infuse:'storm' },
    },
    // SPECIAL / NAMED cards, class by class. These come from rewards and the skill tree.
    named: {
      'Fighter': [
        { id:'cleave',   name:'[NAME PLACEHOLDER]', idea:'Cleave',      t:'attack',   cost:2, dmg:11, stag:1, flavor:'' },
        { id:'wall',     name:'[NAME PLACEHOLDER]', idea:'Iron Wall',   t:'guard',    cost:2, blk:12, keep:true, flavor:'' },
        { id:'retort',   name:'[NAME PLACEHOLDER]', idea:'Retort',      t:'guard',    cost:1, blk:4, thorns:4, flavor:'' },
        { id:'storm',    name:'[NAME PLACEHOLDER]', idea:'Bladestorm',  t:'finisher', cost:2, dmg:3, per:3, el:'storm', flavor:'' },
        { id:'cry',      name:'[NAME PLACEHOLDER]', idea:'Battle Cry',  t:'skill',    cost:1, str:2, once:true, el:'fire', eat:'fire', flavor:'' },
        // spec signatures and capstone cards (Rare and up) — waiting for your names
        { id:'fi_n1', spec:'prot', r:2, name:'[NAME PLACEHOLDER]', idea:'Bastion Stance', t:'guard', cost:2, blk:10, cover:true, taunt:1, keep:true, flavor:'' },
        { id:'fi_n2', spec:'prot', r:3, name:'[NAME PLACEHOLDER]', idea:'Unbroken Shield', t:'guard', cost:2, blk:14, thorns:6, cover:true, taunt:1, flavor:'' },
        { id:'fi_n3', spec:'prot', r:4, name:'[NAME PLACEHOLDER]', idea:'Shield Storm', t:'attack', cost:2, dmg:4, blkDmg:1, stag:2, flavor:'' },
        { id:'fi_n4', spec:'fury', r:2, name:'[NAME PLACEHOLDER]', idea:'Berserker Flurry', t:'attack', cost:1, dmg:3, hits:4, self:3, lowHp:3, flavor:'' },
        { id:'fi_n5', spec:'fury', r:3, name:'[NAME PLACEHOLDER]', idea:'Bloodbath', t:'finisher', cost:2, dmg:6, per:4, lowHp:10, self:6, flavor:'' },
        { id:'fi_n6', spec:'fury', r:4, name:'[NAME PLACEHOLDER]', idea:'Undying Rage', t:'skill', cost:1, str:4, heal:12, once:true, flavor:'' },
        { id:'fi_n7', spec:'arms', r:2, name:'[NAME PLACEHOLDER]', idea:'Overpower', t:'attack', cost:2, dmg:12, stag:3, flavor:'' },
        { id:'fi_n8', spec:'arms', r:3, name:'[NAME PLACEHOLDER]', idea:'Deadly Precision', t:'attack', cost:2, dmg:10, crit:true, stag:2, exec:10, flavor:'' },
        { id:'fi_n9', spec:'arms', r:4, name:'[NAME PLACEHOLDER]', idea:'Perfect Form', t:'finisher', cost:3, dmg:10, per:4, crit:true, stag:3, flavor:'' },
      ],
      'Thief': [
        { id:'backstab', name:'[NAME PLACEHOLDER]', idea:'Backstab',    t:'attack',   cost:0, dmg:4, vsMark:6, el:'shadow', flavor:'' },
        { id:'mark',     name:'[NAME PLACEHOLDER]', idea:'Mark Target', t:'skill',    cost:1, mark:2, draw:1, el:'shadow', infuse:'shadow', flavor:'' },
        { id:'lacerate', name:'[NAME PLACEHOLDER]', idea:'Lacerate',    t:'attack',   cost:1, dmg:3, bleed:4, flavor:'' },
        { id:'step',     name:'[NAME PLACEHOLDER]', idea:'Shadowstep',  t:'skill',    cost:1, evade:1, draw:1, el:'shadow', flavor:'' },
        { id:'smoke',    name:'[NAME PLACEHOLDER]', idea:'Smoke Bomb',  t:'guard',    cost:1, blk:6, weak:1, el:'shadow', eat:'shadow', flavor:'' },
        { id:'evisc',    name:'[NAME PLACEHOLDER]', idea:'Eviscerate',  t:'finisher', cost:1, dmg:2, per:4, flavor:'' },
        // spec signatures and capstone cards (Rare and up) — waiting for your names
        { id:'th_n1', spec:'shadow', r:2, name:'[NAME PLACEHOLDER]', idea:'Night Dance', t:'skill', cost:1, evade:1, energy:1, draw:1, el:'shadow', eat:'shadow', flavor:'' },
        { id:'th_n2', spec:'shadow', r:3, name:'[NAME PLACEHOLDER]', idea:'Silent Kill', t:'attack', cost:1, dmg:8, vsMark:14, crit:true, flavor:'' },
        { id:'th_n3', spec:'shadow', r:4, name:'[NAME PLACEHOLDER]', idea:'Death From Shadow', t:'finisher', cost:2, dmg:4, per:4, vsMark:10, el:'shadow', flavor:'' },
        { id:'th_n4', spec:'duel', r:2, name:'[NAME PLACEHOLDER]', idea:'Whirling Blades', t:'attack', cost:2, dmg:3, hits:4, flavor:'' },
        { id:'th_n5', spec:'duel', r:3, name:'[NAME PLACEHOLDER]', idea:'Daring Lunge', t:'attack', cost:1, dmg:9, crit:true, combo:{ after:'attack', dmg:4 }, flavor:'' },
        { id:'th_n6', spec:'duel', r:4, name:'[NAME PLACEHOLDER]', idea:'Grand Finale', t:'finisher', cost:2, dmg:5, per:5, crit:true, flavor:'' },
        { id:'th_n7', spec:'trick', r:2, name:'[NAME PLACEHOLDER]', idea:'Rigged Charge', t:'attack', cost:2, dmg:6, bleed:6, stag:2, el:'fire', flavor:'' },
        { id:'th_n8', spec:'trick', r:3, name:'[NAME PLACEHOLDER]', idea:'Mind Trick', t:'skill', cost:1, weak:2, stag:3, rally:true, flavor:'' },
        { id:'th_n9', spec:'trick', r:4, name:'[NAME PLACEHOLDER]', idea:'Master Plan', t:'skill', cost:1, energy:2, draw:3, rally:true, once:true, flavor:'' },
      ],
      'Magic-User': [
        { id:'bolt',     name:'[NAME PLACEHOLDER]', idea:'Firebolt',    t:'attack',   cost:1, dmg:8, el:'fire', infuse:'fire', flavor:'' },
        { id:'ward',     name:'[NAME PLACEHOLDER]', idea:'Arcane Ward', t:'guard',    cost:1, blk:7, el:'frost', flavor:'' },
        { id:'channel',  name:'[NAME PLACEHOLDER]', idea:'Channel',     t:'skill',    cost:0, nextE:1, draw:1, flavor:'' },
        { id:'lance',    name:'[NAME PLACEHOLDER]', idea:'Frost Lance', t:'attack',   cost:1, dmg:5, weak:2, el:'frost', eat:'frost', flavor:'' },
        { id:'meteor',   name:'[NAME PLACEHOLDER]', idea:'Meteor',      t:'finisher', cost:3, dmg:24, stag:2, spellDisc:true, el:'fire', eat:'fire', flavor:'' },
        { id:'burn',     name:'[NAME PLACEHOLDER]', idea:'Immolate',    t:'attack',   cost:2, dmg:6, bleed:6, el:'fire', flavor:'' },
        // spec signatures and capstone cards (Rare and up) — waiting for your names
        { id:'mu_n1', spec:'fire', r:2, name:'[NAME PLACEHOLDER]', idea:'Fire Bloom', t:'attack', cost:1, dmg:4, bleed:8, el:'fire', flavor:'' },
        { id:'mu_n2', spec:'fire', r:4, name:'[NAME PLACEHOLDER]', idea:'Phoenix Heart', t:'skill', cost:1, heal:15, str:3, once:true, el:'fire', infuse:'fire', flavor:'' },
        { id:'mu_n3', spec:'frost', r:2, name:'[NAME PLACEHOLDER]', idea:'Ice Prison', t:'skill', cost:2, weak:3, stag:3, el:'frost', flavor:'' },
        { id:'mu_n4', spec:'frost', r:3, name:'[NAME PLACEHOLDER]', idea:'Frozen Bastion', t:'guard', cost:2, blk:12, cover:true, keep:true, el:'frost', flavor:'' },
        { id:'mu_n5', spec:'frost', r:4, name:'[NAME PLACEHOLDER]', idea:'Absolute Zero', t:'attack', cost:3, dmg:12, stag:4, weak:2, el:'frost', eat:'frost', flavor:'' },
        { id:'mu_n6', spec:'arcane', r:2, name:'[NAME PLACEHOLDER]', idea:'Quicken', t:'skill', cost:0, energy:2, once:true, flavor:'' },
        { id:'mu_n7', spec:'arcane', r:3, name:'[NAME PLACEHOLDER]', idea:'Mana Storm', t:'finisher', cost:2, dmg:4, per:4, spellDisc:true, flavor:'' },
        { id:'mu_n8', spec:'arcane', r:4, name:'[NAME PLACEHOLDER]', idea:'Overload', t:'skill', cost:0, energy:2, draw:3, once:true, flavor:'' },
      ],
      'Paladin':     [ { id:'pa_n1', name:'[NAME PLACEHOLDER]', idea:'Judgment',   t:'finisher', cost:2, dmg:4, per:3, el:'holy', eat:'holy', flavor:'' },
                       { id:'pa_n2', name:'[NAME PLACEHOLDER]', idea:'Aegis',      t:'guard',    cost:2, blk:12, keep:true, el:'holy', flavor:'' },
        // spec signatures and capstone cards (Rare and up) — waiting for your names
        { id:'pa_n3', spec:'light', r:2, name:'[NAME PLACEHOLDER]', idea:'Beacon', t:'heal', cost:1, heal:6, party:true, regen:3, el:'holy', infuse:'holy', flavor:'' },
        { id:'pa_n4', spec:'light', r:3, name:'[NAME PLACEHOLDER]', idea:'Divine Shelter', t:'guard', cost:2, blk:8, cover:true, heal:6, party:true, flavor:'' },
        { id:'pa_n5', spec:'light', r:4, name:'[NAME PLACEHOLDER]', idea:'Dawnbreak', t:'heal', cost:2, heal:18, party:true, regen:4, once:true, flavor:'' },
        { id:'pa_n6', spec:'guard', r:2, name:'[NAME PLACEHOLDER]', idea:'Bulwark of Light', t:'guard', cost:2, blk:12, taunt:1, thorns:4, el:'holy', eat:'holy', flavor:'' },
        { id:'pa_n7', spec:'guard', r:3, name:'[NAME PLACEHOLDER]', idea:'Guardian Oath', t:'guard', cost:2, blk:14, cover:true, keep:true, flavor:'' },
        { id:'pa_n8', spec:'guard', r:4, name:'[NAME PLACEHOLDER]', idea:'Unyielding', t:'skill', cost:1, blk:20, cover:true, taunt:1, once:true, flavor:'' },
        { id:'pa_n9', spec:'zeal', r:2, name:'[NAME PLACEHOLDER]', idea:'Wings of Wrath', t:'skill', cost:1, str:3, el:'holy', infuse:'holy', once:true, flavor:'' },
        { id:'pa_n10', spec:'zeal', r:3, name:'[NAME PLACEHOLDER]', idea:'Searing Judgment', t:'finisher', cost:2, dmg:6, per:4, stag:1, el:'holy', eat:'holy', flavor:'' },
        { id:'pa_n11', spec:'zeal', r:4, name:'[NAME PLACEHOLDER]', idea:'Avenging Dawn', t:'attack', cost:2, dmg:6, hits:3, stag:2, el:'holy', infuse:'holy', flavor:'' },
      ],
      'Ranger':      [ { id:'ra_n1', name:'[NAME PLACEHOLDER]', idea:'Volley',     t:'attack',   cost:2, dmg:3, hits:4, el:'storm', flavor:'' },
                       { id:'ra_n2', name:'[NAME PLACEHOLDER]', idea:'Hunter\'s Eye', t:'skill', cost:0, mark:1, draw:1, el:'storm', infuse:'storm', flavor:'' },
        // spec signatures and capstone cards (Rare and up) — waiting for your names
        { id:'ra_n3', spec:'beast', r:2, name:'[NAME PLACEHOLDER]', idea:'Alpha Call', t:'attack', cost:2, dmg:3, hits:4, bleed:2, flavor:'' },
        { id:'ra_n4', spec:'beast', r:3, name:'[NAME PLACEHOLDER]', idea:'Pack Leader', t:'skill', cost:1, str:3, draw:2, once:true, flavor:'' },
        { id:'ra_n5', spec:'beast', r:4, name:'[NAME PLACEHOLDER]', idea:'Stampede', t:'finisher', cost:2, dmg:3, per:3, hits:2, bleed:4, flavor:'' },
        { id:'ra_n6', spec:'marks', r:2, name:'[NAME PLACEHOLDER]', idea:'Piercing Shot', t:'attack', cost:2, dmg:8, vsMark:8, stag:1, crit:true, flavor:'' },
        { id:'ra_n7', spec:'marks', r:3, name:'[NAME PLACEHOLDER]', idea:'Killing Shot', t:'finisher', cost:2, dmg:6, exec:12, vsMark:6, flavor:'' },
        { id:'ra_n8', spec:'marks', r:4, name:'[NAME PLACEHOLDER]', idea:'Arrow Storm', t:'attack', cost:3, dmg:3, hits:6, el:'storm', eat:'storm', flavor:'' },
        { id:'ra_n9', spec:'wild', r:2, name:'[NAME PLACEHOLDER]', idea:'Barbed Snare', t:'guard', cost:1, blk:6, thorns:8, weak:1, flavor:'' },
        { id:'ra_n10', spec:'wild', r:3, name:'[NAME PLACEHOLDER]', idea:'Hunter Ambush', t:'attack', cost:1, dmg:14, stag:2, innate:true, once:true, flavor:'' },
        { id:'ra_n11', spec:'wild', r:4, name:'[NAME PLACEHOLDER]', idea:'Wild Trap', t:'guard', cost:2, blk:10, thorns:12, weak:2, el:'nature', infuse:'nature', flavor:'' },
      ],
      'Illusionist': [ { id:'il_n1', name:'[NAME PLACEHOLDER]', idea:'Mirror Image', t:'skill',  cost:1, evade:2, el:'shadow', eat:'shadow', flavor:'' },
                       { id:'il_n2', name:'[NAME PLACEHOLDER]', idea:'Mind Spike', t:'attack',   cost:1, dmg:6, weak:1, el:'shadow', flavor:'' },
        // spec signatures and capstone cards (Rare and up) — waiting for your names
        { id:'il_n3', spec:'mirror', r:2, name:'[NAME PLACEHOLDER]', idea:'Hall of Mirrors', t:'guard', cost:2, blk:8, evade:2, taunt:1, cover:true, flavor:'' },
        { id:'il_n4', spec:'mirror', r:3, name:'[NAME PLACEHOLDER]', idea:'Phantom Double', t:'skill', cost:1, evade:2, draw:2, flavor:'' },
        { id:'il_n5', spec:'mirror', r:4, name:'[NAME PLACEHOLDER]', idea:'Thousand Faces', t:'skill', cost:1, evade:3, taunt:1, thorns:8, once:true, flavor:'' },
        { id:'il_n6', spec:'mind', r:2, name:'[NAME PLACEHOLDER]', idea:'Lull', t:'skill', cost:2, weak:3, stag:2, rally:true, flavor:'' },
        { id:'il_n7', spec:'mind', r:3, name:'[NAME PLACEHOLDER]', idea:'Puppet Strings', t:'skill', cost:1, weak:2, stag:3, draw:1, flavor:'' },
        { id:'il_n8', spec:'mind', r:4, name:'[NAME PLACEHOLDER]', idea:'Mind Prison', t:'skill', cost:2, stag:6, weak:3, once:true, flavor:'' },
        { id:'il_n9', spec:'phant', r:2, name:'[NAME PLACEHOLDER]', idea:'Phantasmal Blade', t:'attack', cost:1, dmg:6, bleed:4, el:'shadow', eat:'shadow', flavor:'' },
        { id:'il_n10', spec:'phant', r:3, name:'[NAME PLACEHOLDER]', idea:'Waking Nightmare', t:'finisher', cost:2, dmg:4, per:4, el:'shadow', flavor:'' },
        { id:'il_n11', spec:'phant', r:4, name:'[NAME PLACEHOLDER]', idea:'Endless Dark', t:'attack', cost:2, dmg:5, hits:3, bleed:6, el:'shadow', eat:'shadow', flavor:'' },
      ],
      'Cleric':      [ { id:'cl_n1', name:'[NAME PLACEHOLDER]', idea:'Sanctuary',  t:'guard',    cost:2, blk:10, heal:5, el:'holy', eat:'holy', flavor:'' },
                       { id:'cl_n2', name:'[NAME PLACEHOLDER]', idea:'Smite',      t:'attack',   cost:1, dmg:8, el:'holy', flavor:'' },
        // spec signatures and capstone cards (Rare and up) — waiting for your names
        { id:'cl_n3', spec:'life', r:2, name:'[NAME PLACEHOLDER]', idea:'Circle of Life', t:'heal', cost:2, heal:10, party:true, regen:3, flavor:'' },
        { id:'cl_n4', spec:'life', r:3, name:'[NAME PLACEHOLDER]', idea:'Second Life', t:'heal', cost:1, heal:25, once:true, flavor:'' },
        { id:'cl_n5', spec:'life', r:4, name:'[NAME PLACEHOLDER]', idea:'Miracle', t:'heal', cost:2, heal:20, party:true, regen:4, once:true, flavor:'' },
        { id:'cl_n6', spec:'ward', r:2, name:'[NAME PLACEHOLDER]', idea:'Holy Bulwark', t:'guard', cost:2, blk:10, cover:true, heal:4, party:true, flavor:'' },
        { id:'cl_n7', spec:'ward', r:3, name:'[NAME PLACEHOLDER]', idea:'Pain Ward', t:'guard', cost:1, blk:6, thorns:6, cover:true, flavor:'' },
        { id:'cl_n8', spec:'ward', r:4, name:'[NAME PLACEHOLDER]', idea:'Radiant Barrier', t:'guard', cost:2, blk:18, cover:true, keep:true, once:true, flavor:'' },
        { id:'cl_n9', spec:'storm', r:2, name:'[NAME PLACEHOLDER]', idea:'Storm Call', t:'attack', cost:2, dmg:3, hits:4, el:'storm', eat:'storm', flavor:'' },
        { id:'cl_n10', spec:'storm', r:3, name:'[NAME PLACEHOLDER]', idea:'Divine Thunder', t:'finisher', cost:2, dmg:6, per:3, stag:2, el:'storm', flavor:'' },
        { id:'cl_n11', spec:'storm', r:4, name:'[NAME PLACEHOLDER]', idea:'Wrath of the Sky', t:'attack', cost:3, dmg:6, hits:4, stag:3, el:'storm', infuse:'storm', flavor:'' },
      ],
      'Assassin':    [ { id:'as_n1', name:'[NAME PLACEHOLDER]', idea:'Envenom',    t:'skill',    cost:1, bleed:8, el:'nature', eat:'nature', flavor:'' },
                       { id:'as_n2', name:'[NAME PLACEHOLDER]', idea:'Execute',    t:'finisher', cost:2, dmg:6, vsMark:12, flavor:'' },
        // spec signatures and capstone cards (Rare and up) — waiting for your names
        { id:'as_n3', spec:'venom', r:2, name:'[NAME PLACEHOLDER]', idea:'Black Venom', t:'attack', cost:1, dmg:3, bleed:10, el:'nature', eat:'nature', flavor:'' },
        { id:'as_n4', spec:'venom', r:3, name:'[NAME PLACEHOLDER]', idea:'Plague Blade', t:'attack', cost:2, dmg:4, hits:2, bleed:8, flavor:'' },
        { id:'as_n5', spec:'venom', r:4, name:'[NAME PLACEHOLDER]', idea:'Death Bloom', t:'skill', cost:1, bleed:20, once:true, el:'nature', eat:'nature', flavor:'' },
        { id:'as_n6', spec:'ambush', r:2, name:'[NAME PLACEHOLDER]', idea:'Opening Kill', t:'attack', cost:1, dmg:12, crit:true, stag:2, innate:true, once:true, flavor:'' },
        { id:'as_n7', spec:'ambush', r:3, name:'[NAME PLACEHOLDER]', idea:'Shadow Pounce', t:'attack', cost:1, dmg:8, crit:true, evade:1, flavor:'' },
        { id:'as_n8', spec:'ambush', r:4, name:'[NAME PLACEHOLDER]', idea:'Perfect Ambush', t:'attack', cost:0, dmg:20, crit:true, stag:3, innate:true, once:true, flavor:'' },
        { id:'as_n9', spec:'exec', r:2, name:'[NAME PLACEHOLDER]', idea:'Kill Order', t:'skill', cost:1, mark:3, str:2, flavor:'' },
        { id:'as_n10', spec:'exec', r:3, name:'[NAME PLACEHOLDER]', idea:'Final Cut', t:'finisher', cost:1, dmg:4, exec:14, vsMark:8, flavor:'' },
        { id:'as_n11', spec:'exec', r:4, name:'[NAME PLACEHOLDER]', idea:'Death Sentence', t:'finisher', cost:2, dmg:8, per:3, exec:18, crit:true, flavor:'' },
      ],
      'Monk':        [ { id:'mo_n1', name:'[NAME PLACEHOLDER]', idea:'Flurry',     t:'attack',   cost:1, dmg:2, hits:4, flavor:'' },
                       { id:'mo_n2', name:'[NAME PLACEHOLDER]', idea:'Still Mind', t:'skill',    cost:0, energy:1, draw:1, once:true, flavor:'' },
        // spec signatures and capstone cards (Rare and up) — waiting for your names
        { id:'mo_n3', spec:'stone', r:2, name:'[NAME PLACEHOLDER]', idea:'Mountain Stance', t:'guard', cost:2, blk:12, keep:true, taunt:1, flavor:'' },
        { id:'mo_n4', spec:'stone', r:3, name:'[NAME PLACEHOLDER]', idea:'Iron Skin', t:'guard', cost:1, blk:8, thorns:6, evade:1, flavor:'' },
        { id:'mo_n5', spec:'stone', r:4, name:'[NAME PLACEHOLDER]', idea:'Unmovable', t:'skill', cost:1, blk:22, cover:true, taunt:1, once:true, flavor:'' },
        { id:'mo_n6', spec:'mist', r:2, name:'[NAME PLACEHOLDER]', idea:'Mist Cocoon', t:'guard', cost:1, blk:10, heal:6, cover:true, flavor:'' },
        { id:'mo_n7', spec:'mist', r:3, name:'[NAME PLACEHOLDER]', idea:'Spirit Tea', t:'skill', cost:0, energy:1, heal:8, party:true, once:true, flavor:'' },
        { id:'mo_n8', spec:'mist', r:4, name:'[NAME PLACEHOLDER]', idea:'Restoring Tide', t:'heal', cost:2, heal:18, party:true, regen:4, once:true, flavor:'' },
        { id:'mo_n9', spec:'wind', r:2, name:'[NAME PLACEHOLDER]', idea:'Whirlwind Kicks', t:'attack', cost:1, dmg:2, hits:5, flavor:'' },
        { id:'mo_n10', spec:'wind', r:3, name:'[NAME PLACEHOLDER]', idea:'Storm of Fists', t:'finisher', cost:2, dmg:3, per:4, hits:2, flavor:'' },
        { id:'mo_n11', spec:'wind', r:4, name:'[NAME PLACEHOLDER]', idea:'Final Touch', t:'finisher', cost:1, dmg:6, exec:20, per:3, flavor:'' },
      ],
      'Druid':       [ { id:'dr_n1', name:'[NAME PLACEHOLDER]', idea:'Bramble Wall', t:'guard',  cost:2, blk:9, thorns:5, el:'nature', eat:'nature', flavor:'' },
                       { id:'dr_n2', name:'[NAME PLACEHOLDER]', idea:'Wild Swipe', t:'attack',   cost:1, dmg:5, bleed:3, el:'nature', flavor:'' },
        // spec signatures and capstone cards (Rare and up) — waiting for your names
        { id:'dr_n3', spec:'bear', r:2, name:'[NAME PLACEHOLDER]', idea:'Ironbark Hide', t:'guard', cost:2, blk:12, thorns:6, keep:true, flavor:'' },
        { id:'dr_n4', spec:'bear', r:3, name:'[NAME PLACEHOLDER]', idea:'Rampaging Bear', t:'attack', cost:2, dmg:4, hits:3, blkDmg:.3, flavor:'' },
        { id:'dr_n5', spec:'bear', r:4, name:'[NAME PLACEHOLDER]', idea:'Elder Bear', t:'skill', cost:1, blk:20, taunt:1, cover:true, heal:10, once:true, flavor:'' },
        { id:'dr_n6', spec:'grove', r:2, name:'[NAME PLACEHOLDER]', idea:'Spring Rain', t:'heal', cost:2, heal:8, party:true, regen:3, flavor:'' },
        { id:'dr_n7', spec:'grove', r:3, name:'[NAME PLACEHOLDER]', idea:'Heartwood', t:'heal', cost:1, heal:12, regen:3, el:'nature', flavor:'' },
        { id:'dr_n8', spec:'grove', r:4, name:'[NAME PLACEHOLDER]', idea:'Ancient Grove', t:'heal', cost:2, heal:15, party:true, regen:4, cover:true, once:true, flavor:'' },
        { id:'dr_n9', spec:'moon', r:2, name:'[NAME PLACEHOLDER]', idea:'Starlight Lance', t:'attack', cost:2, dmg:12, el:'storm', eat:'storm', flavor:'' },
        { id:'dr_n10', spec:'moon', r:3, name:'[NAME PLACEHOLDER]', idea:'Moon Tide', t:'finisher', cost:2, dmg:5, per:4, el:'storm', flavor:'' },
        { id:'dr_n11', spec:'moon', r:4, name:'[NAME PLACEHOLDER]', idea:'Celestial Storm', t:'attack', cost:3, dmg:7, hits:4, stag:3, el:'storm', flavor:'' },
      ],
    },
    // SPECS: three per class, like talent specs. The skill tree has one branch per spec (branch = spec,
    // capstone = the spec payoff). role · core idea · where the idea came from (mechanics only, no names).
    specs: {
      'Fighter': [
        { id:'prot', n:'PROTECTION', role:'Tank', core:'Block, taunt and shield the party; hit back with your shield.', insp:'WoW Protection Warrior · 5e Protection fighting style, Battle Master parry' },
        { id:'fury', n:'FURY', role:'Damage (melee)', core:'Pay HP for big, reckless hits; stronger when bloodied; multi-hit chains.', insp:'WoW Fury Warrior · 5e Barbarian (Berserker frenzy, Wild Heart toughness)' },
        { id:'arms', n:'WEAPONS', role:'Damage (break)', core:'Solid, precise blows that fill the break bar and finish low monsters.', insp:'WoW Arms Warrior · 5e Battle Master maneuvers (trip, disarm, riposte) and Champion crits' },
      ],
      'Paladin': [
        { id:'light', n:'LIGHT', role:'Healer', core:'Heal yourself and the whole party; holy light fuels bigger heals.', insp:'WoW Holy Paladin · 5e Oath of Devotion, lay on hands' },
        { id:'guard', n:'GUARDIAN', role:'Tank', core:'Holy armor, taunts and party shields.', insp:'WoW Protection Paladin · 5e Oath of the Ancients (warding aura)' },
        { id:'zeal', n:'ZEAL', role:'Damage (melee)', core:'Holy strikes that leave light up, then cash it in with finishers.', insp:'WoW Retribution Paladin · 5e Oath of Vengeance / Glory, divine smite' },
      ],
      'Ranger': [
        { id:'beast', n:'BEASTS', role:'Damage (pet, off-tank)', core:'Your hound bites, bleeds and can guard for you; many small hits.', insp:'WoW Beast Mastery Hunter · 5e Beast Master' },
        { id:'marks', n:'MARKSMAN', role:'Damage (ranged burst)', core:'Mark the target, then line up big precise shots.', insp:'WoW Marksmanship Hunter · 5e Hunter (prey marking)' },
        { id:'wild', n:'SURVIVAL', role:'Damage (control)', core:'Traps and snares: thorns, weaken and nature tricks.', insp:'WoW Survival Hunter · 5e Gloom Stalker / Fey Wanderer' },
      ],
      'Magic-User': [
        { id:'fire', n:'FIRE', role:'Damage (burst)', core:'Burns and big blasts; fire left up powers the next spell.', insp:'WoW Fire Mage · 5e Evoker' },
        { id:'frost', n:'FROST', role:'Control / support', core:'Weaken, break and ward the party with ice.', insp:'WoW Frost Mage · 5e Abjurer (wards)' },
        { id:'arcane', n:'ARCANE', role:'Damage (tempo)', core:'Extra points and cards; long chains of cheap spells.', insp:'WoW Arcane Mage · 5e Diviner' },
      ],
      'Illusionist': [
        { id:'mirror', n:'MIRRORS', role:'Tank (dodge)', core:'Decoys and copies make monsters miss; taunt with an illusion.', insp:'5e Illusionist (illusory self) · WoW avoidance tanks' },
        { id:'mind', n:'MIND', role:'Support / control', core:'Charm, weaken and break the monster; rally the party.', insp:'5e Enchantment, Bard Glamour · WoW Augmentation support' },
        { id:'phant', n:'PHANTASM', role:'Damage (shadow)', core:'Nightmares that bleed and grow while shadow is up.', insp:'5e phantasmal spells · WoW Shadow Priest' },
      ],
      'Cleric': [
        { id:'life', n:'LIFE', role:'Healer', core:'Big heals, heals over time and party prayers.', insp:'5e Life Domain · WoW Holy Priest' },
        { id:'ward', n:'WARD', role:'Healer (shields)', core:'Shields and heals-by-damage; protect before the hit lands.', insp:'WoW Discipline Priest · 5e Light / Twilight wards' },
        { id:'storm', n:'STORM', role:'Damage (caster)', core:'Thunder and lightning; storm left up powers the next strike.', insp:'5e Tempest / War Domain · WoW Shadow Priest dps' },
      ],
      'Thief': [
        { id:'shadow', n:'SHADOW', role:'Damage (stealth)', core:'Evade, mark and strike from the dark.', insp:'WoW Subtlety Rogue · 5e Thief / Gloom Stalker' },
        { id:'duel', n:'DUELIST', role:'Damage (combo)', core:'Quick cuts build the chain; flashy finishers cash it out.', insp:'WoW Outlaw Rogue · 5e Swashbuckler' },
        { id:'trick', n:'TRICKSTER', role:'Support / control', core:'Gadgets, dirty tricks, extra cards and luck.', insp:'5e Arcane Trickster · WoW Outlaw tricks' },
      ],
      'Assassin': [
        { id:'venom', n:'VENOM', role:'Damage (over time)', core:'Stack poison and let it work.', insp:'WoW Assassination Rogue · 5e Poisoner' },
        { id:'ambush', n:'AMBUSH', role:'Damage (opener)', core:'Huge first strikes and sure crits.', insp:'5e Assassin (strike first, sure crit) · WoW Subtlety openers' },
        { id:'exec', n:'EXECUTION', role:'Damage (finisher)', core:'Mark the target and finish it when it is low.', insp:'5e Hunter / Gloom Stalker · WoW execute-style finishers' },
      ],
      'Monk': [
        { id:'stone', n:'STONE', role:'Tank', core:'Rooted stances, deflects and steady breath.', insp:'WoW Brewmaster Monk · 5e Open Hand (deflect)' },
        { id:'mist', n:'MIST', role:'Healer', core:'Soothing mists, heals over time, kicks that heal.', insp:'WoW Mistweaver Monk · 5e Warrior of Mercy' },
        { id:'wind', n:'WIND', role:'Damage (combo)', core:'Many cheap blows, combos and fast finishers.', insp:'WoW Windwalker Monk · 5e Open Hand / Elements' },
      ],
      'Druid': [
        { id:'bear', n:'BEAR', role:'Tank', core:'Thick hide, roars and thorns.', insp:'WoW Guardian Druid · 5e Circle of the Moon' },
        { id:'grove', n:'GROVE', role:'Healer', core:'Blooms, regrowth and party heals.', insp:'WoW Restoration Druid · 5e Circle of the Land' },
        { id:'moon', n:'MOON', role:'Damage (caster)', core:'Moon and star bolts; storm left up powers the next.', insp:'WoW Balance Druid · 5e Circle of the Stars' },
      ],
    },
    // Plain spec cards (Common / Uncommon). r = the lowest rarity it can drop at.
    specCards: {
      'Fighter': [
        { id:'fi_taunt', spec:'prot', r:0, name:'Taunt', t:'skill', cost:1, taunt:1, weak:1, blk:3 },
        { id:'fi_slam', spec:'prot', r:0, name:'Shield Slam', t:'attack', cost:1, dmg:3, blkDmg:.5 },
        { id:'fi_brace', spec:'prot', r:1, name:'Brace Up', t:'guard', cost:1, blk:7, draw:1 },
        { id:'fi_rally', spec:'prot', r:1, name:'Rally', t:'skill', cost:1, cover:true, blk:4 },
        { id:'fi_reck', spec:'fury', r:0, name:'Reckless Swing', t:'attack', cost:1, dmg:9, self:4 },
        { id:'fi_frenzy', spec:'fury', r:0, name:'Frenzy', t:'attack', cost:1, dmg:2, hits:3 },
        { id:'fi_blood', spec:'fury', r:1, name:'Blood Rush', t:'skill', cost:0, self:5, energy:1, str:1 },
        { id:'fi_rampage', spec:'fury', r:1, name:'Rampage', t:'finisher', cost:2, dmg:4, per:3, lowHp:6 },
        { id:'fi_precise', spec:'arms', r:0, name:'Precise Strike', t:'attack', cost:1, dmg:6, crit:true },
        { id:'fi_trip', spec:'arms', r:0, name:'Trip', t:'attack', cost:1, dmg:3, stag:2, weak:1 },
        { id:'fi_disarm', spec:'arms', r:1, name:'Disarm', t:'skill', cost:1, weak:2, stag:1, draw:1 },
        { id:'fi_parry', spec:'arms', r:1, name:'Parry', t:'guard', cost:1, blk:5, thorns:5 },
        { id:'fi_exec', spec:'arms', r:1, name:'Finishing Blow', t:'finisher', cost:2, dmg:6, exec:14 },
      ],
      'Paladin': [
        { id:'pa_lay', spec:'light', r:0, name:'Lay On Hands', t:'heal', cost:2, heal:14, party:true, once:true },
        { id:'pa_light', spec:'light', r:0, name:'Holy Light', t:'heal', cost:1, heal:6, party:true, el:'holy', eat:'holy' },
        { id:'pa_bless', spec:'light', r:1, name:'Blessing', t:'skill', cost:1, regen:3, party:true, draw:1 },
        { id:'pa_purge', spec:'light', r:1, name:'Purify', t:'heal', cost:0, heal:4, draw:1, el:'holy' },
        { id:'pa_throw', spec:'guard', r:0, name:'Shield Throw', t:'attack', cost:1, dmg:5, blkDmg:.4, el:'holy' },
        { id:'pa_ground', spec:'guard', r:0, name:'Hallowed Ground', t:'guard', cost:1, blk:5, thorns:3, el:'holy', infuse:'holy' },
        { id:'pa_vow', spec:'guard', r:1, name:'Vow of Shelter', t:'skill', cost:1, taunt:1, cover:true, blk:4 },
        { id:'pa_rebuke', spec:'guard', r:1, name:'Rebuke', t:'attack', cost:1, dmg:4, weak:1, stag:1 },
        { id:'pa_zeal', spec:'zeal', r:0, name:'Zealous Strike', t:'attack', cost:1, dmg:6, el:'holy', combo:{ after:'attack', dmg:3 } },
        { id:'pa_blow', spec:'zeal', r:0, name:'Righteous Blow', t:'finisher', cost:2, dmg:5, per:3, el:'holy', eat:'holy' },
        { id:'pa_smite', spec:'zeal', r:1, name:'Radiant Smite', t:'attack', cost:1, dmg:5, stag:1, el:'holy', eat:'holy' },
        { id:'pa_fervor', spec:'zeal', r:1, name:'Fervor', t:'skill', cost:1, str:2, el:'holy', infuse:'holy', once:true },
      ],
      'Ranger': [
        { id:'ra_sic', spec:'beast', r:0, name:'Sic Em', t:'attack', cost:1, dmg:3, hits:2, combo:{ after:'skill', dmg:3 } },
        { id:'ra_howl', spec:'beast', r:0, name:'Pack Howl', t:'skill', cost:1, str:1, draw:1 },
        { id:'ra_petguard', spec:'beast', r:1, name:'Hound Guard', t:'guard', cost:1, blk:5, thorns:3, taunt:1 },
        { id:'ra_maul', spec:'beast', r:1, name:'Maul', t:'attack', cost:2, dmg:6, bleed:4 },
        { id:'ra_aim', spec:'marks', r:0, name:'Aimed Shot', t:'attack', cost:2, dmg:10, vsMark:4 },
        { id:'ra_quick', spec:'marks', r:0, name:'Quick Shot', t:'attack', cost:0, dmg:3, el:'storm' },
        { id:'ra_steady', spec:'marks', r:1, name:'Steady Aim', t:'skill', cost:1, mark:2, nextE:1 },
        { id:'ra_pin', spec:'marks', r:1, name:'Pinning Shot', t:'attack', cost:1, dmg:4, weak:1, stag:1 },
        { id:'ra_spike', spec:'wild', r:0, name:'Spike Trap', t:'guard', cost:1, blk:4, thorns:5, el:'nature' },
        { id:'ra_net', spec:'wild', r:0, name:'Net', t:'skill', cost:1, weak:2, stag:1 },
        { id:'ra_bomb', spec:'wild', r:1, name:'Fire Bomb', t:'attack', cost:1, dmg:4, bleed:4, el:'fire', infuse:'fire' },
        { id:'ra_camo', spec:'wild', r:1, name:'Camouflage', t:'skill', cost:1, evade:1, draw:1, el:'nature', eat:'nature' },
      ],
      'Magic-User': [
        { id:'mu_scorch', spec:'fire', r:0, name:'Scorch', t:'attack', cost:0, dmg:3, el:'fire', eat:'fire' },
        { id:'mu_kindle', spec:'fire', r:0, name:'Kindle', t:'skill', cost:1, str:1, draw:1, el:'fire', infuse:'fire' },
        { id:'mu_wave', spec:'fire', r:1, name:'Flame Wave', t:'attack', cost:2, dmg:4, hits:2, bleed:3, el:'fire' },
        { id:'mu_chill', spec:'frost', r:0, name:'Chill', t:'skill', cost:1, weak:2, stag:1, el:'frost', infuse:'frost' },
        { id:'mu_icewall', spec:'frost', r:0, name:'Ice Wall', t:'guard', cost:1, blk:7, el:'frost' },
        { id:'mu_shared', spec:'frost', r:1, name:'Shared Ward', t:'guard', cost:1, blk:5, cover:true, el:'frost' },
        { id:'mu_shatter', spec:'frost', r:1, name:'Shatter', t:'finisher', cost:1, dmg:3, per:3, stag:1, el:'frost', eat:'frost' },
        { id:'mu_darts', spec:'arcane', r:0, name:'Spark Darts', t:'attack', cost:1, dmg:2, hits:3 },
        { id:'mu_insight', spec:'arcane', r:0, name:'Insight', t:'skill', cost:0, draw:1 },
        { id:'mu_surge', spec:'arcane', r:1, name:'Power Surge', t:'attack', cost:2, dmg:4, per:2 },
        { id:'mu_blink', spec:'arcane', r:1, name:'Blink', t:'skill', cost:1, evade:1, draw:1 },
      ],
      'Illusionist': [
        { id:'il_decoy', spec:'mirror', r:0, name:'Decoy', t:'guard', cost:1, blk:4, evade:1, taunt:1 },
        { id:'il_blur', spec:'mirror', r:0, name:'Blur', t:'skill', cost:1, evade:1, blk:3 },
        { id:'il_mstrike', spec:'mirror', r:1, name:'Mirror Strike', t:'attack', cost:1, dmg:4, thorns:4, el:'shadow' },
        { id:'il_shimmer', spec:'mirror', r:1, name:'Shimmer', t:'guard', cost:1, blk:6, draw:1 },
        { id:'il_charm', spec:'mind', r:0, name:'Charm', t:'skill', cost:1, weak:2, draw:1 },
        { id:'il_confuse', spec:'mind', r:0, name:'Confuse', t:'skill', cost:1, stag:2, weak:1, el:'shadow' },
        { id:'il_inspire', spec:'mind', r:1, name:'Inspire', t:'skill', cost:1, str:2, rally:true, draw:1 },
        { id:'il_slow', spec:'mind', r:1, name:'Slow', t:'skill', cost:1, weak:2, nextE:1 },
        { id:'il_dread', spec:'phant', r:0, name:'Dread', t:'attack', cost:1, dmg:3, bleed:3, el:'shadow' },
        { id:'il_fade', spec:'phant', r:0, name:'Fade Strike', t:'attack', cost:0, dmg:3, el:'shadow', combo:{ after:'skill', dmg:4 } },
        { id:'il_terror', spec:'phant', r:1, name:'Night Terror', t:'attack', cost:2, dmg:8, weak:1, el:'shadow', infuse:'shadow' },
      ],
      'Cleric': [
        { id:'cl_prayer', spec:'life', r:0, name:'Group Prayer', t:'heal', cost:2, heal:8, party:true },
        { id:'cl_restore', spec:'life', r:0, name:'Restore', t:'heal', cost:1, regen:3 },
        { id:'cl_mercy', spec:'life', r:1, name:'Mercy', t:'heal', cost:1, heal:6, party:true, draw:1, el:'holy', eat:'holy' },
        { id:'cl_cleanse', spec:'life', r:1, name:'Cleanse', t:'heal', cost:0, heal:4, draw:1 },
        { id:'cl_barrier', spec:'ward', r:0, name:'Barrier', t:'guard', cost:1, blk:6, cover:true },
        { id:'cl_atone', spec:'ward', r:0, name:'Atone', t:'attack', cost:1, dmg:4, heal:3, el:'holy' },
        { id:'cl_sacred', spec:'ward', r:1, name:'Sacred Ward', t:'guard', cost:2, blk:10, keep:true, el:'holy', infuse:'holy' },
        { id:'cl_penance', spec:'ward', r:1, name:'Penance', t:'attack', cost:1, dmg:3, hits:2, heal:3, party:true, el:'holy' },
        { id:'cl_clap', spec:'storm', r:0, name:'Thunderclap', t:'attack', cost:1, dmg:3, hits:2, stag:1, el:'storm' },
        { id:'cl_static', spec:'storm', r:0, name:'Static Charge', t:'skill', cost:1, str:1, draw:1, el:'storm', infuse:'storm' },
        { id:'cl_wrath', spec:'storm', r:1, name:'Wrath', t:'attack', cost:2, dmg:10, el:'storm', eat:'storm' },
        { id:'cl_warbless', spec:'storm', r:1, name:'War Blessing', t:'skill', cost:1, str:1, rally:true },
      ],
      'Thief': [
        { id:'th_ambush', spec:'shadow', r:0, name:'Ambush', t:'attack', cost:1, dmg:5, vsMark:6, el:'shadow' },
        { id:'th_vanish', spec:'shadow', r:1, name:'Vanish', t:'skill', cost:1, evade:2, draw:1, once:true },
        { id:'th_riposte', spec:'duel', r:0, name:'Riposte', t:'guard', cost:1, blk:5, thorns:4 },
        { id:'th_flourish', spec:'duel', r:0, name:'Flourish', t:'attack', cost:0, dmg:3, combo:{ after:'attack', dmg:3 } },
        { id:'th_pistol', spec:'duel', r:1, name:'Pistol Shot', t:'attack', cost:1, dmg:6, stag:1 },
        { id:'th_caltrops', spec:'trick', r:0, name:'Caltrops', t:'guard', cost:1, blk:4, thorns:4, weak:1 },
        { id:'th_sand', spec:'trick', r:0, name:'Pocket Sand', t:'skill', cost:0, weak:1, draw:1, once:true },
        { id:'th_pilfer', spec:'trick', r:1, name:'Pilfer', t:'skill', cost:1, nextE:1, draw:2 },
        { id:'th_sleight', spec:'trick', r:1, name:'Sleight of Hand', t:'skill', cost:0, draw:2, once:true },
      ],
      'Assassin': [
        { id:'as_toxin', spec:'venom', r:0, name:'Toxin', t:'skill', cost:0, bleed:4, el:'nature', eat:'nature' },
        { id:'as_needle', spec:'venom', r:0, name:'Poison Needle', t:'attack', cost:1, dmg:2, hits:2, bleed:2, el:'nature' },
        { id:'as_cloud', spec:'venom', r:1, name:'Poison Cloud', t:'skill', cost:1, bleed:5, weak:1, el:'nature', infuse:'nature' },
        { id:'as_veins', spec:'venom', r:1, name:'Open Veins', t:'finisher', cost:1, dmg:2, per:2, bleed:4 },
        { id:'as_sneak', spec:'ambush', r:0, name:'Sneak Strike', t:'attack', cost:1, dmg:5, crit:true },
        { id:'as_stalk', spec:'ambush', r:0, name:'Stalk', t:'skill', cost:1, evade:1, nextE:1 },
        { id:'as_lowblow', spec:'ambush', r:1, name:'Low Blow', t:'attack', cost:1, dmg:4, stag:2, weak:1 },
        { id:'as_smokestep', spec:'ambush', r:1, name:'Smoke Step', t:'guard', cost:1, blk:5, evade:1 },
        { id:'as_hobble', spec:'exec', r:0, name:'Hobble', t:'attack', cost:1, dmg:4, weak:1, vsMark:3 },
        { id:'as_study', spec:'exec', r:0, name:'Study Target', t:'skill', cost:1, mark:2, draw:1 },
        { id:'as_mercy', spec:'exec', r:1, name:'Mercy Stroke', t:'finisher', cost:2, dmg:4, exec:12, vsMark:4 },
      ],
      'Monk': [
        { id:'mo_deflect', spec:'stone', r:0, name:'Deflect', t:'guard', cost:1, blk:4, evade:1 },
        { id:'mo_brew', spec:'stone', r:0, name:'Steady Breath', t:'heal', cost:1, heal:5, blk:4 },
        { id:'mo_shoulder', spec:'stone', r:1, name:'Shoulder Check', t:'attack', cost:1, dmg:3, blkDmg:.5, stag:1 },
        { id:'mo_wall', spec:'stone', r:1, name:'Stone Wall', t:'guard', cost:2, blk:10, taunt:1, cover:true },
        { id:'mo_mist', spec:'mist', r:0, name:'Soothing Mist', t:'heal', cost:1, regen:3, party:true },
        { id:'mo_flow', spec:'mist', r:0, name:'Life Flow', t:'heal', cost:1, heal:5, draw:1 },
        { id:'mo_kick', spec:'mist', r:1, name:'Teaching Kick', t:'attack', cost:1, dmg:5, heal:3, party:true },
        { id:'mo_rise', spec:'mist', r:1, name:'Rising Mist', t:'heal', cost:2, heal:8, party:true, regen:2 },
        { id:'mo_spin', spec:'wind', r:0, name:'Spinning Kick', t:'attack', cost:1, dmg:3, hits:2, combo:{ after:'skill', dmg:3 } },
        { id:'mo_open', spec:'wind', r:0, name:'Open Palm', t:'attack', cost:0, dmg:3, draw:1 },
        { id:'mo_chi', spec:'wind', r:1, name:'Gather Chi', t:'skill', cost:0, nextE:1, str:1 },
        { id:'mo_rkick', spec:'wind', r:1, name:'Rising Kick', t:'finisher', cost:1, dmg:3, per:3 },
      ],
      'Druid': [
        { id:'dr_hide', spec:'bear', r:0, name:'Thick Hide', t:'guard', cost:1, blk:6, keep:true },
        { id:'dr_roar', spec:'bear', r:0, name:'Roar', t:'skill', cost:1, taunt:1, weak:1, blk:3 },
        { id:'dr_maul', spec:'bear', r:1, name:'Bear Maul', t:'attack', cost:2, dmg:8, blkDmg:.4 },
        { id:'dr_endure', spec:'bear', r:1, name:'Endurance', t:'heal', cost:1, heal:6, blk:6 },
        { id:'dr_bloom', spec:'grove', r:0, name:'Bloom', t:'heal', cost:1, regen:3, party:true, el:'nature' },
        { id:'dr_sprout', spec:'grove', r:0, name:'Sprout', t:'heal', cost:1, heal:5, el:'nature', infuse:'nature' },
        { id:'dr_grove', spec:'grove', r:1, name:'Healing Grove', t:'heal', cost:2, heal:8, party:true, el:'nature', eat:'nature' },
        { id:'dr_bark', spec:'grove', r:1, name:'Bark Shield', t:'guard', cost:1, blk:6, cover:true },
        { id:'dr_thornbolt', spec:'moon', r:0, name:'Thorn Bolt', t:'attack', cost:1, dmg:6, el:'nature', eat:'nature' },
        { id:'dr_sun', spec:'moon', r:0, name:'Sunbeam', t:'attack', cost:1, dmg:4, stag:1, el:'fire' },
        { id:'dr_stars', spec:'moon', r:1, name:'Falling Stars', t:'attack', cost:2, dmg:3, hits:4, el:'storm' },
        { id:'dr_phase', spec:'moon', r:1, name:'Moon Phase', t:'skill', cost:1, str:2, draw:1, el:'storm', infuse:'storm' },
      ],
    },
    // which spec the older basic and named cards belong to
    specOf: {
      fi_bash:'prot', fi_rage:'fury', fi_sunder:'arms', wall:'prot', retort:'prot', cleave:'fury', cry:'fury', storm:'arms',
      pa_holy:'zeal', pa_mend:'light', pa_stand:'guard', pa_n1:'zeal', pa_n2:'guard', ra_mark:'marks', ra_twin:'marks', ra_bite:'beast',
      ra_snare:'wild', ra_n1:'marks', ra_n2:'marks', mu_fire:'fire', mu_frost:'frost', mu_focus:'arcane', bolt:'fire', burn:'fire',
      meteor:'fire', ward:'frost', lance:'frost', channel:'arcane', il_dodge:'mirror', il_weak:'mind', il_phantom:'phant', il_n1:'mirror',
      il_n2:'phant', cl_heal:'life', cl_ward:'ward', cl_bolt:'storm', cl_n1:'ward', cl_n2:'storm', th_hide:'shadow', th_bleed:'duel',
      th_finish:'duel', th_trick:'trick', backstab:'shadow', mark:'shadow', step:'shadow', lacerate:'duel', evisc:'duel', smoke:'trick',
      as_poison:'venom', as_mark:'exec', as_ambush:'ambush', as_n1:'venom', as_n2:'exec', mo_quick:'wind', mo_breathe:'wind', mo_palm:'mist',
      mo_stance:'stone', mo_n1:'wind', mo_n2:'wind', dr_thorn:'bear', dr_regrow:'grove', dr_moon:'moon', dr_n1:'bear', dr_n2:'bear',
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
