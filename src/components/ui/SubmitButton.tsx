"use client";
// Assuming your TypeScript environment is configured properly

import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React from "react";
import { useFormStatus } from "react-dom";

// Define additional props for SubmitButton
interface SubmitButtonProps extends ButtonProps {
  // Add any additional props specific to SubmitButton
  loadingtext?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = (props) => {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-fit max-w-[150px] flex items-center "
      color="primary"
      disabled={pending}
      {...props} // Spread the additional props
    >
      {pending && <Loader2 className="animate-spin" />}
      {pending ? props.loadingtext : props.children || "submiting..."}
    </Button>
  );
};

export default SubmitButton;
