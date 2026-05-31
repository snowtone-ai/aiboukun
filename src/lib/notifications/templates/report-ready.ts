export function reportReadyTemplate(input: { title: string; url?: string }) {
  return {
    subject: `【アイボウくん】レポート「${input.title}」が完成しました`,
    text: [`レポートが完成しました。`, input.url ? `確認URL: ${input.url}` : undefined].filter(Boolean).join("\n"),
  };
}
