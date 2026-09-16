import { createContext } from "react";

export type OrdForeignDetails = {
  foreign: boolean;
  paymentNumber: string;
  country: string;
  address: string;
};

// Only the development entry supplies unsupported fields and the acts-lock scenario.
export const OrdProfilePreviewContext = createContext<{
  details: OrdForeignDetails;
  countries: string[];
  locked: boolean;
} | null>(null);
