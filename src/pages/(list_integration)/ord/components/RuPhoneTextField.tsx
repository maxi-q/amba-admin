import type { Dispatch, SetStateAction } from "react";
import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import { applyRuPhoneChange } from "@/utils/ruPhone";
import { ORD_COPY } from "../ord.constants";

type Props = {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
} & Omit<TextFieldProps, "value" | "onChange" | "defaultValue">;

/**
 * Поле телефона РФ с маской +7 и корректным Backspace по символам форматирования.
 */
export function RuPhoneTextField({ value, setValue, placeholder = ORD_COPY.phonePlaceholder, ...rest }: Props) {
  return (
    <TextField
      size="small"
      required
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue((prev) => applyRuPhoneChange(prev, e.target.value))}
      {...rest}
    />
  );
}
