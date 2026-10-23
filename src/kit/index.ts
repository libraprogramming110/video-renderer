// The block kit — one import surface for a session assembling a video.
//   import { World, BroadcastFrame, DealTicket, CountUpHero, ... } from "./kit";
export * from "./core";
export * from "./ui";
export * from "./icons";
export * from "./world";
export * from "./blocks";
export * from "./asset"; // AssetAssembly - added Pathos AI reel, 2026-08-06
export * from "./pack"; // BreakFromPack, UncappedFigure, CrowdToScarce - added Pathos AI long-form, 2026-08-06
export * from "./spine"; // AntibodySpine - a section-length object (the antibody), same build
export * from "./fan"; // ScopeFan - one agreement branching into N named areas, same build
export * from "./pipeline"; // PipelineSpend - the second section-length spine (the pipeline), same build
export * from "./questions"; // OpenQuestions - a list that refuses to resolve, same build
export * from "./close"; // ValueTips, ModelSwap, BackOne - the enacted closing argument, same build
export * from "./drop"; // SessionDrop - a price trace that cliffs to half, BioVie long-form 2026-08-07
export * from "./endpoint"; // EndpointSwitch (the cross-section spine) + OnlyOneCounts (its §5 callback), same build
export * from "./graded"; // UngradedPitch - a verdict column that never fills, same build
export * from "./combo"; // ComboAssembly - two agents lock + the failed prior line, Replimune long-form 2026-08-08
export * from "./cohort"; // ResponseCohort - a proportion as 100 marks + a duration as a length, same build
export * from "./arc"; // SubmissionArc - attempts against a gate, held across a section boundary, same build
export * from "./rare"; // ChannelBlock, RareBurden, CeilingExtend, EscalationLadder - Jazz x Actio long-form, 2026-08-12
export * from "./ipo"; // SameThenSplit - three identical things that diverge, IPO-week long-form 2026-08-14
// ── Vykat XR safety long-form, 2026-08-14 — the "signal vs qualifier" family ──
export * from "./tally"; // TallyDock (hero figures that TRAVEL into a header row) + SoleOption ("the only approved X" as an asymmetry)
export * from "./cluster"; // SourceStamp (a dated citation card) + ClusterField (marks that gather into named groups, one group per spoken word)
export * from "./weigh"; // CounterWeigh - the fairness beat: qualifiers hang from a fulcrum, the finding is never struck
export * from "./handoff"; // ControlHandoff - claimant lights, expected party is struck, then an item physically changes columns
export * from "./pedestal"; // TrustPedestal - a heavy mass on few points; the refill deliberately never completes
// ── Zenbexus first-in-class approval long-form, 2026-08-15 — the "new class" family ──
export * from "./myeloma"; // ClassFirst (an empty class rail, one marker) + DepthSplit (two arms as 100-mark fields) + ConditionalLabel (a grant resting on an empty slot)
export * from "./relapse"; // RelapseLine - the AXIS spine: a line of therapy, held across a section boundary
export * from "./oral"; // GapLanes (a two-rival comparator held across sections), ExtendVsScratch, VolumeNotMargin - oral GLP-1 long-form 2026-08-21
export * from "./loss"; // LossDepth - a magnitude as DEPTH below a baseline; the answer to a repeated bar layout, same build
// ── The card look, 2026-09-22 — the live carousel layouts as VO-conducted blocks ──
export * from "./card"; // CoverCard (p1-cover hook), SectionCard (p2-cover chapter card), FramedFootage (p1-content b-roll)
// ── Roche / enicepatide long-form, 2026-09-23 ──
export * from "./ladder"; // CohortLadder - ONE cohort RE-MEASURED at two thresholds (drains + re-lights from the opposite end, so neither reading claims to be a subset of the other)
export * from "./lane"; // LaneShare - exclusivity FAILING: the cap sealing an empty seat splits and an entrant takes it; the lane never grows, it is opened
export * from "./stage"; // PinnedPrice - the price pinned to the bottom rung of a development track (a section-length spine), Novartis x BoomRay long-form 2026-09-26
export * from "./rival"; // RivalLanes - a challenger lane built by docking an acquisition, an incumbent lane already full, same build
// ── Lilly Onswik long-form, 2026-09-26 ──
export * from "./dial"; // MonopolyDial - a monopoly as a CLOCK of month-segments, burst by an entrant (its §5 callback DialReset lives in ./reset)
export * from "./trial"; // TrialDescent - a head-to-head readout as two columns POURING below a baseline (depth = the counted figure), level lines for non-inferiority, brackets that lock on the endpoint
export * from "./scale"; // CrowdField - a head count that EMITS its dots into a field + a scanner beam; YearCollapse - a year of daily shots flooding a grid, then zipping 7 -> 1 into the weekly shot
export * from "./reset"; // DialReset - the dial callback: wreckage falls, the count ROLLS BACK on "reset", a dashed clock starts, then the two discs become the pans of a balance that a dropped weight TILTS
export * from "./finale"; // SignalCard - the end card where a field of drifting NOISE rushes into one pulsing signal line on "Signal"; stragglers sink on "noise."
// ── Compass / tovecimig long-form, 2026-09-26 (horizontal) ──
export * from "./flowline"; // FlowLine - a bare VO-verbatim narration primitive (per-word snap, emphasis + drawn underline) for bespoke layouts
export * from "./filing"; // FilingStandoff, DisclosureMemo, EngageLoop - a filing that collides with a DASHED trial (hollow = never happened), its disclosure, and the push-back loop
export * from "./arena"; // DataArena - THE DATA as one transforming object: trial stamp, a bispecific antibody whose square/round sites only fit their targets, the arms, a tick, then schematic KM curves with plumb-line medians + a filling hazard gap (+ ARENA/kmPath/Antibody for callbacks)
export * from "./crossover"; // CrossoverField - 100-dot arms: the control dots that crossed LEAP through a gate, turn red, and are YANKED BACK on "intention-to-treat" (the contamination shown), then tangled OS curves, then the field SORTS into the subset; NotRandomized - the red punch, "randomized" assembles out of scatter
export * from "./tension"; // TwoFacedChoice - a slack wire pulls TAUT and twangs on "tension"; a card unfolds from it (praise, a gate that swings open) and SPINS on the wire on "the same design choice" - same gate, same seat, the other reading, fog blooming over the curves on "clouded"
export * from "./lesson"; // ShortStack - a concrete slab slams down, two wins fall and stack, HOP at a dashed filing line and fall short, a dashed "Survival" slot drops into exactly the missing gap; SoftWord - "Recommended" hangs on strings over the dashed trial and swings, a padlock falls, fails to catch and tumbles away, designations stamp
export * from "./order"; // DominoOrder - dashed (not-yet) dominoes numbered in order rock on their "whether", then a what-if chain topples them onto the survival WALL, which bows and holds (damped), and a door built into its foot swings open on "crossover"; SignalCardH - the SignalCard end card laid out for 16:9
export * from "./weekly"; // WeekOrbit (3D day carousel around a dashed pen slot; two pens slam in), ApprovalGlobe (stamp slam + dose into a week cell, then a dot globe that spins to each approval), InsulinPen, WeekStrip - Lilly Onswik HORIZONTAL long-form 2026-09-27
export * from "./qwint"; // QwintBoard (the §3 spine: week-lanes, people stream, endpoint gates, NI margin, QWINT-2 zoom, A1C balls falling, hypo clouds on an elastic that snaps back on "chance"), FirmLine (a nib draws the label line; the pen is repelled) - Onswik horizontal 2026-09-27
export * from "./longway"; // LongWay - podium lunge + card flip, then ONE camera move along a months rail: cards pin to dates, launch ripple, the dot that hits the FDA wall, loops back, crawls to the resubmission and arcs onto approval; both cards stamp one tag - Onswik horizontal 2026-09-27
export * from "./promise"; // PitchSame (pens scanned identical, the week drops six, towers rain 52 vs 365, claim cards lock, focus ring becomes an orbit, "Delivery" grows out of it), DeliveryDials (odometer dose windows 400/800 + knob press; 700 dots poured into a 1 mL cube), CategoryBeam (a beam teeters on one pillar until the second rises; the differentiator tag is struck and tips off) - Onswik horizontal 2026-09-27
export * from "./gate"; // StartGate (a deterministic crowd sim: lanes queue at a portcullis on "delays", a seven-mark weight drops on "burden", weekly sheds six and the queue floods a growing pool; then the pool greys, converts, and a border tugs on "share fight"), LaunchDate (slot-machine date reels that lock into dashed empty slots) - Onswik horizontal 2026-09-27
export * from "./stake"; // NotSold (the hook: an acquisition stamp that finds nothing to land on) + StakeDisc (the §2 spine: a stake CUT from a disc while it counts, a lock, a frame, then the camera docks the deal and a bispecific assembles) - AstraZeneca x Summit vertical 2026-09-30
export * from "./pairing"; // FirstPairing (a rail of dashed slots, the first grows into the indication frame, two line-art drugs slide into its halves, the ADC payload clicks on, brackets lock) + TwoMarkets (decided = solid pill, pending = dashed calendar whose day page flips in) - AstraZeneca x Summit vertical 2026-09-30, built under the one-mover rule
export * from "./read"; // DealShape - the StakeDisc CALLBACK: the docked deal grows back, is read (one pass round the frame), a whole-company ring draws and BREAKS, then the buyer's own ADCs rise in a cascade and a bispecific OUTSIDE their fence links into every one - AstraZeneca x Summit vertical 2026-09-30
export * from "./rerun"; // BillionHandOff (the hook: "$1" stamps, zeros push in and fold to "B", the figure drops on the giver and arcs into the dashed seat that becomes the taker) + FourAntibodies (four dashed antibodies, one turns solid red and travels onto Phase 1 of a drawn track, the indication stamps) - Sanofi x Regeneron vertical 2026-10-02, one-mover rule
export * from "./blueprint"; // the RE-RUN SPINE: SPINE seats + OrigCard; Blueprint (the original card prints a dashed copy on "re-run", its halves fill on the partners' names, a red cut splits it 50/50) + PatentWall (the card grows into the revenue bar, the deal rises beside it at true scale, camera pull, the bar slides into a wall that slams down on the patent year) - Sanofi x Regeneron vertical 2026-10-02
export * from "./samepartner"; // SignalTrace (noise drains to one clean spike) + SamePartner (the trace sheds its noise on "simple"; a field of dashed "?" candidates fills the card, a lens glides out of the buyer, the field DRAINS off the card on "else"; the copy is BUILT solid, one partner forks up into both cards) + BriefClose (five story rows, checks, pulled into one issue, lockup, button + URL, the trace returns on "Signal") - Sanofi x Regeneron vertical 2026-10-02
// ── Lilly EloraTZP long-form, 2026-10-03 (VERTICAL) ──
export * from "./elora"; // MassCut (the hook: a block that loses its counted share) + PresentedSplit (a slide whose drug NAME splits into the two molecules it pairs)
export * from "./ceiling"; // CeilingData - THE SPINE: the trial docks as a header, two bars rise on their counts, the gap fills red, a camera pull parks the chart and A1C gets its own tube (CEIL geometry for the section-4 callback)
export * from "./lift"; // CeilingLift (the spine performs: a plate falls on 15%, amylin flies into the combo, the bar LIFTS the plate to 23.3, a camera pull leaves dashed rivals under the old line) + CeilingClose (the spine as a story tile inside the issue, lockup, button, URL, tagline)
// ── AbbVie Juvmo long-form, 2026-10-04 (HORIZONTAL) ──
export * from "./juvmo"; // DealTracks (the hook + SPINE: a deal docks and owns two development tracks; one capsule is struck at Phase 2, the other runs to approval) + ApprovalLabel (the name slams and docks, a day ring + tablet, a levodopa capsule that joins and steps out, five receptors with two seats, a calendar page)
export * from "./tempo"; // TempoBoard (program name docks into a section header; two trial cards enroll a crowd, refuse the capsule, get the tablet + a check; a third takes tablet AND capsule over an on/off wave) + OnTimeGain (a switch flips ON; two gains grow from one baseline at one scale while counting) + SafetySheet (a label sheet folds down, caution mark, rows on their words)
export * from "./backdeal"; // AnnouncementPage - the §1 deal grows back and becomes the headline of a white announcement page: summary lines turn into the lead drug, a margin arrow travels down to the other, a date rail builds per spoken date, two trials are struck, and a counted charge is tied to its one asset
export * from "./matters"; // SectionTitle (section words at hero size, then a docked kicker) + RestsOnOne (a price slab on five pillars; four drop to stubs, the one carrying it sinks and the slab sags, a stub rises and levels it) + OneSolidThing (one solid approval vs three dashed unknowns) + FinishLine (the two tracks return named; distance-to-run measured, a finish line, the closer capsule finishes)
export * from "./signal"; // ReceptorCase (the receptor row returns: white seats until now, red seats for the different target, claim attributed) + HowUsed (the tablet forks into two uses, each ending in a dashed not-yet-measured bar) + FirstMarker (one dated marker + the calendar page) + BriefCloseH (two tokens + a week strip retire into the lockup; button, URL, signal trace, tagline; 16:9)
// ── AstraZeneca x Summit long-form, 2026-10-05 (HORIZONTAL) ──
export * from "./equity"; // NoRightsHook (the figure slams and docks; a line reaches for the rights, a barrier slams down, the drug draws behind it) + EquitySwap (THE SPINE is born: a dated node on a rail; money rides one lane, new shares ride back, the seat takes its name; the drug, its two targets, a territories bar that loses a segment) + TermSheet (a title docks into a sheet that writes itself row by row; the reach-and-barrier repeats in front of the molecule; each company fenced with its own)
// ── AstraZeneca x Summit long-form, 2026-10-05, section 3 ──
export * from "./partner"; // PayingFor (a question, an answer that slams, one red bar) + BackboneQuote (a claim under its attribution, then a backbone rises vertebra by vertebra and its partners couple to it) + TwoAgreements (ONE card: bolted with a drug from each side and one shared cost bar, then emptied, unbolted and loose; dashed on "no assurance", sides open on "non-exclusive")
// ── AstraZeneca x Summit long-form, 2026-10-05, sections 4-5 ──
export * from "./timing"; // BetweenAxis (this deal set down between two kinds of deal, no scale drawn; then a two-sided ledger of what each side gets) + TimingRail (THE SPINE RETURNS: the dated node back in its seat, a status board of solid and hollow regions, the rail travels to the middle and FORKS into two dashed branches ending in hollow rings, five filled dots it is "not among", then the rail before the fork turns red and the node is stamped)
// ── AstraZeneca x Summit long-form, 2026-10-05, section 6 ──
export * from "./watch"; // SignalOrder - THE SPINE PAYS OFF: the dated node solid red at the head of a rail, three hollow stations on dashed rail in spoken order with their own words under them, and the loose card from kit/partner back over the last one with four EMPTY bolt holes
export * from "./unnamed"; // TargetCard (the spine), PaidFor, LabelOpens - Shionogi x IntraBio long-form, 2026-10-07
export * from "./multiple"; // ThirtyTimes, RareCorridor - same build
export * from "./nextone"; // NextOne, BriefEnd - same build
export * from "./barred"; // EightOne (the hook: a figure, eight blank tiles, one plate braced to all of them), RulingGate (the plate becomes the court, a ruling is built under it, then the patent shrinks into the tag of a GATE in a skin line a biologic passes through), CourtPlate, tileRect - Merck / Halozyme SC Keytruda long-form, 2026-10-09 (VERTICAL)
export * from "./banlanes"; // BanGrid (a red bar over the product, then eight blank tiles that turn solid and take a name per spoken country), AppealLanes (two lanes, one shut by the bar, a stream drawn once through the other), PlaybookRail (IV to SC as pills and an arrow; the SC pill drops onto a rail, a barrier slams down, the pill runs to it; the rail beyond is dashed and ends in a question) - same build
export * from "./whogate"; // SignalGate (one pill struck, then the gate slams down, a dashed seat over it fills with the patent tag, a field of biologics waits on one side and the SC pill sits on the other) + GateEnd (the story as a tile inside the issue, lockup, button, URL, tagline) - same build
export * from "./unity"; // StopHook (the hook: a day leaf docks beside the company, the trial's plate, a run halted by a bar), CallMiss (the committee's plate, then a column that stops short of a dashed endpoint drawn afterwards; EndpointChart is reused by the callback), HeldDidnt (two plates, the second drops out of level and turns red) - argenx Phase 3 UNITY long-form, 2026-10-10 (VERTICAL)
export * from "./doors"; // Key (a mechanism: three teeth are its identity), Door (a disease: a leaf that swings open, or a bar slammed across it), LaneKeyDoors (a dashed modeled lane, then one key travelling to three doors: two open, one barred) - THE SPINE of the argenx UNITY long-form, 2026-10-10
export * from "./otherdoor"; // OtherDoor (the hook header and the section 2 chart return and the column reaches the line; then two keys of different cut over two doors, one barred, one opened) + ReadLock (a flat key, a lock whose pins rise to meet every tooth, and a second lock stopped short by its too-tall pins) - same build
export * from "./readouts"; // TwoReadouts (the hook: a day leaf, the company, two announcement cards a bracket apart, a check on each and an efficacy slot that stays a DASHED EMPTY box; the cards part and take blank dashed tags) - THE SPINE (the empty slot) of the BMS two-readouts long-form, 2026-10-14 (HORIZONTAL)
export * from "./aloft"; // ReadoutChip (the hook card at chip size), DrugTrial (name slams and docks, two tablets, lungs with a creeping scar, a trial plate, three arms to a week tick, a measure bar), DoseColumns (THE SPINE CHART: a threshold line, one column through it, one under it, tops dissolve, no scale; DOSES + Column are reused by callbacks), ReportedSheet (attribution + three checked rows) - same build
export * from "./action"; // RadioDeal (maker plate, buyer, arrow, date, counted price; then a carrier, an atom, ONE emission, travel to a tumor), ActionTrial (enrolment built right to left; the spine chart on its seats; one endpoint solid, one a dashed ring on a dashed rail) - same build
export * from "./cliff"; // WordsTitle (a short title, one word per spoken word, any world), RevenueCliff (three pages: a revenue bar filled to a true share; a year against a line both products run to; a price paid and a quarter's revenue as two counted figures, never one bar) - same build
export * from "./leaves"; // LeavesOut (the spine pays off: both columns return standing, a dashed bracket over the part above the line, the empty slot twice, then lower-over / higher-under and a question), WatchDetail (two empty slots, a FORK of dashed branches to hollow rings, one trial on a dashed rail under the only date given) - same build
