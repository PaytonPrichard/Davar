import AppShell from "@/components/AppShell";
import { AuthProvider } from "@/components/AuthProvider";
import ConsentBanner from "@/components/ConsentBanner";

export default function Home() {
  return (
    <AuthProvider>
      <AppShell />
      <ConsentBanner />
    </AuthProvider>
  );
}
