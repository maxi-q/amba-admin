import { Link } from "react-router-dom";
import { PageLoader, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@senler/ui";
import { useOrdContractTemplatesControllerGetTemplates } from "@/api/generated/ord-contract-templates/ord-contract-templates";
import { ordContractTypeLabel } from "../ord.utils";

interface OrdContractTemplateSelectProps {
  roomId: string;
  roomSlug?: string;
  value: string;
  onChange: (templateId: string) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

export function OrdContractTemplateSelect({
  roomId,
  roomSlug,
  value,
  onChange,
  disabled = false,
  error,
  required = false,
}: OrdContractTemplateSelectProps) {
  const templatesQuery = useOrdContractTemplatesControllerGetTemplates(
    roomId,
    { page: 1, size: 100 },
    { query: { enabled: !!roomId } }
  );

  const templates = templatesQuery.data?.items ?? [];
  const label = required ? "Шаблон ОРД-договора *" : "Шаблон ОРД-договора";

  if (templatesQuery.isLoading) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <div className="flex justify-center py-4">
          <PageLoader label="Загрузка шаблонов…" />
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="space-y-2 rounded-md border border-border bg-muted/20 p-3">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">
          Сначала создайте шаблон ОРД-договора в разделе ОРД.
        </p>
        {roomSlug ? (
          <Link
            to={`/rooms/${roomSlug}/ord/templates`}
            className="inline-flex text-sm font-medium text-primary underline underline-offset-2"
          >
            Перейти к шаблонам
          </Link>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger aria-label={label}>
          <SelectValue placeholder="Выберите шаблон договора" />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {template.name} ({ordContractTypeLabel(template.type)})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
