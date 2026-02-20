import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createListingDto: CreateListingDto, @Request() req) {
    return this.listingsService.create(createListingDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.listingsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMy(@Request() req) {
    return this.listingsService.findByHost(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const name = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${name}${extname(file.originalname) || '.jpg'}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, cb) => {
        const allowed = /^image\/(jpeg|png|gif|webp)$/;
        if (allowed.test(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only images (JPEG, PNG, GIF, WebP) allowed'), false);
        }
      },
    }),
  )
  uploadImage(@UploadedFile() file: { filename: string } | undefined) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }
    return { url: `/uploads/${file.filename}` };
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.listingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateListingDto: UpdateListingDto,
    @Request() req,
  ) {
    return this.listingsService.update(id, updateListingDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.listingsService.remove(id, req.user.userId);
  }
}
