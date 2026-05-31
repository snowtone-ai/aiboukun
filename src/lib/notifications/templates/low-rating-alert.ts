export function lowRatingAlertTemplate(input: { storeName: string; rating: number; reviewText?: string }) {
  return {
    subject: `【アイボウくん】${input.storeName}に低評価口コミが届きました`,
    text: [
      `${input.storeName}に星${input.rating}の口コミが届きました。`,
      input.reviewText ? `内容: ${input.reviewText}` : undefined,
      "返信前に内容を確認し、必要なら店舗責任者へ共有してください。",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}
