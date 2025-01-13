"use client";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Storylane Script */}
      <Script 
        src="https://js.storylane.io/js/v2/storylane.js" 
        strategy="lazyOnload"
      />

      {/* Hero Section */}
      <section className="pt-16 md:pt-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-1.5 mb-6 border rounded-full text-sm font-medium bg-muted">
            Made with ❤️ by &nbsp; <a href="https://github.com/ahmeraftab">Ahmer Aftab</a>
          </div>
          <Image 
            src="/cliply_logo_no_backgroubd.png" 
            width={200} 
            height={50} 
            alt="Cliply Logo"
          />
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Transform Your Text into 
            <span className="block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Engaging Videos
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Create professional-quality videos from your text in minutes. Powered by advanced AI to generate scenes, narration, and visuals automatically.
          </p>

          {/* Demo Video */}
          <div className="relative w-full max-w-4xl mx-auto mb-16">
            <div 
              className="relative w-full" 
              style={{
                paddingBottom: 'calc(53.72% + 25px)',
                height: 0,
                transform: 'scale(1)'
              }}
            >
              <iframe 
                loading="lazy" 
                className="sl-demo" 
                src="https://app.storylane.io/demo/iuy1ffpwpksf?embed=inline" 
                name="sl-embed" 
                allow="fullscreen" 
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: '1px solid rgba(63,95,172,0.35)',
                  boxShadow: '0px 0px 18px rgba(26, 19, 72, 0.15)',
                  borderRadius: '10px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8">
                Start Creating
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Watch Demo
              <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
            <div className="bg-card p-6 rounded-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Script Generation</h3>
              <p className="text-muted-foreground">Automatically convert your text into engaging video scripts optimized for viewer engagement.</p>
            </div>
            
            <div className="bg-card p-6 rounded-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional Voiceover</h3>
              <p className="text-muted-foreground">High-quality AI voice narration in multiple languages and styles.</p>
            </div>

            <div className="bg-card p-6 rounded-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Image/Video Generation</h3>
              <p className="text-muted-foreground">Create stunning visuals and scenes with state-of-the-art AI image generation.</p>
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
}
