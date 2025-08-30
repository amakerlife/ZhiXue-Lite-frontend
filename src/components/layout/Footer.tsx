import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto py-4 px-4">
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} Makerlife</p>
          <span>|</span>
          <Link
            to="/privacy-policy"
            className="hover:text-foreground transition-colors"
          >
            隐私政策
          </Link>
          {/* <span>|</span>
          <Link
            to="/data-deletion"
            className="hover:text-foreground transition-colors"
          >
            数据删除请求
          </Link> */}
          <span>|</span>
          <Link
            to="/disclaimer"
            className="hover:text-foreground transition-colors"
          >
            免责声明
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;