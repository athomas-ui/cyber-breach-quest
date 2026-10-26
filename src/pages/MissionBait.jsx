import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import Player from '@/components/game3d/Player';
import Interactor from '@/components/game3d/Interactor';
import ServerRoom from '@/components/game3d/ServerRoom';
import BossArena from '@/components/game3d/BossArena';
import Sparks from '@/components/game3d/Sparks';
import DialogueBox from '@/components/game/DialogueBox';
import EmailInspector from '@/components/game/EmailInspector';
import ExplanationCard from '@/components/game/ExplanationCard';
import BossHud from '@/components/game/BossHud';
import ResultsScreen from '@/components/game/ResultsScreen';
import FxLayer from '@/components/game/FxLayer';
import TouchControls from '@/components/game/TouchControls';
import { useGame, actions } from '@/game/store';
import { EMAILS, MISSION_GUIDE } from '@/game/content';
import { MISSIONS } from '@/game/constants';
import { useFight, resetFight, beginIntro, startFight, reportHook, getFight, clearNote } from '@/game/lureFight';
import { clearWorld, setTimeScale } from '@/game/world';
import { useOrbitDrag } from '@/game/input';
import { burst, addShake } from '@/game/fx3d';
import { fx } from '@/game/fx';
import { startMusic, stopMusic, sfx } from '@/game/audio';
import useIsTouch from '@/game/useIsTouch';

const INTRO_MS = 3200;
const BOSS = MISSIONS[0];

export default function MissionBait() {
  const game = useGame();
  const fight = useFight();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  useOrbitDrag(canvasRef);
  const isTouch = useIsTouch();
  const quality = game.settings.quality || 'high';

  const [mode, setMode] = useState('level');
  const [sorted, setSorted] = useState([]);
  const [active, setActive] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [near, setNear] = useState(null);
  const [cinematic, setCinematic] = useState(false);
  const [earned, setEarned] = useState(0);
  const [wrongs, setWrongs] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [resultBadges, setResultBadges] = useState([]);
  const [dialogue, setDialogue] = useState(null);
  const [objectiveOpen, setObjectiveOpen] = useState(true);
  const [guideAnswered, setGuideAnswered] = useState(false);
  const introTimer = useRef(null);

  useEffect(() => {
    clearWorld();
    startMusic('hub');
    return () => {
      window.clearTimeout(introTimer.current);
      clearWorld();
      setTimeScale(1);
      stopMusic();
    };
  }, []);

  useEffect(() => {
    startMusic(mode === 'boss' ? 'boss' : 'hub');
  }, [mode]);

  useEffect(() => {
    setObjectiveOpen(true);
  }, [mode]);

  useEffect(() => {
    if (!fight.note) return undefined;
    const t = window.setTimeout(() => clearNote(), 5000);
    return () => window.clearTimeout(t);
  }, [fight.note]);

  useEffect(() => {
    if (fight.status !== 'win' || mode !== 'boss') return undefined;
    setTimeScale(0.28);
    sfx('boom');
    addShake(0.7);
    burst(new THREE.Vector3(0, 3.6, -8), '#ff5fa2', 70, 15);
    burst(new THREE.Vector3(0, 3.6, -8), '#ffe36e', 40, 11);
    const t = window.setTimeout(() => finish(), 2600);
    return () => window.clearTimeout(t);
  }, [fight.status, mode]);

  function startBoss() {
    resetFight();
    setMode('boss');
    setCinematic(true);
    beginIntro();
    window.clearTimeout(introTimer.current);
    introTimer.current = window.setTimeout(() => {
      startFight();
      setCinematic(false);
      sfx('unlock');
    }, INTRO_MS);
  }

  function finish() {
    setTimeScale(1);
    actions.addXp(100);
    setEarned((v) => v + 100);
    actions.completeMission('bait');
    actions.unlockIntel('phishing_domains');
    actions.unlockIntel('urgency');
    actions.unlockIntel('bec');
    const list = ['first_deploy', 'lure_slayer'];
    actions.awardBadge('first_deploy');
    actions.awardBadge('lure_slayer');
    if (getFight().shield >= 50) {
      list.push('unbroken');
      actions.awardBadge('unbroken');
    }
    if (wrongs === 0) {
      list.push('flawless_sort');
      actions.awardBadge('flawless_sort');
    }
    setResultBadges(list);
    setShowResults(true);
  }

  function decide(saysSafe) {
    const email = active;
    if (!email) return;
    const correct = saysSafe === !email.phish;
    setSorted((prev) => [...prev, { id: email.id, bin: saysSafe ? 'safe' : 'phish' }]);
    setActive(null);
    if (correct) {
      actions.addXp(15);
      setEarned((v) => v + 15);
      fx('+15 XP');
      sfx('correct');
    } else {
      setWrongs((v) => v + 1);
      sfx('wrong');
    }
    setFeedback({ correct, text: email.explain, xp: correct ? 15 : 0 });
  }

  function continueFeedback() {
    if (sorted.length >= EMAILS.length) {
      setFeedback(null);
      startBoss();
    } else {
      setFeedback(null);
    }
  }

  function handleInteract(item) {
    if (!item) return;
    if (item.type === 'npc' && item.data.npcId === MISSION_GUIDE.id) {
      sfx('click');
      setDialogue({ npc: MISSION_GUIDE, stage: 'intro' });
      return;
    }
    if (item.type === 'email') {
      const email = EMAILS.find((e) => e.id === item.data.emailId);
      if (email) {
        sfx('click');
        setActive(email);
      }
      return;
    }
    if (item.type === 'report') {
      const res = reportHook();
      if (!res) return;
      if (res.correct) {
        sfx('correct');
        fx('DIRECT HIT');
        addShake(0.35);
        burst(new THREE.Vector3(0, 3.4, -6), '#ffe36e', 24, 9);
      } else {
        sfx('wrong');
        addShake(0.3);
      }
    }
  }

  function chooseDialogue(choice) {
    const result = guideAnswered ? { ...choice, xp: 0 } : choice;
    if (choice.correct) {
      if (!guideAnswered) {
        actions.addXp(choice.xp);
        actions.unlockIntel(MISSION_GUIDE.intel);
        fx(`+${choice.xp} XP`);
        setGuideAnswered(true);
      }
      sfx('correct');
    } else {
      sfx('wrong');
    }
    setDialogue({ npc: MISSION_GUIDE, stage: 'result', choice: result });
  }

  function leaveMission() {
    window.sessionStorage.setItem('cb_cinematic', 'locksmith');
    startMusic('hub');
    navigate('/hub');
  }

  const levelFrozen = !!active || !!feedback || !!dialogue || objectiveOpen;
  const roomObjective =
    mode === 'level'
      ? {
          room: 'Server room',
          text: `Inspect and sort all ${EMAILS.length} messages into SAFE or PHISH. Check sender addresses, links, urgency, and requests for sensitive information. Talk to KAI for a tip.`
        }
      : {
          room: 'Boss arena',
          text: 'Report only the real phishing hooks before they reach you. Check for lookalike domains and verify suspicious requests.'
        };

  return (
    <div ref={canvasRef} className="fixed inset-0 touch-none overflow-hidden bg-[#02040a]">
      {mode === 'level' && (
        <Canvas
          key="level"
          dpr={quality === 'high' ? [1, 2] : 1}
          gl={{ antialias: quality === 'high' }}
          camera={{ fov: 55, near: 0.1, far: 160, position: [0, 4, 18] }}
        >
          <fog attach="fog" args={['#04080f', 20, 62]} />
          <ambientLight intensity={0.7} color="#7fb6d8" />
          <ServerRoom quality={quality} sorted={sorted} guideAnswered={guideAnswered} />
          <Player heroId={game.hero} spawn={[0, 11]} bounds={15.5} frozen={levelFrozen} />
          <Sparks />
          <Interactor onNear={setNear} onInteract={handleInteract} enabled={!levelFrozen} />
        </Canvas>
      )}

      {mode === 'boss' && (
        <Canvas
          key="boss"
          dpr={quality === 'high' ? [1, 2] : 1}
          gl={{ antialias: quality === 'high' }}
          camera={{ fov: 60, near: 0.1, far: 200, position: [0, 5, 20] }}
        >
          <fog attach="fog" args={['#0a0410', 26, 80]} />
          <ambientLight intensity={0.55} color="#a06a8f" />
          <BossArena quality={quality} />
          <Player heroId={game.hero} spawn={[0, 12]} bounds={15.5} frozen={showResults || objectiveOpen} cinematic={cinematic} />
          <Sparks />
          <Interactor onNear={setNear} onInteract={handleInteract} enabled={fight.status === 'fight' && !objectiveOpen} />
        </Canvas>
      )}

      {/* top mission bar */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-start justify-between px-3 pt-3 sm:px-5 sm:pt-5">
        <button
          onClick={leaveMission}
          className="pointer-events-auto rounded-md border border-white/12 bg-black/50 px-3 py-1.5 font-display text-[9px] uppercase tracking-[0.25em] text-white/50 backdrop-blur transition hover:text-white"
        >
          Abort
        </button>
        {mode === 'level' && (
          <div className="rounded-md border border-white/12 bg-black/50 px-3 py-1.5 backdrop-blur">
            <p className="font-display text-[9px] uppercase tracking-[0.3em] text-sky-300">Mission 01 · The Bait</p>
            <p className="mt-0.5 font-display text-[9px] tracking-[0.2em] text-white/40">
              SORTED {sorted.length} / {EMAILS.length}
            </p>
          </div>
        )}
      </div>

      {mode === 'level' && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center px-4">
          {near ? (
            <div className="cb-rise flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-4 py-2 backdrop-blur">
              <span className="flex h-5 w-5 items-center justify-center rounded border border-white/30 font-display text-[9px] text-white/80">
                E
              </span>
              <span className="font-display text-[10px] uppercase tracking-[0.22em] text-white/80">{near.label}</span>
            </div>
          ) : (
            <p className="font-display text-[9px] uppercase tracking-[0.3em] text-white/25">
              Inspect email panels or talk to KAI for a tip · press E
            </p>
          )}
        </div>
      )}

      {objectiveOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <section className="cb-rise w-full max-w-lg rounded-2xl border border-sky-300/30 bg-[#060b12]/95 p-5 shadow-[0_0_60px_rgba(56,189,248,0.12)] sm:p-7">
            <p className="font-display text-[9px] uppercase tracking-[0.38em] text-sky-300">Room objective</p>
            <h2 className="mt-2 font-display text-xl tracking-[0.14em] text-white">{roomObjective.room}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">{roomObjective.text}</p>
            <button
              onClick={() => setObjectiveOpen(false)}
              className="mt-5 rounded-lg border border-sky-300/35 bg-sky-300/[0.08] px-4 py-2.5 font-display text-[10px] uppercase tracking-[0.25em] text-sky-100 transition hover:bg-sky-300/[0.16]"
            >
              Enter room
            </button>
          </section>
        </div>
      )}

      {isTouch && (mode === 'level' ? !levelFrozen : fight.status === 'fight' && !objectiveOpen) && <TouchControls />}

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
          label="Back to room"
          onContinue={() => setDialogue(null)}
        />
      )}

      {active && <EmailInspector email={active} onDecide={decide} />}

      {feedback && (
        <ExplanationCard
          correct={feedback.correct}
          text={feedback.text}
          xp={feedback.xp}
          label={sorted.length >= EMAILS.length ? 'Breach the arena' : 'Next email'}
          onContinue={continueFeedback}
        />
      )}

      {mode === 'boss' && !showResults && (
        <BossHud fight={fight} onRetry={startBoss} onLeave={leaveMission} />
      )}

      {mode === 'boss' && fight.note && fight.status === 'fight' && !showResults && (
        <div className="pointer-events-none fixed inset-x-0 bottom-32 z-20 flex justify-center px-4">
          <div
            className="cb-rise max-w-xl rounded-lg border px-4 py-2 text-center text-sm backdrop-blur"
            style={{
              borderColor: fight.note.correct ? 'rgba(0,255,157,0.45)' : 'rgba(255,45,85,0.45)',
              background: fight.note.correct ? 'rgba(4,26,18,0.92)' : 'rgba(26,4,12,0.92)',
              color: fight.note.correct ? '#a7f3d0' : '#fecdd3'
            }}
          >
            {fight.note.text}
          </div>
        </div>
      )}

      {showResults && (
        <ResultsScreen
          xpEarned={earned}
          xpTotal={game.xp}
          badges={resultBadges}
          nextMission={MISSIONS[1]}
          onContinue={leaveMission}
        />
      )}

      <FxLayer />
    </div>
  );
}