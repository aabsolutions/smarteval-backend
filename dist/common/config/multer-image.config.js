"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerImageConfig = void 0;
const common_1 = require("@nestjs/common");
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
exports.multerImageConfig = {
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
    },
    fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            callback(new common_1.BadRequestException('Solo se permiten imágenes JPEG, PNG o WEBP'), false);
            return;
        }
        callback(null, true);
    },
};
//# sourceMappingURL=multer-image.config.js.map