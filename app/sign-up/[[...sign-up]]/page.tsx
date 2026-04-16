import { SignUp } from "@clerk/nextjs";

import { AuthShell } from "@/components/auth/auth-shell";
import { dashboardUrl, signInUrl } from "@/lib/routes";

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="Create access"
      title="Set up your account for the NDIS dashboard"
      description="Sign up with Clerk and continue directly into the protected dashboard shell."
      secondaryCtaLabel="Already have an account?"
      secondaryCtaHref={signInUrl}
    >
      <SignUp forceRedirectUrl={dashboardUrl} signInUrl={signInUrl} />
    </AuthShell>
  );
}
