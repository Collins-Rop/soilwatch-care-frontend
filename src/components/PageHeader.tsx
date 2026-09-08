interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b px-6 py-4" style={{ borderColor: "#e7e5e4" }}>
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "#1c1917" }}>{title}</h1>
        {description && <p className="text-sm mt-1" style={{ color: "#78716c" }}>{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
