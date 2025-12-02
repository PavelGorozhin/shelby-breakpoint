"use client";

import {
  AdapterNotDetectedWallet,
  AdapterWallet,
  WalletItem,
  WalletSortingOptions,
  groupAndSortWallets,
  isInAppBrowser,
  isInstallRequired,
  isRedirectable,
  truncateAddress,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { ChevronDown, Copy, LogOut } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";

interface SolanaWalletSelectorProps extends WalletSortingOptions {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function SolanaWalletSelector({
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  children,
  ...walletSortingOptions
}: SolanaWalletSelectorProps = {}) {
  const { account, connected, disconnect } = useWallet();
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const isDialogOpen = externalOpen ?? internalOpen;
  const setIsDialogOpen = externalOnOpenChange ?? setInternalOpen;

  const closeDialog = useCallback(
    () => setIsDialogOpen(false),
    [setIsDialogOpen]
  );

  const copyAddress = async () => {
    if (!account?.address) return;
    try {
      await navigator.clipboard.writeText(account.address.toString());
      toast.success("Copied wallet address to clipboard.");
    } catch {
      toast.error("Failed to copy wallet address.");
    }
  };

  return connected ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          {account?.ansName ||
            truncateAddress(account?.address?.toString()) ||
            "Unknown"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={copyAddress} className="gap-2">
          <Copy className="h-4 w-4" /> Copy address
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={disconnect} className="gap-2">
          <LogOut className="h-4 w-4" /> Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {children || <Button>Connect a Wallet</Button>}
      </DialogTrigger>
      <ConnectWalletDialog close={closeDialog} {...walletSortingOptions} />
    </Dialog>
  );
}

interface ConnectWalletDialogProps extends WalletSortingOptions {
  close: () => void;
}

function ConnectWalletDialog({
  close,
  ...walletSortingOptions
}: ConnectWalletDialogProps) {
  const { wallets = [], notDetectedWallets = [] } = useWallet();

  const { availableWallets, installableWallets } = groupAndSortWallets(
    [...wallets, ...notDetectedWallets],
    walletSortingOptions
  );

  const { solanaWallets } = availableWallets.reduce<{
    solanaWallets: AdapterWallet[];
  }>(
    (acc, wallet) => {
      if (wallet.name.includes("Solana")) {
        acc.solanaWallets.push(wallet);
      }
      return acc;
    },
    { solanaWallets: [] }
  );

  const { solanaInstallableWallets } = installableWallets.reduce<{
    solanaInstallableWallets: AdapterNotDetectedWallet[];
  }>(
    (acc, wallet) => {
      if (wallet.name.includes("Solana")) {
        acc.solanaInstallableWallets.push(wallet);
      }
      return acc;
    },
    {
      solanaInstallableWallets: [],
    }
  );

  return (
    <DialogContent className="max-h-screen overflow-auto">
      <DialogHeader>
        <DialogTitle className="flex flex-col text-center leading-snug">
          Connect Wallet
        </DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-3 pt-3">
        {/* Desktop: Collapsible with ChevronDown, Available and installable wallets */}
        {!isInAppBrowser() &&
          solanaWallets.map((wallet) => (
            <WalletRow key={wallet.name} wallet={wallet} onConnect={close} />
          ))}
        {!isInAppBrowser() && !!solanaInstallableWallets.length && (
          <Collapsible className="hidden lg:flex flex-col gap-3 pt-3">
            <CollapsibleTrigger asChild>
              <Button size="sm" variant="ghost" className="gap-2">
                More wallets <ChevronDown />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-3">
              {solanaInstallableWallets.map((wallet) => (
                <WalletRow
                  key={wallet.name}
                  wallet={wallet}
                  onConnect={close}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
        {/* Mobile: Direct list without Collapsible, Only installable wallets */}
        {isRedirectable() && !!solanaInstallableWallets.length && (
          <div className="flex lg:hidden flex-col gap-3 pt-3">
            {solanaInstallableWallets.map((wallet) => (
              <WalletRow key={wallet.name} wallet={wallet} onConnect={close} />
            ))}
          </div>
        )}
        {/* In app browser: Direct list without Collapsible, Only available wallets */}
        {isInAppBrowser() && !!solanaWallets.length && (
          <div className="flex lg:hidden flex-col gap-3 pt-3">
            {solanaWallets.map((wallet) => (
              <WalletRow key={wallet.name} wallet={wallet} onConnect={close} />
            ))}
          </div>
        )}
      </div>
    </DialogContent>
  );
}

interface WalletRowProps {
  wallet: AdapterWallet | AdapterNotDetectedWallet;
  onConnect?: () => void;
}

function WalletRow({ wallet, onConnect = close }: WalletRowProps) {
  return (
    <WalletItem
      wallet={wallet}
      onConnect={onConnect}
      className="flex items-center justify-between px-4 py-3 gap-4 border rounded-md"
    >
      <div className="flex items-center gap-4">
        <WalletItem.Icon className="h-6 w-6" />
        <WalletItem.Name className="text-base font-normal" />
      </div>
      {isInstallRequired(wallet) ? (
        <Button size="sm" variant="ghost" asChild>
          <WalletItem.InstallLink />
        </Button>
      ) : (
        <WalletItem.ConnectButton asChild>
          <Button size="sm">Connect</Button>
        </WalletItem.ConnectButton>
      )}
    </WalletItem>
  );
}
