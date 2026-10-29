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

  // ── Encounter tiers (WoW-style) ───────────────────────────────────
  // party: named bosses, a 5-hunter team · raid: big bosses, 25 · city: the
  // season finale, everyone. Until online play is switched on, solo hunters
  // can try party and raid fights in PRACTICE with echo companions.
  tiers: {
    party: { icon:'👥', name:'PARTY BOSS', size:5,  min:3,  blurb:'A five-hunter fight. Gather a party at the landmark.' },
    raid:  { icon:'⚔',  name:'RAID BOSS',  size:25, min:10, blurb:'A twenty-five-hunter raid. The city gathers at the landmark.' },
    city:  { icon:'🏙', name:'CITY FINALE', size:0,  min:1,  blurb:'Everyone. One health bar for the whole city.' },
  },
};
