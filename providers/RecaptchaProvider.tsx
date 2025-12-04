"use client";

import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from "@/lib/constants";
import { createContext, useContext } from "react";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";

// Custom context for safe reCAPTCHA access
interface RecaptchaContextValue {
  executeRecaptcha: ((action: string) => Promise<string>) | undefined;
}

const RecaptchaContext = createContext<RecaptchaContextValue>({
  executeRecaptcha: undefined,
});

export function useRecaptcha() {
  return useContext(RecaptchaContext);
}

interface RecaptchaProviderProps {
  children: React.ReactNode;
}

// Inner component that uses the Google reCAPTCHA hook
function RecaptchaInner({ children }: { children: React.ReactNode }) {
  const { executeRecaptcha } = useGoogleReCaptcha();

  return (
    <RecaptchaContext.Provider value={{ executeRecaptcha }}>
      {children}
    </RecaptchaContext.Provider>
  );
}

export function RecaptchaProvider({ children }: RecaptchaProviderProps) {
  const siteKey = NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // If no site key is configured, provide context with undefined executeRecaptcha
  if (!siteKey) {
    return (
      <RecaptchaContext.Provider value={{ executeRecaptcha: undefined }}>
        {children}
      </RecaptchaContext.Provider>
    );
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}
    >
      <RecaptchaInner>{children}</RecaptchaInner>
    </GoogleReCaptchaProvider>
  );
}
