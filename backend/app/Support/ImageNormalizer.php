<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class ImageNormalizer
{
    private const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'];

    private const ALLOWED_MIMES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/x-webp',
        'image/heic',
        'image/heif',
        'image/heic-sequence',
        'image/heif-sequence',
    ];

    /**
     * @return list<string|callable>
     */
    public static function validationRules(int $maxKb): array
    {
        return [
            'required',
            'file',
            'max:'.$maxKb,
            'extensions:'.implode(',', self::ALLOWED_EXTENSIONS),
            function (string $attribute, mixed $value, \Closure $fail): void {
                if (! $value instanceof UploadedFile || self::isAllowedImage($value)) {
                    return;
                }

                $fail('The '.$attribute.' must be an image (JPEG, PNG, GIF, WebP, or HEIC).');
            },
        ];
    }

    public static function isAllowedImage(UploadedFile $file): bool
    {
        $extension = strtolower($file->getClientOriginalExtension());
        if (in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
            return true;
        }

        $mime = strtolower($file->getMimeType() ?? '');

        if (in_array($mime, self::ALLOWED_MIMES, true)) {
            return true;
        }

        return str_contains($mime, 'heic') || str_contains($mime, 'heif');
    }

    public static function isHeic(UploadedFile $file): bool
    {
        $extension = strtolower($file->getClientOriginalExtension());
        if (in_array($extension, ['heic', 'heif'], true)) {
            return true;
        }

        $mime = strtolower($file->getMimeType() ?? '');

        return str_contains($mime, 'heic') || str_contains($mime, 'heif');
    }

    public static function store(UploadedFile $file, string $directory, string $disk = 'public'): string
    {
        $normalized = self::normalize($file);
        $filename = Str::uuid()->toString().'.'.$normalized['extension'];
        $path = trim($directory, '/').'/'.$filename;

        Storage::disk($disk)->put($path, $normalized['contents']);

        return $path;
    }

    /**
     * @return array{contents: string, extension: string, mime: string}
     */
    public static function normalize(UploadedFile $file): array
    {
        if (! self::isAllowedImage($file)) {
            throw new RuntimeException('Unsupported image type.');
        }

        if (! self::isHeic($file)) {
            return [
                'contents' => file_get_contents($file->getRealPath()),
                'extension' => strtolower($file->getClientOriginalExtension() ?: 'jpg'),
                'mime' => $file->getMimeType() ?? 'application/octet-stream',
            ];
        }

        $converted = self::convertHeicToJpeg($file);
        if ($converted !== null) {
            return $converted;
        }

        throw new RuntimeException(
            'HEIC images must be converted before upload. Install ImageMagick with libheif support on the server.'
        );
    }

    /**
     * @return array{contents: string, extension: string, mime: string}|null
     */
    private static function convertHeicToJpeg(UploadedFile $file): ?array
    {
        $input = $file->getRealPath();
        if ($input === false) {
            return null;
        }

        $output = tempnam(sys_get_temp_dir(), 'heic_');
        if ($output === false) {
            return null;
        }

        $outputPath = $output.'.jpg';
        @unlink($output);

        $commands = [
            ['magick', $input, '-quality', '90', $outputPath],
            ['convert', $input, '-quality', '90', $outputPath],
            ['heif-convert', $input, $outputPath],
        ];

        foreach ($commands as $command) {
            $result = Process::timeout(60)->run($command);
            if ($result->successful() && is_file($outputPath) && filesize($outputPath) > 0) {
                $contents = file_get_contents($outputPath);
                @unlink($outputPath);

                if ($contents === false) {
                    return null;
                }

                return [
                    'contents' => $contents,
                    'extension' => 'jpg',
                    'mime' => 'image/jpeg',
                ];
            }
        }

        @unlink($outputPath);

        return null;
    }
}
