/**
 * @description Dekoracyjna, animowana geometria tła ekranów logowania
 * (obracające się pierścienie + pływające kształty). Czyste CSS, ukryta na
 * małych ekranach, wyłączana przez prefers-reduced-motion (klasy animacji).
 */
const AuthGeometry = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute right-[-60px] top-1/2 -z-10 hidden h-[min(46vw,560px)] w-[min(46vw,560px)] -translate-y-1/2 sm:block"
  >
    <span className="animate-geo-spin absolute inset-0 rounded-full border border-border-light" />
    <span className="animate-geo-spin-rev absolute inset-[18%] rounded-full border border-accent-primary/40" />
    <span className="animate-geo-float absolute right-[8%] top-[14%] h-[30%] w-[30%] bg-signal" />
    <span className="animate-geo-float absolute bottom-[10%] left-[6%] h-[24%] w-[24%] rounded-full bg-accent-primary" />
  </div>
);

export default AuthGeometry;
