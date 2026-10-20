import React from 'react';
import DistrictBase from '@/components/game3d/DistrictBase';
import DistrictStructures from '@/components/game3d/DistrictStructures';
import MissionGate from '@/components/game3d/MissionGate';
import NpcActor from '@/components/game3d/NpcActor';
import DataShard from '@/components/game3d/DataShard';
import { MISSIONS, GATE_SLOTS, gateState } from '@/game/constants';
import { NPCS } from '@/game/content';
import { registerInteractable } from '@/game/world';

const SHARDS = [
  { id: 's1', position: [-8, 0, 8] },
  { id: 's2', position: [10, 0, -4] },
  { id: 's3', position: [-14, 0, -2] },
  { id: 's4', position: [5, 0, 20] },
  { id: 's5', position: [-20, 0, 4] },
  { id: 's6', position: [-12, 1.8, -12] },
  { id: 's7', position: [13, 2.4, -13] },
  { id: 's8', position: [6, 1.6, -21] },
  { id: 's9', position: [-18, 2.2, -14] },
  { id: 's10', position: [16, 1.4, 4] }
];

export default function CityDistrict({ quality, progress }) {
  return (
    <group>
      <DistrictBase quality={quality} />
      <DistrictStructures />

      {MISSIONS.map((mission, i) => (
        <MissionGate
          key={mission.id}
          mission={mission}
          state={gateState(mission, progress)}
          slot={GATE_SLOTS[i]}
          register={registerInteractable}
        />
      ))}

      {NPCS.map((npc) => (
        <NpcActor
          key={npc.id}
          npc={npc}
          register={registerInteractable}
          met={(progress.met_npcs || []).includes(npc.id)}
        />
      ))}

      {SHARDS.map((shard) => (
        <DataShard
          key={shard.id}
          id={shard.id}
          position={shard.position}
          register={registerInteractable}
          collected={(progress.shards || []).includes(shard.id)}
        />
      ))}
    </group>
  );
}