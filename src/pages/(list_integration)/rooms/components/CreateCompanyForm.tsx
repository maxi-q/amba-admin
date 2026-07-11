import { ArrowLeft, Megaphone } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  InputField,
} from "@senler/ui";
import { useCompanyAvatarDraft } from "@/hooks/rooms/useCompanyAvatarDraft";
import { CompanyAvatarPicker } from "./CompanyAvatarPicker";

const getFirstFieldError = (fieldErrors: Record<string, string[]>, fieldName: string) =>
  fieldErrors[fieldName]?.[0] || "";
const hasFieldError = (fieldErrors: Record<string, string[]>, fieldName: string) =>
  Boolean(fieldErrors[fieldName]?.length);

interface CreateCompanyFormProps {
  isFirst: boolean;
  name: string;
  fieldErrors: Record<string, string[]>;
  generalError: string;
  isPending: boolean;
  onNameChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function CreateCompanyForm({
  isFirst,
  name,
  fieldErrors,
  generalError,
  isPending,
  onNameChange,
  onBack,
  onSubmit,
}: CreateCompanyFormProps) {
  const { draft, error: avatarError, setFile } = useCompanyAvatarDraft();

  const title = isFirst
    ? "Создайте свою первую компанию"
    : "Создайте компанию";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div className="flex w-full max-w-xl flex-col items-center">
        <div
          className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm"
          aria-hidden
        >
          <Megaphone className="size-7" />
        </div>

        <h1 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground sm:text-base">
          Укажите информацию о компании
        </p>

        <Card className="mt-8 w-full">
          <CardContent className="space-y-6 p-4 sm:p-6">
            {generalError ? (
              <Alert variant="destructive">
                <AlertDescription>{generalError}</AlertDescription>
              </Alert>
            ) : null}

            <CompanyAvatarPicker
              draft={draft}
              error={avatarError}
              disabled={isPending}
              onFileSelect={setFile}
            />

            <InputField
              label="Название *"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Введите название компании"
              error={hasFieldError(fieldErrors, "name")}
              helperText={getFirstFieldError(fieldErrors, "name") ?? undefined}
              disabled={isPending}
            />
          </CardContent>
        </Card>

        <div className="mt-6 flex w-full items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onBack}
            disabled={isPending}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Назад
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={onSubmit}
            disabled={!name.trim() || isPending}
          >
            {isPending ? "Создание…" : "Завершить"}
          </Button>
        </div>
      </div>
    </div>
  );
}
