import Image from "next/image";
import bgImage from "../../../public/login-page.png";

export default function SignInLoading() {
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image 
          src={bgImage}
          alt="Background Landscape"
          fill
          className="object-cover object-center"
          priority
          quality={60}
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      
      <div className="flex min-h-dvh w-full flex-col items-center justify-center relative z-10 px-4 py-8 overflow-y-auto overflow-x-hidden">
        <div className="w-full max-w-sm rounded-[24px] border border-white/40 bg-white/10 p-8 backdrop-blur-md shadow-2xl relative z-10">
          
          {/* Header Skeleton */}
          <div className="h-10 w-24 bg-white/20 rounded-lg animate-pulse mb-3" />
          <div className="h-4 w-64 bg-white/20 rounded-md animate-pulse mb-8" />

          {/* Google Button Skeleton */}
          <div className="mb-6">
            <div className="h-12 w-full bg-white/20 rounded-xl animate-pulse" />
          </div>

          {/* OR Divider */}
          <div className="mb-6 flex items-center gap-4 opacity-50">
            <div className="h-px flex-1 bg-white/30" />
            <div className="h-4 w-4 bg-white/20 rounded-sm animate-pulse" />
            <div className="h-px flex-1 bg-white/30" />
          </div>

          {/* Form Skeleton */}
          <div className="flex flex-col gap-5">
            <div className="h-12 w-full bg-white/20 rounded-xl animate-pulse" />
            <div className="h-12 w-full bg-white/20 rounded-xl animate-pulse" />
            
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-white/20 rounded-md animate-pulse" />
              <div className="h-4 w-28 bg-white/20 rounded-md animate-pulse" />
            </div>

            <div className="h-12 w-full bg-[var(--color-accent-green)]/40 rounded-xl animate-pulse mt-2" />
            
            <div className="mx-auto h-4 w-48 bg-white/20 rounded-md animate-pulse mt-2" />
          </div>
        </div>
      </div>
    </>
  );
}
