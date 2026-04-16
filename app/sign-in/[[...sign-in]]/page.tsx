import { SignIn } from "@clerk/nextjs";

import { AuthShell } from "@/components/auth/auth-shell";
import { dashboardUrl, signUpUrl } from "@/lib/routes";

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to access the NDIS workspace"
      description="Authenticate with Clerk to unlock the protected dashboard and Phase 1 routes."
      secondaryCtaLabel="Create an account"
      secondaryCtaHref={signUpUrl}
    >
      <SignIn forceRedirectUrl={dashboardUrl} signUpUrl={signUpUrl} />
    </AuthShell>
  );
}
