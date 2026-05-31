import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <Badge className="w-fit">AI 相棒</Badge>
          <CardTitle className="text-3xl text-primary">アイボウくん</CardTitle>
          <CardDescription>
            Googleマップ集客の営業・マーケティング担当AIエージェント
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>はじめる</Button>
        </CardContent>
      </Card>
    </main>
  )
}
