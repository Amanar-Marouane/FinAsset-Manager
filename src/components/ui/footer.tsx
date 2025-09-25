const Footer = ({ className = "" }) => {
  return (
    <footer className={`border-t border-gray-200 bg-white py-6 ${className}`}>
      <div className='px-6 text-center'>
        <div className='mb-4 text-gray-600 md:mb-0'>
          <p className='font-medium'>
            NextEdge 2025. Designed & Developed by Amanar Marouane.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer