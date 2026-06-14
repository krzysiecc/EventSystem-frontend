import { Zap } from "lucide-react";

/**
 * @description Mały znak marki (logo + wordmark) nad kartami ekranów Auth.
 */
const AuthBrand = () => (
  <div className="mb-6 flex items-center justify-center gap-2">
    <div className="grid h-9 w-9 place-items-center rounded bg-accent-primary text-text-on-accent">
      <Zap size={18} />
    </div>
    <span className="text-lg font-extrabold tracking-tight text-text-primary">
      EventHub
    </span>
  </div>
);

export default AuthBrand;
