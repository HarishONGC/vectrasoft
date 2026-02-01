export function Footer({ className = '' }: { className?: string }) {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className={`bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 dark:from-blue-950/30 dark:via-blue-900/30 dark:to-blue-950/30 border-t border-blue-200/50 dark:border-blue-800/50 backdrop-blur-md ${className}`}>
      <div className="px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img 
              src="/vectrasoft-logo.svg" 
              alt="VectraSoft Technologies" 
              className="h-6 w-auto opacity-80 dark:opacity-60"
            />
            <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
              © {currentYear} VectraSoft Technologies. All rights reserved.
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-blue-600 dark:text-blue-400">
            <a href="#" className="hover:text-blue-800 dark:hover:text-blue-200 transition">Privacy</a>
            <span className="text-blue-400 dark:text-blue-600">•</span>
            <a href="#" className="hover:text-blue-800 dark:hover:text-blue-200 transition">Terms</a>
            <span className="text-blue-400 dark:text-blue-600">•</span>
            <a href="#" className="hover:text-blue-800 dark:hover:text-blue-200 transition">Support</a>
            <span className="text-blue-400 dark:text-blue-600">•</span>
            <span className="text-blue-700 dark:text-blue-300">v3.7.2 (Build 1202)</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
