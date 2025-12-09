"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import useSignIn from "@/mutations/useSignIn";
import useUser from "@/queries/useUser";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import Loader from "@/components/ui/loader";

export default function AuthenticationDialog() {
  const { connected, account, wallet, disconnect } = useWallet();

  const { data: user, isLoading: isUserLoading } = useUser();
  const { mutateAsync: signIn, isPending: isSigningIn } = useSignIn({
    onSuccess: () => {
      toast.success("Successfully signed in!");
    },
    onError: (error) => {
      console.error("Sign in error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
    },
  });

  // Show sign-in dialog when connected but no session (mandatory sign-in)
  const isDialogOpen =
    !isUserLoading && connected && user?.isConnected && !user?.hasSession;

  return (
    <AlertDialog open={isDialogOpen}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold">
            Verify Your Wallet
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground pt-2">
            Sign a message to prove ownership of your wallet. This doesn&apos;t
            cost any gas and won&apos;t trigger a transaction.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center gap-3 py-4 px-3 bg-muted rounded-lg">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <KeyRound className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {account?.address?.toString().slice(0, 10)}...
              {account?.address?.toString().slice(-8)}
            </p>
            <p className="text-xs text-muted-foreground">
              Connected via {wallet?.name}
            </p>
          </div>
        </div>

        <AlertDialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={disconnect}
            disabled={isSigningIn}
            className="flex-1 sm:flex-none"
          >
            Disconnect
          </Button>
          <Button
            onClick={() => signIn()}
            disabled={isSigningIn}
            className="flex-1 sm:flex-none"
          >
            {isSigningIn ? (
              <>
                <Loader size="sm" className="-ml-1 mr-2" />
                Signing...
              </>
            ) : (
              "Sign Message"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
