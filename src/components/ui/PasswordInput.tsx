import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * @description Pole hasła z przyciskiem podglądu (oko). Współpracuje zarówno z
 * react-hook-form (przekazywany `ref` + `{...register()}`), jak i z polami
 * kontrolowanymi (`value`/`onChange`). Dodaje miejsce po prawej na ikonę.
 */
const PasswordInput = forwardRef<HTMLInputElement, Props>(
  ({ className = "", ...props }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <div className="relative">
        <input
          {...props}
          ref={ref}
          type={show ? "text" : "password"}
          className={`${className} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Ukryj hasło" : "Pokaż hasło"}
          title={show ? "Ukryj hasło" : "Pokaż hasło"}
          tabIndex={-1}
          className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded text-text-muted transition hover:text-text-primary"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
