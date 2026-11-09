import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useScreenNav } from '@/components/game/ScreenTransition';
import * as THREE from 'three';
import Player from '@/components/game3d/Player';
import Interactor from '@/components/game3d/Interactor';
import CityDistrict from '@/components/game3d/CityDistrict';
import Sparks from '@/components/game3d/Sparks';
import HubHud from '@/components/game/HubHud';
import Tablet from '@/components/game/Tablet';
import DialogueBox from '@/components/game/DialogueBox';
import GuideChoice from '@/components/game/GuideChoice';
import ExplanationCard from '@/components/game/ExplanationCard';
import NoticeCard from '@/components/game/NoticeCard';
import FxLayer from '@/components/game/FxLayer';
import TouchControls from '@/components/game/TouchControls';
import MissionGuide from '@/components/game3d/MissionGuide';
import StrangerActor from '@/components/game3d/StrangerActor';
import AbilityMarkers from '@/components/game3d/AbilityMarkers';
import ControlsIntro, { controlsIntroSeen, INTRO_SEEN_KEY } from '@/components/game/ControlsIntro';
import { useGame, actions } from '@/game/store';
import { HEROES, MISSIONS, GATE_SLOTS, SHARD_SPOTS, gateState, gateRequirement } from '@/game/constants';
import { NPCS, STRANGERS } from '@/game/content';
import useStrangerEncounter from '@/game/useStrangerEncounter';
import { clearWorld, playerPos } from '@/game/world';
import { onAbility, addMarker, clearMarkers, SCAN_RANGE } from '@/game/abilities';
import { useOrbitDrag, takeTablet } from '@/game/input';
import { burst, addShake } from '@/game/fx3d';
import { fx } from '@/game/fx';
import { startMusic, sfx, ensureAudio } from '@/game/audio';
import useIsTouch from '@/game/useIsTouch';

const HUB_SPAWN = [0, 13];

const distTo = (x, z) => Math.hypot(x - playerPos.x, z - playerPos.z);

// Uplink: where should the SOC send the player next?
// 1) THE BAIT if its gate is open, 2) the nearest shard still out there, 3) any other open gate.
function nextObjective(game) {
  const baitIdx = MISSIONS.findIndex((m) => m.id === 'bait');
  if (baitIdx >= 0 && gateState(MISSIONS[baitIdx], game) === 'unlocked') {
    const slot = GATE_SLOTS[baitIdx];
    return { x: slot.x, y: 0, z: slot.z, label: MISSIONS[baitIdx].name };
  }
  const collected = game.shards || [];
  let best = null;
  SHARD_SPOTS.forEach((s) => {
    if (collected.includes(s.id)) return;
    const d = distTo(s.position[0], s.position[2]);
    if (!best || d < best.d) best = { x: s.position[0], y: s.position[1], z: s.position[2], d, label: 'DATA SHARD' };
  });
  if (best) return best;
  const open = MISSIONS.findIndex((m) => gateState(m, game) === 'unlocked');
  if (open >= 0) return { x: GATE_SLOTS[open].x, y: 0, z: GATE_SLOTS[open].z, label: MISSIONS[open].name };
  return null;
}

function GateCinematic({ slot, onDone }) {
  const { camera } = useThree();
  const from = useRef(null);
  const start = useRef(0);
  const finished = useRef(false);

  useFrame(() => {
    if (!from.current) {
      from.current = camera.position.clone();
      start.current = performance.now();
    }
    const k = Math.min(1, (performance.now() - start.current) / 4200);
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const target = new THREE.Vector3(slot.x * 0.46, 3.4, slot.z * 0.46);
    camera.position.lerpVectors(from.current, target, e);
    camera.lookAt(slot.x, 3.2, slot.z);
    if (k >= 1 && !finished.current) {
      finished.current = true;
      onDone();
    }
  });

  return null;
}

export default function Hub() {
  const game = useGame();
  const navigate = useScreenNav();
  const canvasRef = useRef(null);
  useOrbitDrag(canvasRef);
  const isTouch = useIsTouch();
  const hero = HEROES[game.hero] || HEROES.andrew;
  const quality = game.settings.quality || 'high';

  const [tablet, setTablet] = useState(false);
  const [near, setNear] = useState(null);
  const [dialogue, setDialogue] = useState(null);
  const [notice, setNotice] = useState(null);
  const [cinematicGate, setCinematicGate] = useState(null);
  const [banner, setBanner] = useState(null);
  const [guideStyle, setGuideStyle] = useState(() => window.sessionStorage.getItem('cb_guide_style'));
  const [pendingNotice, setPendingNotice] = useState(null);
  const [showIntro, setShowIntro] = useState(() => !controlsIntroSeen());
  const [scannedKey, setScannedKey] = useState(null);
  const introOpen = !!guideStyle && showIntro && !isTouch;

  // Social engineering ambush: strangers only show up while the player is free-roaming.
  const { encounter, setPhase: setStrangerPhase, finish: finishStranger } = useStrangerEncounter(
    !!guideStyle && !introOpen && !dialogue && !tablet && !notice && !cinematicGate
  );

  const closeIntro = useCallback(() => {
    try {
      window.localStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {
      /* storage blocked: the card simply shows again next visit */
    }
    setShowIntro(false);
  }, []);

  // Analyst tools. Player.jsx fires these when the move lands; here we decide what they do.
  const live = useRef(null);
  live.current = { game, encounter, setStrangerPhase };
  useEffect(
    () =>
      onAbility((name) => {
        const { game: g, encounter: enc, setStrangerPhase: setPhase } = live.current;
        const incoming = enc && enc.phase === 'approach';

        if (name === 'scan') {
          // Scan: reveal every uncollected shard inside the scan ring, and flag an incoming stranger.
          const collected = g.shards || [];
          const found = SHARD_SPOTS.filter(
            (s) => !collected.includes(s.id) && distTo(s.position[0], s.position[2]) <= SCAN_RANGE
          );
          found.forEach((s) =>
            addMarker({ x: s.position[0], y: s.position[1], z: s.position[2], color: '#7ffff0', height: 6, life: 6 })
          );
          fx(found.length ? `${found.length} SHARD${found.length > 1 ? 'S' : ''} IN RANGE` : 'SCAN · AREA CLEAR');
          if (incoming) {
            setScannedKey(enc.key);
            fx('UNVERIFIED CONTACT', 'bad');
          }
        } else if (name === 'firewall') {
          // Firewall: block the stranger before they reach you. Safe, but you learn nothing.
          if (incoming) {
            setPhase('leave');
            fx('CONNECTION BLOCKED');
          } else {
            fx('FIREWALL UP · NO THREATS');
          }
        } else if (name === 'uplink') {
          // Uplink: the SOC drops a beacon on your next objective.
          const target = nextObjective(g);
          if (!target) {
            fx('SOC · ALL CLEAR');
            return;
          }
          addMarker({ x: target.x, y: target.y, z: target.z, color: '#fbbf24', height: 22, life: 8 });
          fx(`SOC · ${target.label} · ${Math.round(distTo(target.x, target.z))}M`);
        }
      }),
    []
  );

  useEffect(() => {
    ensureAudio();
    startMusic('hub');
    clearWorld();
    const pending = window.sessionStorage.getItem('cb_cinematic');
    if (pending) {
      window.sessionStorage.removeItem('cb_cinematic');
      const idx = MISSIONS.findIndex((m) => m.id === pending);
      if (idx >= 0) {
        setCinematicGate(GATE_SLOTS[idx]);
        setBanner(MISSIONS[idx]);
        sfx('unlock');
      }
    }
    return () => {
      clearWorld();
      clearMarkers();
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (takeTablet()) {
        setTablet((v) => {
          if (!v) sfx('click');
          return !v;
        });
      }
    }, 60);
    const esc = (e) => {
      if (e.key === 'Escape') {
        setTablet(false);
        setNotice(null);
      }
    };
    window.addEventListener('keydown', esc);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('keydown', esc);
    };
  }, []);

  const handleInteract = useCallback(
    (item) => {
      if (!item) return;

      if (item.type === 'gate') {
        const mission = MISSIONS.find((m) => m.id === item.data.missionId);
        if (!mission) return;
        const state = gateState(mission, game);
        if (state === 'locked') {
          sfx('wrong');
          setNotice({
            title: `${mission.name} \u00b7 LOCKED`,
            body: `${gateRequirement(mission, game)}. Earn XP from correct decisions, quests and bosses to open this gate.`
          });
          return;
        }
        if (mission.id === 'bait') {
          sfx('unlock');
          navigate('/mission/bait');
          return;
        }
        sfx('click');
        setNotice({
          title: `${mission.name} \u00b7 SIGNAL SYNCING`,
          body: 'This gate is unlocked, but its level is still being compiled. THE BAIT is the live showcase \u2014 the remaining arenas arrive in the next build.'
        });
        return;
      }

      if (item.type === 'npc') {
        const npc = NPCS.find((n) => n.id === item.data.npcId);
        if (npc) {
          sfx('click');
          setDialogue({ npc, stage: 'intro' });
        }
        return;
      }

      if (item.type === 'shard') {
        const id = item.data.shardId;
        if ((game.shards || []).includes(id)) return;
        const count = (game.shards || []).length + 1;
        actions.collectShard(id);
        burst(item.position, '#7ffff0', 18, 6);
        sfx('shard');
        fx('+1 SHARD');
        if (count === 1) {
          actions.addQuest({
            id: 'shards',
            title: 'Shard Collector',
            xp: 40,
            desc: 'Recover all 10 Data Shards hidden around the district.'
          });
        }
        if (count >= 10) {
          actions.completeQuest('shards');
          actions.addXp(40);
          actions.awardBadge('shard_hunter');
          fx('+40 XP');
          sfx('correct');
          setNotice({
            title: 'SHARD COLLECTOR',
            body: 'All 10 Data Shards recovered. +40 XP and the Shard Hunter badge are yours.'
          });
        }
      }
    },
    [game, navigate]
  );

  function chooseDialogue(choice) {
    if (dialogue.kind === 'stranger') {
      chooseStranger(choice);
      return;
    }
    const npc = dialogue.npc;
    if (choice.correct) {
      actions.addXp(choice.xp);
      actions.unlockIntel(npc.intel);
      fx(`+${choice.xp} XP`);
      sfx('correct');
    } else {
      sfx('wrong');
    }
    const met = new Set([...(game.met_npcs || []), npc.id]);
    actions.metNpc(npc.id);
    if (met.size >= NPCS.length) actions.awardBadge('street_wise');
    setDialogue({ npc, stage: 'result', choice });
  }

  function strangerArrives() {
    const scenario = encounter.scenario;
    setStrangerPhase('talk');
    actions.addQuest({
      id: 'human_firewall',
      title: 'Human Firewall',
      xp: 30,
      desc: `Shut down all ${STRANGERS.length} social engineering approaches from strangers in the district.`
    });
    setDialogue({ npc: scenario, stage: 'intro', kind: 'stranger' });
  }

  function chooseStranger(choice) {
    const scenario = dialogue.npc;
    if (choice.correct) {
      actions.addXp(choice.xp);
      actions.unlockIntel(scenario.intel);
      actions.beatStranger(scenario.id);
      fx(`+${choice.xp} XP`);
      sfx('correct');
      const beaten = new Set([...(game.strangers_beaten || []), scenario.id]);
      if (beaten.size >= STRANGERS.length && !(game.badges || []).includes('human_firewall')) {
        actions.completeQuest('human_firewall');
        actions.addXp(30);
        actions.awardBadge('human_firewall');
        setPendingNotice({
          title: 'HUMAN FIREWALL',
          body: 'Tailgating, pretexting and device access: you shut down every stranger in the district. +30 XP and the Human Firewall badge are yours.'
        });
      }
    } else {
      sfx('wrong');
      addShake(0.25);
      fx('SOCIAL ENGINEERED');
    }
    setDialogue({ ...dialogue, stage: 'result', choice });
  }

  function strangerWalksAway() {
    setDialogue(null);
    setStrangerPhase('leave');
    if (pendingNotice) {
      setNotice(pendingNotice);
      setPendingNotice(null);
    }
  }

  function chooseGuide(style) {
    window.sessionStorage.setItem('cb_guide_style', style);
    setGuideStyle(style);
  }

  const frozen = !!dialogue || tablet || !!notice || !guideStyle || introOpen;

  return (
    <div ref={canvasRef} className="fixed inset-0 touch-none overflow-hidden bg-[#1e3354]">
      <Canvas
        dpr={quality === 'high' ? [1, 2] : 1}
        gl={{ antialias: quality === 'high' }}
        camera={{ fov: 55, near: 0.1, far: 400, position: [0, 4, 21] }}
      >
        <color attach="background" args={['#1e3354']} />
        <fog attach="fog" args={['#1e3354', 34, 150]} />
        <ambientLight intensity={0.55} color="#5f7fb5" />
        <directionalLight position={[12, 24, 8]} intensity={0.35} color="#9ad6ff" />
        <CityDistrict quality={quality} progress={game} />
        {guideStyle && <MissionGuide style={guideStyle} />}
        <Player
          heroId={game.hero}
          spawn={HUB_SPAWN}
          bounds={29}
          frozen={frozen}
          cinematic={!!cinematicGate}
          tabletUp={tablet}
          focus={!!dialogue}
        />
        {encounter && (
          <StrangerActor
            key={encounter.key}
            scenario={encounter.scenario}
            phase={encounter.phase}
            spawn={encounter.spawn}
            onReach={strangerArrives}
            onGiveUp={() => {
              setStrangerPhase('leave');
              fx('THEY LOST INTEREST');
            }}
            onGone={finishStranger}
          />
        )}
        <AbilityMarkers />
        <Sparks />
        <Interactor onNear={setNear} onInteract={handleInteract} enabled={!frozen && !cinematicGate} />
        {cinematicGate && (
          <GateCinematic
            slot={cinematicGate}
            onDone={() => {
              setCinematicGate(null);
              setBanner(null);
            }}
          />
        )}
      </Canvas>

      <HubHud game={game} hero={hero} onTablet={() => setTablet((v) => !v)} prompt={near ? near.label : null} />

      {!guideStyle && <GuideChoice onChoose={chooseGuide} />}

      {introOpen && <ControlsIntro color={hero.color} onClose={closeIntro} />}

      {banner && (
        <div className="pointer-events-none fixed inset-x-0 top-24 z-30 flex justify-center px-4">
          <div className="cb-rise rounded-lg border border-emerald-400/40 bg-black/70 px-5 py-2.5 text-center backdrop-blur">
            <p className="font-display text-[9px] uppercase tracking-[0.4em] text-emerald-300">Gate unlocked</p>
            <p className="font-display text-lg tracking-[0.2em] text-white">{banner.name}</p>
          </div>
        </div>
      )}

      {encounter && encounter.phase === 'approach' && (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-30 flex justify-center px-4 sm:top-6">
          <div
            className="cb-alert rounded-lg border bg-black/75 px-5 py-2.5 text-center backdrop-blur"
            style={{ borderColor: `${encounter.scenario.color}88` }}
          >
            <p className="font-display text-[9px] uppercase tracking-[0.4em]" style={{ color: encounter.scenario.color }}>
              {scannedKey === encounter.key ? 'Unverified contact' : 'Incoming contact'}
            </p>
            <p className="mt-0.5 text-sm text-white/85">
              {scannedKey === encounter.key
                ? 'Scan found no badge on record. Verify before you trust.'
                : 'Someone is walking straight toward you. Stay sharp.'}
            </p>
            <p className="mt-1 font-display text-[9px] tracking-[0.2em] text-white/45">J SCAN · K BLOCK · OR LET THEM TALK</p>
          </div>
        </div>
      )}

      {isTouch && !tablet && !dialogue && <TouchControls />}

      {tablet && <Tablet game={game} onClose={() => setTablet(false)} />}

      {dialogue && dialogue.stage === 'intro' && (
        <DialogueBox
          name={dialogue.npc.name}
          role={dialogue.npc.role}
          color={dialogue.npc.color}
          intro={dialogue.npc.intro}
          prompt={dialogue.npc.prompt}
          choices={dialogue.npc.choices}
          onChoose={chooseDialogue}
          onClose={() => (dialogue.kind === 'stranger' ? strangerWalksAway() : setDialogue(null))}
        />
      )}

      {dialogue && dialogue.stage === 'result' && (
        <ExplanationCard
          correct={dialogue.choice.correct}
          text={dialogue.choice.explain}
          xp={dialogue.choice.xp}
          label="Back to patrol"
          heading={
            dialogue.kind === 'stranger'
              ? `${dialogue.choice.correct ? 'Attack shut down' : 'You got social engineered'} \u00b7 ${dialogue.npc.tactic}`
              : undefined
          }
          flags={dialogue.kind === 'stranger' ? dialogue.npc.flags : undefined}
          onContinue={() => (dialogue.kind === 'stranger' ? strangerWalksAway() : setDialogue(null))}
        />
      )}

      {notice && (
        <NoticeCard
          title={notice.title}
          body={notice.body}
          onClose={() => setNotice(null)}
          action={{ label: 'Understood', onClick: () => setNotice(null) }}
        />
      )}

      <FxLayer />
    </div>
  );
}