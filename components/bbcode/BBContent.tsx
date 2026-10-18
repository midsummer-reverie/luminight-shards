import { renderBB } from "@/lib/bbcode";

export default function BBContent({ text }: { text: string }) {
  return <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: renderBB(text) }} />;
}