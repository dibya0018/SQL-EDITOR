export function SiteLogo({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="text-[#205375] font-bold text-2xl">MPMMCC</div>
      <div className="text-[#112B3C] text-sm">Admin Panel</div>
    </div>
  )
}
