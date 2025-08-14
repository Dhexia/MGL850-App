import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './tmp/uploads',
    filename: (req, file, callback) => {
      // Generate a short, unique filename
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const extension = extname(file.originalname) || '.jpg';
      callback(null, `${uniqueName}${extension}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, callback) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      callback(null, true);
    } else {
      callback(new Error('Only image files are allowed'), false);
    }
  },
};