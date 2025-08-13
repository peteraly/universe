import fs from 'fs';
import path from 'path';
import { logger } from './logger';

export interface CSSFix {
  pattern: string;
  replacement: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export class CSSErrorFixer {
  private static readonly CSS_FIXES: CSSFix[] = [
    {
      pattern: 'ring-offset-background',
      replacement: '',
      description: 'Remove invalid ring-offset-background class (not available in Tailwind)',
      severity: 'medium'
    },
    {
      pattern: 'focus-visible:ring-ring',
      replacement: 'focus-visible:ring-primary-500',
      description: 'Replace invalid ring-ring with valid primary color',
      severity: 'medium'
    },
    {
      pattern: 'bg-background',
      replacement: 'bg-white',
      description: 'Replace invalid bg-background with bg-white',
      severity: 'low'
    },
    {
      pattern: 'text-foreground',
      replacement: 'text-gray-900',
      description: 'Replace invalid text-foreground with text-gray-900',
      severity: 'low'
    },
    {
      pattern: 'border-border',
      replacement: 'border-gray-300',
      description: 'Replace invalid border-border with border-gray-300',
      severity: 'low'
    }
  ];

  /**
   * Automatically fix common CSS errors in the project
   */
  static async autoFixCSSErrors(): Promise<{ fixed: number; errors: string[] }> {
    const errors: string[] = [];
    let fixed = 0;

    try {
      // Find all CSS files in the project
      const cssFiles = await this.findCSSFiles();
      
      for (const filePath of cssFiles) {
        try {
          const result = await this.fixCSSFile(filePath);
          fixed += result.fixed;
          errors.push(...result.errors);
        } catch (error) {
          errors.push(`Failed to process ${filePath}: ${error}`);
        }
      }

      logger.info(`CSS auto-fix completed: ${fixed} fixes applied, ${errors.length} errors encountered`);
    } catch (error) {
      errors.push(`CSS auto-fix failed: ${error}`);
      logger.error('CSS auto-fix failed', { error });
    }

    return { fixed, errors };
  }

  /**
   * Find all CSS files in the project
   */
  private static async findCSSFiles(): Promise<string[]> {
    const cssFiles: string[] = [];
    const projectRoot = process.cwd();

    const searchDirs = [
      path.join(projectRoot, 'packages', 'web', 'src'),
      path.join(projectRoot, 'packages', 'web', 'public'),
      path.join(projectRoot, 'src'),
      path.join(projectRoot, 'public')
    ];

    for (const dir of searchDirs) {
      try {
        await fs.promises.access(dir);
        const files = await this.recursiveFindFiles(dir, ['.css', '.scss', '.sass']);
        cssFiles.push(...files);
      } catch (error) {
        // Directory doesn't exist, skip it
      }
    }

    return cssFiles;
  }

  /**
   * Recursively find files with specific extensions
   */
  private static async recursiveFindFiles(dir: string, extensions: string[]): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const items = await fs.promises.readdir(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = await fs.promises.stat(fullPath);
        
        if (stat.isDirectory()) {
          const subFiles = await this.recursiveFindFiles(fullPath, extensions);
          files.push(...subFiles);
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      logger.warn(`Failed to scan directory ${dir}: ${error}`);
    }

    return files;
  }

  /**
   * Fix a single CSS file
   */
  private static async fixCSSFile(filePath: string): Promise<{ fixed: number; errors: string[] }> {
    const errors: string[] = [];
    let fixed = 0;

    try {
      let content = await fs.promises.readFile(filePath, 'utf-8');
      const originalContent = content;

      // Apply all fixes
      for (const fix of this.CSS_FIXES) {
        const regex = new RegExp(fix.pattern, 'g');
        const matches = content.match(regex);
        
        if (matches) {
          content = content.replace(regex, fix.replacement);
          fixed += matches.length;
          
          logger.info(`Applied CSS fix in ${filePath}: ${fix.description}`, {
            file: filePath,
            pattern: fix.pattern,
            replacement: fix.replacement,
            matches: matches.length
          });
        }
      }

      // Write back if changes were made
      if (content !== originalContent) {
        await fs.promises.writeFile(filePath, content, 'utf-8');
        logger.info(`Updated CSS file: ${filePath} (${fixed} fixes applied)`);
      }
    } catch (error) {
      errors.push(`Failed to fix ${filePath}: ${error}`);
    }

    return { fixed, errors };
  }

  /**
   * Check for common CSS errors without fixing them
   */
  static async checkCSSErrors(): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const cssFiles = await this.findCSSFiles();
      
      for (const filePath of cssFiles) {
        try {
          const content = await fs.promises.readFile(filePath, 'utf-8');
          
          for (const fix of this.CSS_FIXES) {
            const regex = new RegExp(fix.pattern, 'g');
            const matches = content.match(regex);
            
            if (matches) {
              const message = `${filePath}: Found ${matches.length} instances of "${fix.pattern}" - ${fix.description}`;
              
              if (fix.severity === 'high') {
                errors.push(message);
              } else {
                warnings.push(message);
              }
            }
          }
        } catch (error) {
          errors.push(`Failed to check ${filePath}: ${error}`);
        }
      }
    } catch (error) {
      errors.push(`CSS check failed: ${error}`);
    }

    return { errors, warnings };
  }

  /**
   * Get a summary of available CSS fixes
   */
  static getAvailableFixes(): CSSFix[] {
    return [...this.CSS_FIXES];
  }
}
