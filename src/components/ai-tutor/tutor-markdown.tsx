import ReactMarkdown from "react-markdown";

const proseClasses =
  "max-w-none space-y-2 text-sm leading-relaxed [&_a]:underline [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc [&_p]:leading-relaxed [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground";

export function TutorMarkdown({ children }: { children: string }) {
  return (
    <div className={proseClasses}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}

export function TutorSourceList({
  sources,
}: {
  sources: { id: number; source_title: string; ref_label: string }[];
}) {
  if (sources.length === 0) return null;
  return (
    <details className="text-muted-foreground mt-3 text-xs">
      <summary className="cursor-pointer select-none">
        查閱過的文獻（{sources.length}）
      </summary>
      <ul className="mt-1 list-disc space-y-0.5 pl-5">
        {sources.map((s) => (
          <li key={s.id}>
            {s.source_title} · {s.ref_label}
          </li>
        ))}
      </ul>
    </details>
  );
}
