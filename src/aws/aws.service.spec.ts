import { Test, TestingModule } from '@nestjs/testing';
import { AwsService } from './aws.service';
import { ConfigService } from '@nestjs/config';
import { Upload } from '@aws-sdk/lib-storage';
import { InternalServerErrorException } from '@nestjs/common';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/lib-storage');

describe('AwsService', () => {
  let service: AwsService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        'aws.region': 'us-east-1',
        'aws.buckets.avatars': 'avatars-bucket',
        'aws.buckets.thumbnails': 'thumbnails-bucket',
        'aws.buckets.courses': 'courses-bucket',
        'aws.buckets.notes': 'notes-bucket',
        'aws.accessKeyId': 'test-access-key',
        'aws.secretAccessKey': 'test-secret-key',
      };
      return config[key];
    }),
  };

  const mockFile = {
    originalname: 'test file.png',
    buffer: Buffer.from('test buffer'),
    mimetype: 'image/png',
  } as unknown as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AwsService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AwsService>(AwsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload methods', () => {
    const scenarios = [
      { method: 'uploadAvatar' as const, bucket: 'avatars-bucket' },
      { method: 'uploadThumbnail' as const, bucket: 'thumbnails-bucket' },
      { method: 'uploadCourseVideo' as const, bucket: 'courses-bucket' },
      { method: 'uploadNoteFile' as const, bucket: 'notes-bucket' },
    ];

    scenarios.forEach(({ method, bucket }) => {
      it(`should upload a file to ${bucket} using ${method}`, async () => {
        const mockDone = jest.fn().mockResolvedValue({});
        const mockOn = jest.fn();
        (Upload as unknown as jest.Mock).mockImplementation(() => ({
          done: mockDone,
          on: mockOn,
        }));

        const result = await service[method](mockFile);

        expect(Upload).toHaveBeenCalledWith(
          expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            params: expect.objectContaining({
              Bucket: bucket,
              Body: mockFile.buffer,
              ContentType: mockFile.mimetype,
            }),
          }),
        );
        expect(mockDone).toHaveBeenCalled();
        expect(result).toContain(bucket);
        expect(result).toContain('test-file.png'); // Space replaced by dash
      });
    });

    it('should track progress if callback is provided', async () => {
      const mockOn = jest.fn(
        (
          event: string,
          cb: (progress: { loaded?: number; total?: number }) => void,
        ) => {
          if (event === 'httpUploadProgress') {
            cb({ loaded: 50, total: 100 });
          }
        },
      );
      const mockDone = jest.fn().mockResolvedValue({});
      (Upload as unknown as jest.Mock).mockImplementation(() => ({
        done: mockDone,
        on: mockOn,
      }));

      const onProgress = jest.fn();
      await service.uploadAvatar(mockFile, onProgress);

      expect(onProgress).toHaveBeenCalledWith(50);
    });

    it('should throw InternalServerErrorException on upload failure', async () => {
      const mockDone = jest.fn().mockRejectedValue(new Error('S3 Failure'));
      (Upload as unknown as jest.Mock).mockImplementation(() => ({
        done: mockDone,
        on: jest.fn(),
      }));

      await expect(service.uploadAvatar(mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
