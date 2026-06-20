<?php

namespace App\Http\Controllers\Api\V1\CMS;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
            $rules['file'][] = 'image';
            $rules['file'][] = 'max:5120';
        }

        $request->validate($rules);

        $file = $request->file('file');
        $folder = $type === 'video' ? 'cms/videos' : 'cms/images';
        $filename = Str::uuid()->toString().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs($folder, $filename, 'public');

        return response()->json([
            'data' => [
                'url' => asset('storage/'.$path),
                'path' => $path,
                'type' => $type,
            ],
        ]);
    }
}
