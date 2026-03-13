import type { Metadata, Viewport } from "next";
import { DM_Sans, Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const frankRuhl = Frank_Ruhl_Libre({
  variable: "--font-frank-ruhl",
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Davar — Learn Hebrew",
  description:
    "Interactive Hebrew learning app with flashcards, spaced repetition, reading practice, and quizzes.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Davar — Learn Hebrew",
    description:
      "Master Hebrew with flashcards, grammar drills, stories, and spaced repetition.",
    type: "website",
    siteName: "Davar",
  },
  twitter: {
    card: "summary",
    title: "Davar — Learn Hebrew",
    description:
      "Master Hebrew with flashcards, grammar drills, stories, and spaced repetition.",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#e94560",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" data-theme="dark" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${frankRuhl.variable} antialiased`}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if("serviceWorker"in navigator){
                window.addEventListener("load",()=>{
                  navigator.serviceWorker.register("/sw.js").catch(()=>{});
                });
              }
              try{
                const t=localStorage.getItem("davar-theme");
                if(t==="light"||t==="dark"){
                  document.documentElement.setAttribute("data-theme",t);
                }
              }catch(e){}
            `,
          }}
        />
      </body>
    </html>
  );
}
