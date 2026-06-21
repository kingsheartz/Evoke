import type { ElementType, ReactNode } from "react";
import { textFormatClassName, type TextFormat } from "@/lib/text-format";
import { cn } from "@/lib/utils";

export function FormattedText({
  text,
  format,
  as: Component = "span",
  className,
  children,
}: {
  text?: string;
  format?: TextFormat;
  as?: ElementType;
  className?: string;
  children?: ReactNode;
}) {
  const content = children ?? text;
  const normalized = typeof content === "string" ? content.trim() : content;
  if (!normalized) return null;

  if (typeof normalized === "string") {
    return (
      <Component className={cn(textFormatClassName(format, className))}>
        {normalized.split("\n").map((line, index, lines) => (
          <span key={index}>
            {line}
            {index < lines.length - 1 ? <br /> : null}
          </span>
        ))}
      </Component>
    );
  }

  return <Component className={cn(textFormatClassName(format, className))}>{normalized}</Component>;
}

export function FormattedHeading({
  text,
  format,
  className,
  level = 2,
}: {
  text?: string;
  format?: TextFormat;
  className?: string;
  level?: 1 | 2 | 3 | 4;
}) {
  const Tag = `h${level}` as ElementType;
  return <FormattedText text={text} format={format} as={Tag} className={className} />;
}

export function FormattedBody({
  text,
  format,
  className,
}: {
  text?: string;
  format?: TextFormat;
  className?: string;
}) {
  return (
    <FormattedText
      text={text}
      format={format}
      as="div"
      className={cn("space-y-3 leading-relaxed", className)}
    />
  );
}
