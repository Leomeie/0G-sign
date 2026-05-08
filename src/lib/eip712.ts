import { ogMainnet, ogTestnet } from "./wagmi";

export const EIP712_TYPES = {
  Document: [
    { name: "rootHash", type: "bytes32" },
    { name: "signer", type: "address" },
    { name: "timestamp", type: "uint256" },
  ],
} as const;

/** Returns the EIP-712 domain for the given chain ID. */
export function getDomain(chainId: number) {
  return {
    name: "0G Sign",
    version: "1",
    chainId: chainId === ogTestnet.id ? ogTestnet.id : ogMainnet.id,
  } as const;
}

export function buildDocMessage(rootHash: string, signer: string) {
  return {
    rootHash: rootHash as `0x${string}`,
    signer: signer as `0x${string}`,
    timestamp: BigInt(Math.floor(Date.now() / 1000)),
  };
}

export function getTypedData(rootHash: string, signer: string, chainId: number) {
  return {
    domain: getDomain(chainId),
    types: EIP712_TYPES,
    primaryType: "Document" as const,
    message: buildDocMessage(rootHash, signer),
  };
}

export function getTypedDataForVerify(
  rootHash: string,
  signer: string,
  timestamp: number,
  chainId: number = ogMainnet.id,
) {
  return {
    domain: getDomain(chainId),
    types: EIP712_TYPES,
    primaryType: "Document" as const,
    message: {
      rootHash: rootHash as `0x${string}`,
      signer: signer as `0x${string}`,
      timestamp: BigInt(timestamp),
    },
  };
}
