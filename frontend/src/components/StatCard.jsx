export default function StatCard({ label, value, color, icon }) {
  const colorMap = {
    blue: {
      border: 'hover:border-blue-500/20',
      iconBg: 'bg-[rgba(36,31,33,0.07)]',
      iconColor: 'text-[#241F21]'
    },
    green: {
      border: 'hover:border-emerald-500/20',
      iconBg: 'bg-[rgba(36,31,33,0.07)]',
      iconColor: 'text-[#241F21]'
    },
    yellow: {
      border: 'hover:border-amber-500/20',
      iconBg: 'bg-[rgba(36,31,33,0.07)]',
      iconColor: 'text-[#241F21]'
    },
    red: {
      border: 'hover:border-red-500/20',
      iconBg: 'bg-[rgba(36,31,33,0.07)]',
      iconColor: 'text-[#241F21]'
    }
  };

  const style = colorMap[color] || colorMap.blue;

  return (
    <div className={`card p-6 flex items-center justify-between`}>
      <div>
        <p className="text-[14px] font-medium text-[var(--color-text-muted)] mb-1">{label}</p>
        <h3 className="font-syne text-4xl font-bold text-[var(--color-text-primary)]">{value}</h3>
      </div>
      <div className={`w-14 h-14 rounded-[99px] flex items-center justify-center ${style.iconBg} ${style.iconColor}`}>
        {icon}
      </div>
    </div>
  );
}
