import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  InputField,
} from "@senler/ui";

interface InvitationSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  channelExternalId?: string;
}

function getCommunityUrl(channelExternalId?: string) {
  const id = channelExternalId?.trim().replace(/^-/, "");
  return id ? `https://vk.com/club${id}` : "";
}

export function InvitationSuccessDialog({
  open,
  onClose,
  channelExternalId,
}: InvitationSuccessDialogProps) {
  const communityUrl = getCommunityUrl(channelExternalId);
  const [copyError, setCopyError] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setCopyError("");
      setIsCopied(false);
    }
  }, [open]);

  const handleCopyLink = async () => {
    if (!communityUrl) return;

    setCopyError("");
    setIsCopied(false);

    try {
      await navigator.clipboard.writeText(communityUrl);
      setIsCopied(true);
    } catch {
      setCopyError(
        "Не удалось скопировать ссылку. Скопируйте её вручную из поля выше."
      );
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Успешно приглашён</AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Отправьте ссылку вашему амбассадору на вступление, если он ещё не
            зарегистрирован.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Ссылка на сообщество</p>
          <InputField
            value={communityUrl || "Не удалось получить ссылку на сообщество"}
            readOnly
            aria-label="Ссылка на сообщество"
          />
          {communityUrl ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => void handleCopyLink()}
            >
              {isCopied ? "Скопировано" : "Скопировать ссылку"}
            </Button>
          ) : null}
          {copyError ? (
            <p className="text-sm text-destructive">{copyError}</p>
          ) : null}
        </div>

        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>Понятно</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
