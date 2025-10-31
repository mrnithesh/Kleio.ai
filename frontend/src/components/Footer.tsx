import { Home, Github, Linkedin, ExternalLink } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-muted/40 border-t border-border/40 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">
                Kleio.ai
              </span>
            </div>
            <div className="hidden md:block h-6 w-px bg-border/50" />
            <p className="text-sm text-muted-foreground">
              Built with ❤️ by <span className="font-medium text-foreground">Nithesh</span>
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a 
              href="https://github.com/mrnithesh" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <a 
              href="https://linkedin.com/in/mrnithesh" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>
            <a 
              href="https://nithesh.codes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Portfolio</span>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 mt-6 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>© 2025 Kleio.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
