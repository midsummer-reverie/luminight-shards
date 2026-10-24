// app/(game)/guilds/[id]/GuildThemeSync.tsx
export default function GuildThemeSync({ color }: { color: string }) {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        :root, body {
          --cy: ${color} !important;
        }
      `
    }} />
  );
}