import { ogChain } from "./wagmi";

export const EIP712_DOMAIN = {
  name: "0G Sign",
  version: "1",
  chainId: ogChain.id,
} as const;

export const EIP712_TYPES = {
  Document: [
    { name: "rootHash", type: "bytes32" },
    { name: "signer", type: "address" },
    { name: "timestamp", type: "uint256" },
  ],
} as const;

export function buildDocMessage(rootHash: string, signer: string) {
  return {
    rootHash: rootHash as `0x${string}`,
    signer: signer as `0x${string}`,
    timestamp: BigInt(Math.floor(Date.now() / 1000)),
  };
}

export function getTypedData(rootHash: string, signer: string) {
  return {
    domain: EIP712_DOMAIN,
    types: EIP712_TYPES,
    primaryType: "Document" as const,
    message: buildDocMessage(rootHash, signer),
  };
}

export function getTypedDataForVerify(
  rootHash: string,
  signer: string,
  timestamp: number,
) {
  return {
    domain: EIP712_DOMAIN,
    types: EIP712_TYPES,
    primaryType: "Document" as const,
    message: {
      rootHash: rootHash as `0x${string}`,
      signer: signer as `0x${string}`,
      timestamp: BigInt(timestamp),
    },
  };
}
