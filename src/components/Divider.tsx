import { memo } from 'react'

const Divider = memo(function Divider({ className = '' }: { className?: string }) {
  return (
    <div className={`h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-white/[0.06] to-transparent ${className}`} />
  )
})

export default Divider
