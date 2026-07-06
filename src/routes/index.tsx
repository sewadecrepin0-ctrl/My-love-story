import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Une petite question pour toi ❤️" },
      { name: "description", content: "Une histoire romantique interactive : mini-jeu, quiz et compatibilité." },
      { property: "og:title", content: "Une petite question pour toi ❤️" },
      { property: "og:description", content: "Une histoire romantique interactive rien que pour toi." },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/love/index.html");
  }, []);
  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "#1a0b2e", color: "#fff", fontFamily: "system-ui" }}>
      <p>Chargement… ❤️</p>
    </div>
  );
}
