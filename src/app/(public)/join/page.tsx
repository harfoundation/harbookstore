import type { Metadata } from "next";
import { TeamApplicationForm } from "@/components/join/team-application-form";

export const metadata: Metadata = { title: "加入我們" };

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">加入我們</h1>
        <p className="text-muted-foreground mt-1">
          無論是成為志工、義工，或是受薪同工，我們都歡迎您一起參與山書坊的事工。
        </p>
      </div>
      <TeamApplicationForm />
    </div>
  );
}
