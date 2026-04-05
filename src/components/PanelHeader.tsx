interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  rightLabel?: string;
}

export default function PanelHeader({ title, subtitle, rightLabel }: PanelHeaderProps) {
  return (
    <div
      className="flex items-center justify-between h-[20px] shrink-0"
      style={{
        background: "#0d0800",
        borderBottom: "1px solid #1a1000",
        borderLeft: "3px solid #ffa028",
        paddingLeft: "8px",
        paddingRight: "8px",
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold tracking-wider" style={{ color: "#ffb84d" }}>
          {title}
        </span>
        {subtitle && (
          <span className="text-[10px]" style={{ color: "#7a6030" }}>
            {subtitle}
          </span>
        )}
      </div>
      {rightLabel && (
        <span className="text-[9px]" style={{ color: "#7a6030" }}>
          {rightLabel}
        </span>
      )}
    </div>
  );
}
