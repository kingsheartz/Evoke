<?php

return [
    'project_id' => env('FIREBASE_PROJECT_ID'),
    'credentials_path' => env('FIREBASE_CREDENTIALS_PATH'),
    'credentials_json' => env('FIREBASE_CREDENTIALS_JSON'),
    'web_link' => env('FRONTEND_URL', env('APP_URL', 'http://localhost:3000')),
];
