import type { Metadata } from "next";
import { AppIntroAnimation } from "@/components/fitness/intro/app-intro-animation";

export const metadata: Metadata = {
  title: "GrindLog Intro | 3D Motion Graphics Experience",
  description:
    "A 3D motion graphics app intro animation featuring a glowing neon lime-green and white barbell slam, sliding weight plates, metallic letter G formation, and sleek light sweep on dark brushed metal.",
};

export default function IntroPage() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-[#060907]">
      <AppIntroAnimation />
    </main>
  );
}
