"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import useProfile from "@/queries/useProfile";
import useSaveProfile from "@/mutations/useSaveProfile";
import { useRecaptcha } from "@/providers/RecaptchaProvider";
import { useWalletDialog } from "@/providers/WalletDialogProvider";

// Cookie persists for 30 days so user doesn't see dialog repeatedly across sessions
const COOKIE_NAME = "shelby_contest_dialog_dismissed";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

function setCookie(name: string, value: string, days: number = 30) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

export default function CommunicationMethodsDialog() {
  const { account, connected } = useWallet();
  const { openWalletDialog } = useWalletDialog();
  const [isOpen, setIsOpen] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editMarketingOptIn, setEditMarketingOptIn] = useState(false);
  const { executeRecaptcha } = useRecaptcha();

  const connectedAddress = account?.address?.toString();

  const { data: profile, isLoading: isProfileLoading } = useProfile({
    walletAddress: connectedAddress,
  });

  const { mutate: saveProfile, isPending: isSavingProfile } = useSaveProfile({
    onSuccess: () => {
      setIsOpen(false);
      toast.success("Communication methods saved successfully");
    },
    onError: () => {
      toast.error("Failed to save communication methods");
    },
  });

  // Show dialog on initial load (with delay)
  useEffect(() => {
    const hasDismissed = getCookie(COOKIE_NAME);
    if (hasDismissed) return;

    // Wait for profile to load if connected
    if (connected && isProfileLoading) return;

    // Don't show if user already has contact info
    if (connected && (profile?.email || profile?.x_handle)) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [connected, isProfileLoading, profile]);

  const handleSave = useCallback(async () => {
    if (!connectedAddress) return;

    let recaptchaToken: string | undefined;
    if (executeRecaptcha) {
      try {
        recaptchaToken = await executeRecaptcha("save_communication_methods");
      } catch (error) {
        console.error("reCAPTCHA error:", error);
        toast.error("Failed to verify you're not a bot. Please try again.");
        return;
      }
    }

    saveProfile({
      email: editEmail || null,
      marketingOptIn: editMarketingOptIn,
      recaptchaToken,
    });
  }, [
    connectedAddress,
    editEmail,
    editMarketingOptIn,
    executeRecaptcha,
    saveProfile,
  ]);

  const handleSkip = () => {
    setCookie(COOKIE_NAME, "true", 30);
    setIsOpen(false);
  };

  const handleConnectWallet = () => {
    openWalletDialog();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md max-h-[90vh] flex flex-col"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Lights. Camera. Serve.</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 overflow-y-auto flex-1">
          <p className="text-sm text-muted-foreground">
            Like videos in the feed for a chance to win Shelby merch and
            professional creator gear.
          </p>
          <p className="text-sm text-muted-foreground">
            Share your email so we can contact you if you win and to stay up to
            date on Shelby.
          </p>
          <div className="grid gap-2">
            <Label htmlFor="landing_email">Email</Label>
            <Input
              id="landing_email"
              type="email"
              placeholder="your@email.com"
              value={editEmail}
              onChange={(e) => {
                const newEmail = e.target.value;
                setEditEmail(newEmail);
                if (newEmail && !editMarketingOptIn) {
                  setEditMarketingOptIn(true);
                }
              }}
            />
          </div>
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id="landing_marketing"
              checked={editMarketingOptIn}
              onCheckedChange={(checked) =>
                setEditMarketingOptIn(checked === true)
              }
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="landing_marketing"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I AGREE TO RECEIVE UPDATES FROM SHELBY FOUNDATION AND UNDERSTAND
                I CAN UNSUBSCRIBE AT ANY TIME, AND I HAVE READ AND ACCEPT THE{" "}
                <a
                  href="https://shelby.xyz/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  PRIVACY POLICY
                </a>
                .
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleSkip}>
            Skip
          </Button>
          <Button
            onClick={connected ? handleSave : handleConnectWallet}
            disabled={
              isSavingProfile ||
              (connected && (!editMarketingOptIn || !editEmail))
            }
          >
            {isSavingProfile
              ? "Saving..."
              : connected
              ? "Save"
              : "Connect wallet to join"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
