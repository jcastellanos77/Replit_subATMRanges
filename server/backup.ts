import { storage } from "./storage";
import { ObjectStorageService } from "./objectStorage";
import archiver from "archiver";
import { Response, Request } from "express";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import yauzl from "yauzl";
import multer from "multer";

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const access = promisify(fs.access);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

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

export interface RestoreResult {
  success: boolean;
  message: string;
  stats: {
    shopsRestored: number;
    logosRestored: number;
    mapsRestored: number;
    errors: string[];
  };
}

// Configure multer for file uploads
export const upload = multer({
  dest: '/tmp/uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  },
});

export class BackupService {
  private objectStorageService: ObjectStorageService;

  constructor() {
    this.objectStorageService = new ObjectStorageService();
  }

  /**
   * Creates a complete backup including data and images
   */
  async createFullBackup(res: Response): Promise<void> {
    try {
      const shops = await storage.getShops();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = `/tmp/backup-${timestamp}`;
      
      // Create directories
      await mkdir(backupDir, { recursive: true });
      await mkdir(path.join(backupDir, 'images'), { recursive: true });
      await mkdir(path.join(backupDir, 'images', 'logos'), { recursive: true });
      await mkdir(path.join(backupDir, 'images', 'maps'), { recursive: true });

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
          // Download logo if it exists
          if (shop.logo && shop.logo !== 'fa-store') {
            const logoFilename = await this.downloadImage(
              shop.logo, 
              path.join(backupDir, 'images', 'logos'), 
              `${shop.id}_logo`
            );
            if (logoFilename) {
              backupData.images.logos[shop.id] = `images/logos/${logoFilename}`;
            }
          }

          // Download map image if it exists
          if (shop.mapImageUrl) {
            const mapFilename = await this.downloadImage(
              shop.mapImageUrl, 
              path.join(backupDir, 'images', 'maps'), 
              `${shop.id}_map`
            );
            if (mapFilename) {
              backupData.images.maps[shop.id] = `images/maps/${mapFilename}`;
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
   * Downloads an image from URL or object storage or local file
   */
  private async downloadImage(imageUrl: string, destinationDir: string, filename: string): Promise<string | null> {
    try {
      let imageBuffer: Buffer;
      let fileExtension = '.jpg'; // default

      if (imageUrl.startsWith('/objects/')) {
        // Handle object storage URLs
        const response = await fetch(`http://localhost:5000${imageUrl}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch object storage image: ${response.statusText}`);
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
        
      } else if (imageUrl.startsWith('/')) {
        // Handle local file references (e.g., /valhalla-logo.jpg)
        const localFilePath = path.join(process.cwd(), 'client', 'public', imageUrl.substring(1));
        
        try {
          imageBuffer = await readFile(localFilePath);
          
          // Determine file extension from the original filename
          const originalExt = path.extname(imageUrl).toLowerCase();
          if (originalExt) {
            fileExtension = originalExt;
          }
        } catch (error) {
          console.warn(`Local file not found: ${localFilePath}`);
          return null;
        }
        
      } else if (imageUrl.startsWith('http')) {
        // Handle external URLs
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch external image: ${response.statusText}`);
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
        
      } else {
        // Unsupported image URL format
        console.warn(`Unsupported image URL format: ${imageUrl}`);
        return null;
      }

      // Save the image file
      const finalFilename = filename + fileExtension;
      const outputPath = path.join(destinationDir, finalFilename);
      await writeFile(outputPath, imageBuffer);
      
      return finalFilename;
    } catch (error) {
      console.error(`Error downloading image ${imageUrl}:`, error);
      return null;
    }
  }

  /**
   * Creates a ZIP response and streams it
   */
  private async createZipResponse(res: Response, sourceDir: string, filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Set response headers
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Create archive
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      archive.pipe(res);
      
      archive.directory(sourceDir, false);
      
      archive.finalize();
      
      archive.on('end', () => {
        resolve();
      });
      
      archive.on('error', (err: Error) => {
        console.error('Archive error:', err);
        reject(err);
      });
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
    
    const imagesWithLogos = shops.filter(shop => shop.logo && shop.logo !== 'fa-store').length;
    const imagesWithMaps = shops.filter(shop => shop.mapImageUrl).length;
    
    // Rough estimate: 100KB per shop data + 200KB per logo + 500KB per map
    const estimatedSize = Math.round(
      (shops.length * 0.1) + 
      (imagesWithLogos * 0.2) + 
      (imagesWithMaps * 0.5)
    );

    return {
      totalShops: shops.length,
      imagesWithLogos,
      imagesWithMaps,
      estimatedSize: estimatedSize > 1 ? `${estimatedSize}MB` : `${Math.round(estimatedSize * 1024)}KB`
    };
  }

  /**
   * Restores shop data and images from a backup ZIP file
   */
  async restoreFromZip(zipFilePath: string): Promise<RestoreResult> {
    const extractDir = `/tmp/restore-${Date.now()}`;
    
    const result: RestoreResult = {
      success: false,
      message: '',
      stats: {
        shopsRestored: 0,
        logosRestored: 0,
        mapsRestored: 0,
        errors: []
      }
    };

    try {
      // Extract ZIP file
      await this.extractZipFile(zipFilePath, extractDir);
      
      // Parse backup data
      const backupData = await this.parseBackupData(path.join(extractDir, 'backup-data.json'));
      
      if (!backupData) {
        throw new Error('Invalid backup file: backup-data.json not found or corrupted');
      }

      // Restore images to object storage
      const imageResults = await this.uploadImagesFromBackup(extractDir, backupData);
      result.stats.logosRestored = imageResults.logosUploaded;
      result.stats.mapsRestored = imageResults.mapsUploaded;
      result.stats.errors.push(...imageResults.errors);

      // Update shop data with new image URLs
      await this.updateShopImageUrls(backupData, imageResults.imageMapping);

      // Restore shops to database
      const shopsRestored = await this.restoreShopsToDatabase(backupData.shops);
      result.stats.shopsRestored = shopsRestored;

      result.success = true;
      result.message = `Successfully restored ${shopsRestored} shops with ${imageResults.logosUploaded} logos and ${imageResults.mapsUploaded} maps`;
      
    } catch (error) {
      console.error('Restoration failed:', error);
      result.message = error instanceof Error ? error.message : 'Unknown error during restoration';
      result.stats.errors.push(result.message);
    } finally {
      // Cleanup temporary files
      await this.cleanupDirectory(extractDir);
      await this.cleanupFile(zipFilePath);
    }

    return result;
  }

  /**
   * Extracts a ZIP file to a destination directory
   */
  private async extractZipFile(zipFilePath: string, extractDir: string): Promise<void> {
    await mkdir(extractDir, { recursive: true });
    
    return new Promise((resolve, reject) => {
      yauzl.open(zipFilePath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!zipfile) {
          reject(new Error('Failed to open ZIP file'));
          return;
        }

        zipfile.readEntry();
        
        zipfile.on('entry', (entry) => {
          if (/\/$/.test(entry.fileName)) {
            // Directory entry
            const dirPath = path.join(extractDir, entry.fileName);
            mkdir(dirPath, { recursive: true }).then(() => {
              zipfile.readEntry();
            }).catch(reject);
          } else {
            // File entry
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                reject(err);
                return;
              }
              
              if (!readStream) {
                zipfile.readEntry();
                return;
              }

              const filePath = path.join(extractDir, entry.fileName);
              const fileDir = path.dirname(filePath);
              
              mkdir(fileDir, { recursive: true }).then(() => {
                const writeStream = fs.createWriteStream(filePath);
                readStream.pipe(writeStream);
                writeStream.on('close', () => {
                  zipfile.readEntry();
                });
                writeStream.on('error', reject);
              }).catch(reject);
            });
          }
        });
        
        zipfile.on('end', () => {
          resolve();
        });
        
        zipfile.on('error', reject);
      });
    });
  }

  /**
   * Parses backup data from JSON file
   */
  private async parseBackupData(jsonFilePath: string): Promise<BackupData | null> {
    try {
      const jsonContent = await readFile(jsonFilePath, 'utf-8');
      return JSON.parse(jsonContent) as BackupData;
    } catch (error) {
      console.error('Failed to parse backup data:', error);
      return null;
    }
  }

  /**
   * Uploads images from backup to object storage
   */
  private async uploadImagesFromBackup(extractDir: string, backupData: BackupData): Promise<{
    logosUploaded: number;
    mapsUploaded: number;
    imageMapping: { [oldPath: string]: string };
    errors: string[];
  }> {
    const result = {
      logosUploaded: 0,
      mapsUploaded: 0,
      imageMapping: {} as { [oldPath: string]: string },
      errors: [] as string[]
    };

    // Upload logos
    const logosDir = path.join(extractDir, 'images', 'logos');
    if (await this.directoryExists(logosDir)) {
      const logoFiles = await readdir(logosDir);
      for (const logoFile of logoFiles) {
        try {
          const logoPath = path.join(logosDir, logoFile);
          const uploadUrl = await this.objectStorageService.getObjectEntityUploadURL();
          
          // Upload file to object storage
          const imageBuffer = await readFile(logoPath);
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: imageBuffer,
            headers: {
              'Content-Type': 'image/jpeg'
            }
          });
          
          if (uploadResponse.ok) {
            const objectPath = this.extractObjectPathFromUrl(uploadUrl);
            result.imageMapping[`images/logos/${logoFile}`] = objectPath;
            result.logosUploaded++;
          } else {
            result.errors.push(`Failed to upload logo: ${logoFile}`);
          }
        } catch (error) {
          result.errors.push(`Error uploading logo ${logoFile}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // Upload maps
    const mapsDir = path.join(extractDir, 'images', 'maps');
    if (await this.directoryExists(mapsDir)) {
      const mapFiles = await readdir(mapsDir);
      for (const mapFile of mapFiles) {
        try {
          const mapPath = path.join(mapsDir, mapFile);
          const uploadUrl = await this.objectStorageService.getObjectEntityUploadURL();
          
          // Upload file to object storage
          const imageBuffer = await readFile(mapPath);
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: imageBuffer,
            headers: {
              'Content-Type': 'image/jpeg'
            }
          });
          
          if (uploadResponse.ok) {
            const objectPath = this.extractObjectPathFromUrl(uploadUrl);
            result.imageMapping[`images/maps/${mapFile}`] = objectPath;
            result.mapsUploaded++;
          } else {
            result.errors.push(`Failed to upload map: ${mapFile}`);
          }
        } catch (error) {
          result.errors.push(`Error uploading map ${mapFile}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    return result;
  }

  /**
   * Updates shop data with new image URLs from object storage
   */
  private async updateShopImageUrls(backupData: BackupData, imageMapping: { [oldPath: string]: string }): Promise<void> {
    for (const shop of backupData.shops) {
      // Update logo URL
      if (shop.id && backupData.images.logos[shop.id]) {
        const oldLogoPath = backupData.images.logos[shop.id];
        if (imageMapping[oldLogoPath]) {
          shop.logo = imageMapping[oldLogoPath];
        }
      }
      
      // Update map URL
      if (shop.id && backupData.images.maps[shop.id]) {
        const oldMapPath = backupData.images.maps[shop.id];
        if (imageMapping[oldMapPath]) {
          shop.mapImageUrl = imageMapping[oldMapPath];
        }
      }
    }
  }

  /**
   * Restores shop data to the database
   */
  private async restoreShopsToDatabase(shops: any[]): Promise<number> {
    let restoredCount = 0;
    
    for (const shop of shops) {
      try {
        // Create new shop (this will generate a new ID)
        const { id, ...shopData } = shop;
        await storage.createShop(shopData);
        restoredCount++;
      } catch (error) {
        console.error(`Failed to restore shop ${shop.name}:`, error);
      }
    }
    
    return restoredCount;
  }

  /**
   * Extracts object path from upload URL
   */
  private extractObjectPathFromUrl(uploadUrl: string): string {
    // Extract the object path from the signed URL
    const url = new URL(uploadUrl);
    const pathParts = url.pathname.split('/');
    const bucketName = pathParts[1];
    const objectName = pathParts.slice(2).join('/');
    return `/objects/uploads/${objectName.split('/').pop()}`;
  }

  /**
   * Checks if a directory exists
   */
  private async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const stats = await stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Recursively cleans up a directory
   */
  private async cleanupDirectory(dirPath: string): Promise<void> {
    try {
      if (await this.directoryExists(dirPath)) {
        const files = await readdir(dirPath);
        
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stats = await stat(filePath);
          
          if (stats.isDirectory()) {
            await this.cleanupDirectory(filePath);
          } else {
            await unlink(filePath);
          }
        }
        
        await rmdir(dirPath);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  /**
   * Cleans up a single file
   */
  private async cleanupFile(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
    } catch (error) {
      console.error('File cleanup error:', error);
    }
  }
}