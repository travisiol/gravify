import { Block, Code, H2, P, Ul } from "@/components/docs/Prose";
import { chains } from "@/lib/chain";
import { site } from "@/lib/site";

const architecture = `src/config        env · chains · assets · contracts · brand   (single source of configuration)
src/lib/chain     viem public clients (browser → /api/rpc/<chain> relay)
src/lib/reserves  Proof of Gravity engine (pinned-block reads on both chains)
src/lib/bridge    BridgeAdapter interface + adapters/native · adapters/layerzero
src/lib/swap      SwapAdapter interface + adapters/uniswapV2
src/lib/liquidity factory/pair enumeration
src/lib/history   HistoryAdapter: rpc-logs (default) · indexer (when configured)
src/lib/router    Gravity Router: bridge leg + swap leg composition
src/hooks         TanStack Query + wagmi hooks; no transaction logic in components
contracts/        Foundry workspace: GravVault · GravToken · GravBridge · IGravMessenger`;

const bridgeFlow = `wrap    user → approve(vault) → bridge.bridgeOut{value: fee}(USDC, amount, recipient)
        vault.depositFrom(user, amount) → totalLocked += received
        messenger.send(dstEid, abi.encode(nonce, gUSDC, recipient, received))
        … remote messenger → bridge.receiveMessage(srcEid, payload)
        gUSDC.mintFromBridge(recipient, received)

unwrap  user → bridge.bridgeOut{value: fee}(gUSDC, amount, recipient)   // burns caller's gUSDC
        … → vault.withdrawTo(recipient, amount)   // subject to the rolling withdraw limit`;

const reserveMath = `source       token.balanceOf(vault)   vault.totalLocked()   token.decimals()
destination  gToken.totalSupply()     gToken.decimals()

backingBps = balanceOf(vault) · 10_000 / totalSupply     (decimals aligned)
≥ 100.00%  FULLY BACKED · 99–100%  WATCH · < 99%  UNDERCOLLATERALIZED
unreadable → UNVERIFIED · unconfigured → AWAITING DEPLOYMENT`;

export default function DocsPage() {
  return (
    <article>
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
        {site.wordmark} · Finance documentation
      </div>
      <h1 className="mt-3 text-4xl font-bold uppercase leading-none tracking-tightest text-ink md:text-6xl">
        Capital has gravity.
      </h1>
      <P>
        {site.name} pulls fragmented capital into {chains.robinhood.name}. An asset is
        locked in a single-purpose vault on {chains.ethereum.name}, a message is delivered
        by a configured messenger, and a {site.name} representation (gToken) is minted 1:1
        on {chains.robinhood.name}. The reverse path burns the gToken and unlocks the
        collateral. Proof of Gravity compares the two sides on-chain, continuously.
      </P>

      <H2 id="overview">What the interface promises</H2>
      <Ul>
        <li>
          Every number is read from a contract or an RPC. There is no seeded TVL, no sample
          transaction, no placeholder address.
        </li>
        <li>
          A feature whose configuration is missing is disabled and labelled NOT CONFIGURED
          / NOT DEPLOYED.
        </li>
        <li>
          A reserve that cannot be read is UNVERIFIED, never &ldquo;100% backed&rdquo;.
        </li>
        <li>
          Bridge stages derive from receipts, events and contract views — not timers.
        </li>
      </Ul>

      <H2 id="architecture">Architecture</H2>
      <Block>{architecture}</Block>

      <H2 id="bridge">Bridge</H2>
      <P>
        <Code>GravBridge</Code> is deployed once per chain. On the source chain each route
        points at a <Code>GravVault</Code>; on {chains.robinhood.name} each route points at
        a <Code>GravToken</Code>. The bridge does not implement a messaging protocol: it
        calls <Code>IGravMessenger.send</Code> and accepts <Code>receiveMessage</Code> only
        from the messenger it was configured with. A LayerZero OApp, a native rollup
        messenger or a test double can sit behind that interface.
      </P>
      <Block>{bridgeFlow}</Block>
      <P>
        Frontend adapters live in <Code>src/lib/bridge/adapters</Code>. The native adapter
        quotes the messaging fee from the bridge contract, prepares the write for the
        wallet (it never signs), and tracks completion via <Code>processed(nonce)</Code>{" "}
        and the <Code>BridgeCompleted</Code> event on the far chain. The LayerZero adapter
        reports NOT CONFIGURED: no LayerZero endpoint is deployed on{" "}
        {chains.robinhood.name} (checked on-chain), so the live transport is{" "}
        <Code>GravRelayMessenger</Code> — an operator-signed relayer. The Bridge page says
        so on every pending message, and an account with RELAYER_ROLE can deliver from the
        page or with <Code>npm run relayer</Code>. Deploy everything from{" "}
        <Code>/app/deploy</Code> with your own wallet.
      </P>

      <H2 id="reserves">Proof of Gravity</H2>
      <P>For each asset, at a pinned block per chain:</P>
      <Block>{reserveMath}</Block>
      <P>
        The inspector shows every raw read with its contract, method, value and block, with
        copy and explorer actions. The classification lives in{" "}
        <Code>src/lib/reserves/engine.ts</Code> and is never stored.
      </P>

      <H2 id="swap">Swap &amp; liquidity</H2>
      <P>
        Swaps run through a router exposing the Uniswap V2 interface on{" "}
        {chains.robinhood.name}. Route discovery tries the direct pair, then a two-hop route
        through WETH. Quotes come from <Code>getAmountsOut</Code>; price impact is derived
        from pair reserves along the route. Quotes older than 30 seconds are re-fetched
        before signing. The liquidity explorer enumerates the factory and quotes TVL in
        USDG; volume is omitted because it needs an indexer.
      </P>

      <H2 id="router">Gravity Router</H2>
      <P>
        The router composes the bridge leg and the swap leg into one plan with per-stage
        availability, fees and outputs. It is explicit that execution requires two
        signatures on two chains and is not atomic.
      </P>

      <H2 id="configuration">Configuration</H2>
      <P>
        <Code>NEXT_PUBLIC_APP_ENV</Code> selects the network pair: <Code>mainnet</Code> →{" "}
        {chains.ethereum.name} ({chains.ethereum.id}) → {chains.robinhood.name} (
        {chains.robinhood.id}); anything else → Sepolia (11155111) → Robinhood Chain
        Testnet (46630). All addresses come from <Code>.env</Code>; see{" "}
        <Code>.env.example</Code>. The full activation sequence is in the README.
      </P>

      <H2 id="security">Security</H2>
      <Ul>
        <li>
          Roles: DEFAULT_ADMIN (routes, messenger, limits), PAUSER (pause/unpause),
          BRIDGE_ROLE (vault deposit/withdraw, token mint/burn) — granted only to the bridge
          contract.
        </li>
        <li>
          No public mint; no <Code>tx.origin</Code>; SafeERC20; ReentrancyGuard on every
          fund-moving path; Pausable everywhere.
        </li>
        <li>
          Vault accounting uses the amount actually received, so fee-on-transfer tokens
          cannot inflate supply.
        </li>
        <li>
          Replay protection by nonce on the receiving bridge; wrong-source and
          unauthorized-messenger reverts.
        </li>
        <li>
          Invariant tests: wrapped supply ≤ locked collateral; exact accounting including
          in-flight messages; vault holds what it reports.
        </li>
        <li>Contracts are experimental until independently audited.</li>
      </Ul>
    </article>
  );
}
