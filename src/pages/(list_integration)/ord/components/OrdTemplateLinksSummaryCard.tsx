import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@senler/ui";

interface OrdTemplateLinksSummaryCardProps {
  title: string;
  description: string;
  to: string;
  disabled?: boolean;
  disabledText?: string;
}

export function OrdTemplateLinksSummaryCard({
  title,
  description,
  to,
  disabled = false,
  disabledText,
}: OrdTemplateLinksSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {disabled ? (
          <p className="text-sm text-muted-foreground">
            {disabledText ?? "Управление ORD-шаблонами сейчас недоступно."}
          </p>
        ) : (
          <Link
            to={to}
            className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
          >
            Управлять ORD-шаблонами
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
