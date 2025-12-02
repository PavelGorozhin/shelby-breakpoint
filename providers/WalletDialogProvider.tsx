"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { SolanaWalletSelector } from "@/components/solana-wallet-selector";

interface WalletDialogContextValue {
  isOpen: boolean;
  openWalletDialog: () => void;
  closeWalletDialog: () => void;
}

const WalletDialogContext = createContext<WalletDialogContextValue | null>(
  null
);

export function useWalletDialog() {
  const context = useContext(WalletDialogContext);
  if (!context) {
    throw new Error("useWalletDialog must be used within WalletDialogProvider");
  }
  return context;
}

interface WalletDialogProviderProps {
  children: ReactNode;
}

export function WalletDialogProvider({ children }: WalletDialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openWalletDialog = useCallback(() => setIsOpen(true), []);
  const closeWalletDialog = useCallback(() => setIsOpen(false), []);

  return (
    <WalletDialogContext.Provider
      value={{ isOpen, openWalletDialog, closeWalletDialog }}
    >
      {children}
      <div className="hidden">
        <SolanaWalletSelector open={isOpen} onOpenChange={setIsOpen} />
      </div>
    </WalletDialogContext.Provider>
  );
}
