import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CityBackground } from "@/components/CityBackground";
import { WelcomeGate } from "@/components/WelcomeGate";
import { LawsDeck } from "@/components/LawsDeck";

const title = "دستور مدينة إنفينيتي | قوانين سيرفر Infinite Roleplay";
const description =
  "قوانين سيرفر إنفينيتي للرول بلاي في FiveM: القوانين العامة، الإجرام، التنظيمية، التفاوض، العقوبات، المناطق الآمنة، والمتجر."

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [entered, setEntered] = useState(false);

  return (
    <main dir="rtl" className="relative h-screen overflow-hidden">
      <CityBackground intensity={entered ? 0.55 : 1.15} />
      {entered ? <LawsDeck /> : <WelcomeGate onEnter={() => setEntered(true)} />}
    </main>
  );
}
