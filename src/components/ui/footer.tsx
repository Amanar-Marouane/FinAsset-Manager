const Footer = ({ className = "" }) => {
  return (
    <footer className={`border-t border-border bg-card py-6 ${className}`}>
      <div className='px-6 text-center'>
        <div className='mb-4 text-muted-foreground md:mb-0'>
          <p className='font-medium'>
            NextEdge
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer