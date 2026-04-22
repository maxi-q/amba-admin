import { Copy } from "lucide-react";
import { Button, Card, CardContent, InputField } from "@senler/ui";

interface SubscriberGroupCardProps {
  title: string;
  name: string;
  senlerId: number;
  link: string;
  instructions: string[];
  onCopy: (link: string) => void;
}

export const SubscriberGroupCard = ({
  title,
  name,
  senlerId,
  link,
  instructions,
  onCopy,
}: SubscriberGroupCardProps) => {
  return (
    <Card className="border-border shadow-none">
      <CardContent className="space-y-4 p-4 pt-6">
        <h3 className="text-lg font-semibold leading-tight">{title}</h3>

        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-base font-bold">
            VK
          </div>
          <div className="min-w-0">
            <p className="font-medium leading-snug">{name}</p>
            <p className="text-xs text-muted-foreground">
              ID: {senlerId}{" "}
              <a
                href="#"
                className="text-primary underline underline-offset-2 hover:text-primary/90"
                onClick={(e) => e.preventDefault()}
              >
                перейти к редактированию
              </a>
            </p>
          </div>
        </div>

        <ol className="list-decimal space-y-1 pl-5 text-sm leading-relaxed text-foreground">
          {instructions.map((txt, idx) => (
            <li key={idx}>{txt}</li>
          ))}
        </ol>

        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <InputField
              readOnly
              value={link}
              aria-label="Ссылка"
              className="[&_input]:text-sm"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 shrink-0"
            title="Копировать"
            onClick={() => onCopy(link)}
          >
            <Copy className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
