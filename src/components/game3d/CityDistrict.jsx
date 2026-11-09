import React from 'react';
import DistrictBase from '@/components/game3d/DistrictBase';
import DistrictStructures from '@/components/game3d/DistrictStructures';
import MissionGate from '@/components/game3d/MissionGate';
import NpcActor from '@/components/game3d/NpcActor';
import DataShard from '@/components/game3d/DataShard';
import { MISSIONS, GATE_SLOTS, SHARD_SPOTS, gateState } from '@/game/constants';
import { NPCS } from '@/game/content';
import { registerInteractable } from '@/game/world';

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

      {SHARD_SPOTS.map((shard) => (
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