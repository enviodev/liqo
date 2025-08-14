import React from "react";
import {
  EthereumIcon,
  OptimismIcon,
  BaseIcon,
  ArbitrumIcon,
  ScrollIcon,
  GnosisIcon,
  AvalancheIcon,
  BscIcon,
  PolygonIcon,
} from "@/components/network-icons";

export interface NetworkIconProps {
  chainId: number;
  size?: number;
  variant?: "branded" | "mono";
  className?: string;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  networkName: string;
  color: string;
  explorerUrl: string;
  iconComponent: React.ComponentType<any>;
}

export const NETWORK_CONFIGS: Record<number, NetworkConfig> = {
  1: {
    chainId: 1,
    name: "Ethereum",
    networkName: "ethereum",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-foreground",
    explorerUrl: "https://etherscan.io",
    iconComponent: EthereumIcon,
  },
  10: {
    chainId: 10,
    name: "Optimism",
    networkName: "optimism",
    color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-foreground",
    explorerUrl: "https://optimistic.etherscan.io",
    iconComponent: OptimismIcon,
  },
  56: {
    chainId: 56,
    name: "BSC",
    networkName: "bsc",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-foreground",
    explorerUrl: "https://bscscan.com",
    iconComponent: BscIcon,
  },
  137: {
    chainId: 137,
    name: "Polygon",
    networkName: "polygon",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-foreground",
    explorerUrl: "https://polygonscan.com",
    iconComponent: PolygonIcon,
  },
  8453: {
    chainId: 8453,
    name: "Base",
    networkName: "base",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-foreground",
    explorerUrl: "https://basescan.org",
    iconComponent: BaseIcon,
  },
  42161: {
    chainId: 42161,
    name: "Arbitrum",
    networkName: "arbitrum",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-foreground",
    explorerUrl: "https://arbiscan.io",
    iconComponent: ArbitrumIcon,
  },
  534352: {
    chainId: 534352,
    name: "Scroll",
    networkName: "scroll",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-foreground",
    explorerUrl: "https://scrollscan.com",
    iconComponent: ScrollIcon,
  },
  43114: {
    chainId: 43114,
    name: "Avalanche",
    networkName: "avalanche",
    color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-foreground",
    explorerUrl: "https://snowtrace.io",
    iconComponent: AvalancheIcon,
  },
  100: {
    chainId: 100,
    name: "Gnosis",
    networkName: "gnosis",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-foreground",
    explorerUrl: "https://gnosisscan.io",
    iconComponent: GnosisIcon,
  },
};

const DEFAULT_NETWORK_COLOR =
  "bg-gray-100 text-gray-800 dark:bg-gray-900/60 dark:text-foreground";

export function getChainName(chainId: number): string {
  const config = NETWORK_CONFIGS[chainId];
  return config?.name || `Chain ${chainId}`;
}

export function getNetworkIcon({
  chainId,
  size = 20,
  variant = "branded",
  className = "",
}: NetworkIconProps): React.ReactElement | null {
  const config = NETWORK_CONFIGS[chainId];

  if (!config) {
    return null;
  }

  const iconProps = {
    size,
    variant,
    className: `shrink-0 ${className}`,
  };

  const IconComponent = config.iconComponent;
  return <IconComponent {...iconProps} />;
}

export function getChainColor(chainId: number): string {
  const config = NETWORK_CONFIGS[chainId];
  return config?.color || DEFAULT_NETWORK_COLOR;
}

export function getAddressUrl(chainId: number, address: string): string {
  const config = NETWORK_CONFIGS[chainId];
  return config ? `${config.explorerUrl}/address/${address}` : "#";
}

export function getTxUrl(chainId: number, txHash: string): string {
  const config = NETWORK_CONFIGS[chainId];
  return config ? `${config.explorerUrl}/tx/${txHash}` : "#";
}
