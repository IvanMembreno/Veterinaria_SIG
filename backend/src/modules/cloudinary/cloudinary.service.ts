/// <reference types="multer" />
import { Inject, Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
    constructor(@Inject('CLOUDINARY') private readonly cloudinary: typeof v2) {}

    uploadImage(
        file: Express.Multer.File,
        folder = 'veterinaria/mascotas',
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const upload = this.cloudinary.uploader.upload_stream(
                { folder },
                (error, result) => {
                    if (error)
                        return reject(
                            new Error(
                                error.message ||
                                    'Error desconocido en Cloudinary',
                            ),
                        );
                    if (!result)
                        return reject(
                            new Error('No se recibió resultado de Cloudinary'),
                        );
                    resolve(result);
                },
            );
            streamifier.createReadStream(file.buffer).pipe(upload);
        });
    }
}
