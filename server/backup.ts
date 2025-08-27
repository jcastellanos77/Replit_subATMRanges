import { storage } from "./storage";
import { ObjectStorageService } from "./objectStorage";
import archiver from "archiver";
import { Response } from "express";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);

export interface BackupData {
  metadata: {
    timestamp: string;
    version: string;
    totalShops: number;
    backupType: 'full' | 'data-only';
  };
  shops: any[];
  images: {
    logos: { [shopId: string]: string };
    maps: { [shopId: string]: string };
  };
}

export class BackupService {
  private objectStorageService: ObjectStorageService;

  constructor() {
    this.objectStorageService = new ObjectStorageService();
  }

  /**
   * Creates a complete backup including data and images
   */
  async createFullBackup(res: Response): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `/tmp/backup-${timestamp}`;
    
    try {
      // Create backup directory
      await mkdir(backupDir, { recursive: true });
      await mkdir(path.join(backupDir, 'images', 'logos'), { recursive: true });
      await mkdir(path.join(backupDir, 'images', 'maps'), { recursive: true });

      // Get all shop data
      const shops = await storage.getShops();
      
      // Create backup metadata
      const backupData: BackupData = {
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0",
          totalShops: shops.length,
          backupType: 'full'
        },
        shops: shops,
        images: {
          logos: {},
          maps: {}
        }
      };

      // Download images for each shop
      for (const shop of shops) {
        try {
          // Download logo if it's not a FontAwesome icon
          if (shop.logo && !shop.logo.startsWith('fas ') && !shop.logo.startsWith('fab ')) {
            const logoPath = await this.downloadImage(shop.logo, path.join(backupDir, 'images', 'logos'), `${shop.id}-logo`);
            if (logoPath) {
              backupData.images.logos[shop.id] = logoPath;
            }
          }

          // Download map image
          if (shop.mapImageUrl) {
            const mapPath = await this.downloadImage(shop.mapImageUrl, path.join(backupDir, 'images', 'maps'), `${shop.id}-map`);
            if (mapPath) {
              backupData.images.maps[shop.id] = mapPath;
            }
          }
        } catch (error) {
          console.error(`Error downloading images for shop ${shop.name}:`, error);
          // Continue with other shops even if one fails
        }
      }

      // Save backup data as JSON
      await writeFile(
        path.join(backupDir, 'backup-data.json'),
        JSON.stringify(backupData, null, 2)
      );

      // Create README for the backup
      const readmeContent = `# ATM Tiendas Backup
Generated: ${backupData.metadata.timestamp}
Total Shops: ${backupData.metadata.totalShops}
Backup Type: ${backupData.metadata.backupType}

## Structure:
- backup-data.json: Complete shop data with metadata
- images/logos/: Shop logo images
- images/maps/: Shop map images
- README.md: This file

## Restoration:
Use the backup-data.json file to restore shop information.
Images are organized by shop ID with appropriate file extensions.
`;

      await writeFile(path.join(backupDir, 'README.md'), readmeContent);

      // Create ZIP archive and stream to response
      await this.createZipResponse(res, backupDir, `atm-tiendas-backup-${timestamp}.zip`);

    } catch (error) {
      console.error('Backup creation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: 'Backup creation failed', error: errorMessage });
    }
  }

  /**
   * Creates a data-only backup (no images)
   */
  async createDataBackup(res: Response): Promise<void> {
    try {
      const shops = await storage.getShops();
      
      const backupData: BackupData = {
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0",
          totalShops: shops.length,
          backupType: 'data-only'
        },
        shops: shops,
        images: {
          logos: {},
          maps: {}
        }
      };

      // Set response headers for file download
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="atm-tiendas-data-${timestamp}.json"`);
      
      res.json(backupData);
    } catch (error) {
      console.error('Data backup creation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: 'Data backup creation failed', error: errorMessage });
    }
  }

  /**
   * Downloads an image from URL or object storage
   */
  private async downloadImage(imageUrl: string, destinationDir: string, filename: string): Promise<string | null> {
    try {
      let imageBuffer: Buffer;
      let fileExtension = '.jpg'; // default

      if (imageUrl.startsWith('/objects/') || imageUrl.startsWith('http')) {
        // Handle object storage or external URLs
        const response = await fetch(imageUrl.startsWith('/') ? `http://localhost:5000${imageUrl}` : imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        imageBuffer = Buffer.from(await response.arrayBuffer());
        
        // Try to determine file extension from content-type or URL
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('png')) fileExtension = '.png';
        else if (contentType?.includes('gif')) fileExtension = '.gif';
        else if (contentType?.includes('webp')) fileExtension = '.webp';
        else if (imageUrl.includes('.png')) fileExtension = '.png';
        else if (imageUrl.includes('.gif')) fileExtension = '.gif';
        else if (imageUrl.includes('.webp')) fileExtension = '.webp';
        
      } else if (imageUrl.startsWith('http')) {
        // Handle external URLs (like Unsplash)
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch external image: ${response.statusText}`);
        }
        
        imageBuffer = Buffer.from(await response.arrayBuffer());
        
        // Determine extension from URL or content-type
        if (imageUrl.includes('.png')) fileExtension = '.png';
        else if (imageUrl.includes('.gif')) fileExtension = '.gif';
        else if (imageUrl.includes('.webp')) fileExtension = '.webp';
      } else {
        return null; // Skip non-downloadable images
      }

      const finalPath = path.join(destinationDir, `${filename}${fileExtension}`);
      await writeFile(finalPath, imageBuffer);
      
      return `images/${path.basename(destinationDir)}/${filename}${fileExtension}`;
    } catch (error) {
      console.error(`Failed to download image ${imageUrl}:`, error);
      return null;
    }
  }

  /**
   * Creates a ZIP file and streams it to the response
   */
  private async createZipResponse(res: Response, sourceDir: string, filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      archive.pipe(res);

      archive.directory(sourceDir, false);

      archive.on('error', (err: Error) => {
        console.error('Archive error:', err);
        reject(err);
      });

      archive.on('end', () => {
        resolve();
      });

      archive.finalize();
    });
  }

  /**
   * Gets backup statistics
   */
  async getBackupStats(): Promise<{
    totalShops: number;
    imagesWithLogos: number;
    imagesWithMaps: number;
    estimatedSize: string;
  }> {
    const shops = await storage.getShops();
    
    const imagesWithLogos = shops.filter(shop => 
      shop.logo && !shop.logo.startsWith('fas ') && !shop.logo.startsWith('fab ')
    ).length;
    
    const imagesWithMaps = shops.filter(shop => shop.mapImageUrl).length;
    
    // Rough estimation: 50KB per shop data + 100KB per logo + 200KB per map
    const estimatedSize = Math.round(
      (shops.length * 0.05) + 
      (imagesWithLogos * 0.1) + 
      (imagesWithMaps * 0.2)
    );

    return {
      totalShops: shops.length,
      imagesWithLogos,
      imagesWithMaps,
      estimatedSize: estimatedSize > 1 ? `${estimatedSize}MB` : `${Math.round(estimatedSize * 1024)}KB`
    };
  }
}