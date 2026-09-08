import clsx from "clsx";

type Variant = "earth" | "soil" | "red" | "carbon" | "stone" | "green";

const variants: Record<Variant, string> = {
  earth:  "bg-[#fffbeb] text-[#92400e]",
  soil:   "bg-[#f5f5f4] text-[#78716c]",
  red:    "bg-[#fef2f2] text-[#b91c1c]",
  carbon: "bg-[#eff6ff] text-[#1d4ed8]",
  stone:  "bg-[#f5f5f4] text-[#78716c]",
  green:  "bg-[#f0fdf4] text-[#15803d]",
};

export default function Badge({
  label,
  variant = "stone",
}: {
  label: string;
  variant?: Variant;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium",
        variants[variant]
      )}
    >
      {label}
    </span>
  );
}
