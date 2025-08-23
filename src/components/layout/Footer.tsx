import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto py-4 px-4">
        <div className="flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Makerlife
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;