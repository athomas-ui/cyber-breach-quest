import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import Player from '@/components/game3d/Player';
import Interactor from '@/components/game3d/Interactor';
import CityDistrict from '@/components/game3d/CityDistrict';
import Sparks from '@/components/game3d/Sparks';
import HubHud from '@/components/game/HubHud';
import Tablet from '@/components/game/Tablet';
import DialogueBox from '@/components/game/DialogueBox';
import ExplanationCard from '@/components/game/ExplanationCard';
import NoticeCard from '@/components/game/NoticeCard';
import FxLayer from '@/components/game/FxLayer';
import TouchControls from '@/components/game/TouchControls';
import { useGame, actions } from '@/game/store';
import { HEROES, MISSIONS, GATE_SLOTS, gateState, gateRequirement } from '@/game/constants';
import { NPCS } from '@/game/content';
import { clearWorld } from '@/game/world';
import { useOrbitDrag, takeTablet } from '@/game/input';
import { burst } from '@/game/fx3d';
import { fx } from '@/game/fx';
import { startMusic, sfx, ensureAudio } from '@/game/audio';
import useIsTouch from '@/game/useIsTouch';

const HUB_SPAWN = [0, 13];

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
  const navigate = useNavigate();
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

  const frozen = !!dialogue || tablet || !!notice;

  return (
    <div ref={canvasRef} className="fixed inset-0 touch-none overflow-hidden bg-[#04060b]">
      <Canvas
        dpr={quality === 'high' ? [1, 2] : 1}
        gl={{ antialias: quality === 'high' }}
        camera={{ fov: 55, near: 0.1, far: 400, position: [0, 4, 21] }}
      >
        <fog attach="fog" args={['#050a12', 34, 150]} />
        <ambientLight intensity={0.55} color="#5f7fb5" />
        <directionalLight position={[12, 24, 8]} intensity={0.35} color="#9ad6ff" />
        <CityDistrict quality={quality} progress={game} />
        <Player
          heroId={game.hero}
          spawn={HUB_SPAWN}
          bounds={29}
          frozen={frozen}
          cinematic={!!cinematicGate}
          tabletUp={tablet}
        />
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

      {banner && (
        <div className="pointer-events-none fixed inset-x-0 top-24 z-30 flex justify-center px-4">
          <div className="cb-rise rounded-lg border border-emerald-400/40 bg-black/70 px-5 py-2.5 text-center backdrop-blur">
            <p className="font-display text-[9px] uppercase tracking-[0.4em] text-emerald-300">Gate unlocked</p>
            <p className="font-display text-lg tracking-[0.2em] text-white">{banner.name}</p>
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
          onClose={() => setDialogue(null)}
        />
      )}

      {dialogue && dialogue.stage === 'result' && (
        <ExplanationCard
          correct={dialogue.choice.correct}
          text={dialogue.choice.explain}
          xp={dialogue.choice.xp}
          label="Back to patrol"
          onContinue={() => setDialogue(null)}
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