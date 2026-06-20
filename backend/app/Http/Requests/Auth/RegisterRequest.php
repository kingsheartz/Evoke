<?php

namespace App\Http\Requests\Auth;

use App\Support\UserValidation;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'phone' => UserValidation::normalizePhone($this->input('phone')),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => UserValidation::emailRules(),
            'phone' => UserValidation::phoneRules(),
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}
