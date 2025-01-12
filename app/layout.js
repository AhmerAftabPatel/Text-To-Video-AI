import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider";
import {Outfit, Slackey} from 'next/font/google'
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Cliply AI",
  description: "Create your story",
};

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env.local file')
}

const outfit = Outfit({subsets:['latin']})
const slackey = Slackey({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-slackey',
});

export default function RootLayout({ children }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
      <html lang="en" className={`${slackey.variable}`}>
        <body className={`${slackey.className} font-slackey`}>
          <Provider>
            {children}
          </Provider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
