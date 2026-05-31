export function googleErrorTemplate(input: { storeName?: string; message: string }) {
  return {
    subject: "【アイボウくん】Google連携で確認が必要です",
    text: [`対象: ${input.storeName ?? "組織全体"}`, input.message].join("\n"),
  };
}
