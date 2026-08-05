import { Global, Module } from '@nestjs/common';
import { CloudinaryProvider } from '../../config/cloudinary.provider.js';
import { CloudinaryService } from './cloudinary.service.js';

@Global()
@Module({
    providers: [CloudinaryProvider, CloudinaryService],
    exports: [CloudinaryService],
})
export class CloudinaryModule {}
