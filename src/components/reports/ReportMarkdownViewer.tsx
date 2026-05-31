import { cn } from "@/lib/utils";

export function ReportMarkdownViewer({ markdown }: { markdown: string }) {
  return (
    <article className="space-y-3 text-sm leading-7">
      {markdown.split("\n").map((line, index) => {
        if (line.startsWith("# ")) {
          return (
            <h1 key={index} className="text-2xl font-semibold">
              {line.slice(2)}
            </h1>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={index} className="pt-3 text-lg font-semibold">
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <p key={index} className="pl-4 text-muted-foreground">
              ・{line.slice(2)}
            </p>
          );
        }
        if (/^\d+\.\s/.test(line)) {
          return (
            <p key={index} className="pl-4 font-medium">
              {line}
            </p>
          );
        }
        return (
          <p key={index} className={cn(!line && "h-2", "whitespace-pre-wrap")}>
            {line}
          </p>
        );
      })}
    </article>
  );
}
