interface FlaticonIconProps {
  src: string;
  label: string;
  className?: string;
}

/** Small decorative Flaticon asset; visible text remains the accessible meaning. */
export function FlaticonIcon({ src, label, className = "" }: FlaticonIconProps) {
  return (
    <img
      className={`flaticon-icon ${className}`.trim()}
      src={src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      onError={(event) => {
        event.currentTarget.hidden = true;
      }}
      title={label}
    />
  );
}
