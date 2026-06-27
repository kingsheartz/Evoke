<?php

namespace App\Http\Controllers\Api\V1\CMS;

use App\Http\Controllers\Controller;
use App\Support\ImageNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->can('cms.homepage.manage')
            && ! $user->can('cms.pages.manage')
            && ! $user->can('platform.manage')) {
            abort(403, 'You do not have permission to upload media.');
        }

        $type = $request->input('type', 'image');

        $rules = [
            'file' => ['required', 'file'],
            'type' => ['sometimes', 'in:image,video'],
        ];

        if ($type === 'video') {
            $rules['file'][] = 'mimetypes:video/mp4,video/webm,video/quicktime,video/x-msvideo';
            $rules['file'][] = 'max:51200';
        } else {
            $rules['file'] = ImageNormalizer::validationRules(5120);
        }

        $file = $request->file('file');
        if ($file && ! $file->isValid()) {
            $limit = ini_get('upload_max_filesize');
            $message = match ($file->getError()) {
                UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => "File is too large. Server limit is {$limit}.",
                default => 'The file failed to upload.',
            };
            abort(422, $message);
        }

        $request->validate($rules);

        $folder = $type === 'video' ? 'cms/videos' : 'cms/images';

        try {
            $path = $type === 'video'
                ? $file->store($folder, 'public')
                : ImageNormalizer::store($file, $folder);
        } catch (\RuntimeException $e) {
            abort(422, $e->getMessage());
        }

        return response()->json([
            'data' => [
                'url' => asset('storage/'.$path),
                'path' => $path,
                'type' => $type,
            ],
        ]);
    }
}
