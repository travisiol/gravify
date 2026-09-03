/**
 * The human-readable ABIs the interface actually calls. Handed out from the
 * contract registry so an integrator can paste them straight into viem.
 */
export const abis: Record<string, string[]> = {
  GravVault: [
    "function asset() view returns (address)",
    "function totalLocked() view returns (uint256)",
    "function depositFrom(address from, uint256 amount) returns (uint256 received)",
    "function withdrawTo(address to, uint256 amount)",
    "function withdrawWindowRemaining() view returns (uint256)",
    "function pause()",
    "function unpause()",
    "event Deposited(address indexed from, uint256 amount, uint256 received)",
    "event Withdrawn(address indexed to, uint256 amount)",
  ],
  GravToken: [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function mintFromBridge(address to, uint256 amount)",
    "function burnFromBridge(address from, uint256 amount)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
  ],
  GravBridge: [
    "function messenger() view returns (address)",
    "function remoteEid() view returns (uint32)",
    "function routeOf(address token) view returns (address peer, address handler, uint8 kind)",
    "function processed(uint64 nonce) view returns (bool)",
    "function quoteFee(address token, uint256 amount, address recipient) view returns (uint256)",
    "function bridgeOut(address token, uint256 amount, address recipient) payable",
    "function receiveMessage(uint32 srcEid, bytes payload)",
    "function setRoute(address token, address peer, address handler, uint8 kind)",
    "event BridgeStarted(bytes32 indexed guid, address indexed token, uint256 amount, address recipient)",
    "event BridgeCompleted(bytes32 indexed guid, address indexed token, uint256 amount, address recipient)",
  ],
  GravRelayMessenger: [
    "function localEid() view returns (uint32)",
    "function bridge() view returns (address)",
    "function quote(uint32 dstEid, bytes payload) view returns (uint256)",
    "function send(uint32 dstEid, bytes payload) payable returns (bytes32 guid)",
    "function deliver(uint32 srcEid, bytes payload)",
    "function setBridge(address bridge)",
    "function grantRole(bytes32 role, address account)",
    "event MessageSent(bytes32 indexed guid, uint32 indexed dstEid, uint64 indexed nonce, bytes payload)",
    "event MessageDelivered(bytes32 indexed guid, uint32 indexed srcEid, address relayer)",
  ],
  Router: [
    "function factory() view returns (address)",
    "function WETH() view returns (address)",
    "function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)",
    "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[] amounts)",
  ],
};

/** Maps a registry row's name onto the ABI it exposes. */
export function abiFor(name: string) {
  if (name.startsWith("GravVault")) return abis.GravVault;
  if (name.startsWith("GravToken")) return abis.GravToken;
  if (name.startsWith("GravBridge")) return abis.GravBridge;
  if (name.startsWith("GravRelayMessenger")) return abis.GravRelayMessenger;
  return abis.Router;
}
