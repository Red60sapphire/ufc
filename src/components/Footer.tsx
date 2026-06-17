export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-6 mb-4 text-sm text-gray-500">
          <a href="#" className="hover:text-gray-300">Terms of Service</a>
          <a href="#" className="hover:text-gray-300">Privacy Policy</a>
          <a href="#" className="hover:text-gray-300">Contact</a>
          <a href="#" className="hover:text-gray-300">Careers</a>
        </div>
        <p className="text-center text-gray-600 text-xs">
          &copy; {new Date().getFullYear()} UFC.SOLUTIONS. This site is not affiliated with the UFC.
        </p>
      </div>
    </footer>
  );
}
