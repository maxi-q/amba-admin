import type { Dispatch, SetStateAction } from "react";
import { InputField } from "@senler/ui";
import { applyRuPhoneChange } from "@/utils/ruPhone";
import { ORD_COPY } from "../ord.constants";

type Props = {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

const LABEL = "Телефон";

/**
 * Поле телефона РФ с маской +7 и корректным Backspace по символам форматирования.
 */
export function RuPhoneTextField({
  value,
  setValue,
  error,
  helperText,
  placeholder = ORD_COPY.phonePlaceholder,
  className,
  disabled,
}: Props) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">
        {LABEL}
        <span className="text-destructive" aria-hidden>
          {" "}
          *
        </span>
      </p>
      <InputField
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue((prev) => applyRuPhoneChange(prev, e.target.value))}
        error={error}
        helperText={helperText}
        className={className}
        disabled={disabled}
        aria-label={LABEL}
      />
    </div>
  );
}
