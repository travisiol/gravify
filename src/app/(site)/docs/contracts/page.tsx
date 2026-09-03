import { Code, H2, P } from "@/components/docs/Prose";
import { AbiCopyButton } from "@/components/docs/AbiCopyButton";
import { Badge } from "@/components/ui/Marks";
import { truncate } from "@/lib/format";
import { contractRegistry, registryConfigured, registryTotal } from "@/lib/contracts";
import { site } from "@/lib/site";

const columns = ["Contract", "Role", "Chain", "Address", "Explorer", "ABI"];

/** Every contract, configured or not. The gaps are the useful part. */
export default function ContractsPage() {
  return (
    <article>
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
        Developers · contract registry · mainnet
      </div>
      <h1 className="mt-3 text-4xl font-bold uppercase leading-none tracking-tightest text-ink md:text-5xl">
        Contracts &amp; ABIs
      </h1>
      <P>
        Exported from <Code>src/lib/contracts.ts</Code>. Only configured deployments carry
        an address; the rest are listed so the gap is visible. ABIs are copied as JSON.
      </P>

      <div className="mt-8 rounded-md border border-line bg-white p-5">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
          {registryConfigured} / {registryTotal} configured
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                {columns.map((c) => (
                  <th
                    key={c}
                    className="py-2 pr-4 font-mono text-[10px] font-normal uppercase tracking-[0.16em] text-ink-muted"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contractRegistry.map((entry, i) => (
                <tr key={`${entry.name}-${i}`} className="border-b border-line/70 last:border-0">
                  <td className="py-3 pr-4 align-middle">
                    <span className="font-semibold text-ink">{entry.name}</span>
                  </td>
                  <td className="py-3 pr-4 align-middle">
                    <span className="text-xs text-ink/70">{entry.role}</span>
                  </td>
                  <td className="py-3 pr-4 align-middle">{entry.chain}</td>
                  <td className="py-3 pr-4 align-middle">
                    {entry.address ? (
                      <span className="font-mono text-xs text-ink">
                        {truncate(entry.address, 6)}
                      </span>
                    ) : (
                      <Badge tone="off">Not deployed</Badge>
                    )}
                  </td>
                  <td className="py-3 pr-4 align-middle">
                    {entry.address ? (
                      <a
                        href={`${entry.explorer}/address/${entry.address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ink underline-offset-4 hover:underline"
                      >
                        Open
                      </a>
                    ) : (
                      <span className="text-ink-muted">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 align-middle">
                    <AbiCopyButton name={entry.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <H2 id="deploying">Deploying</H2>
      <P>
        Run the Foundry scripts in <Code>contracts/script/Deploy.s.sol</Code>, then paste
        the printed addresses into <Code>.env.local</Code>. The interface activates each
        component the moment its address is present and its on-chain readiness checks pass.
        The guided path is <Code>/app/deploy</Code>, which signs each step with your own
        wallet. {site.name} never holds a key.
      </P>
    </article>
  );
}
