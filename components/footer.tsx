export function Footer() {
  return (
    <footer className="bg-[#112B3C] text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="font-bold text-lg">HBCH & MPMMCC, Varanas</h3>
            <p className="text-sm text-gray-300">© {new Date().getFullYear()} All Rights Reserved</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <a href="#" className="text-sm text-gray-300 hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-300 hover:text-white">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-gray-300 hover:text-white">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
