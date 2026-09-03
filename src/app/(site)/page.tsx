import { Hero } from "@/components/Hero";
import { ProtocolStrip } from "@/components/ProtocolStrip";
import { TokenSection } from "@/components/sections/Token";
import { GravityFlow } from "@/components/sections/GravityFlow";
import { ProofOfGravity } from "@/components/sections/ProofOfGravity";
import { SupportedAssets } from "@/components/sections/SupportedAssets";
import { GravityRouter } from "@/components/sections/GravityRouter";
import { Liquidity } from "@/components/sections/Liquidity";
import { Integrators } from "@/components/sections/Integrators";
import { Security } from "@/components/sections/Security";
import { Closing } from "@/components/sections/Closing";

export default function Home() {
  return (
    <main className="overflow-x-clip">
      <Hero />
      <ProtocolStrip />
      <TokenSection />
      <GravityFlow />
      <ProofOfGravity />
      <SupportedAssets />
      <GravityRouter />
      <Liquidity />
      <Integrators />
      <Security />
      <Closing />
    </main>
  );
}
