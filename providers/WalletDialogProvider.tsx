"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { SolanaWalletSelector } from "@/components/solana-wallet-selector";

interface WalletDialogContextValue {
  isOpen: boolean;
  openWalletDialog: (onConnect?: () => void) => void;
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
  const onConnectRef = useRef<(() => void) | undefined>(undefined);

  const openWalletDialog = useCallback((onConnect?: () => void) => {
    onConnectRef.current = onConnect;
    setIsOpen(true);
  }, []);

  const closeWalletDialog = useCallback(() => {
    onConnectRef.current = undefined;
    setIsOpen(false);
  }, []);

  const handleConnect = useCallback(() => {
    onConnectRef.current?.();
    onConnectRef.current = undefined;
  }, []);

  return (
    <WalletDialogContext.Provider
      value={{ isOpen, openWalletDialog, closeWalletDialog }}
    >
      {children}
      <div className="hidden">
        <SolanaWalletSelector
          open={isOpen}
          onOpenChange={setIsOpen}
          onConnect={handleConnect}
        />
      </div>
    </WalletDialogContext.Provider>
  );
}
